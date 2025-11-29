using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services;

public class BondService : IBondService
{
    private readonly NutrifitContext _context;
    private readonly IPushService _pushService;

    public BondService(NutrifitContext context, IPushService pushService)
    {
        _context = context;
        _pushService = pushService;
    }

    public async Task<List<CustomerProfessionalBondEntity>> GetAllAsync()
    {
        try
        {
            return await _context.CustomerProfessionalBonds
                .Include(x => x.Customer)
                    .ThenInclude(c => c.Profile)
                .Include(x => x.Professional)
                    .ThenInclude(p => p.Profile)
                .Include(x => x.Sender)
                    .ThenInclude(s => s.Profile)
                .Include(x => x.Appointments)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar vínculos cliente-profissional.", ex);
        }
    }

    public async Task<CustomerProfessionalBondEntity> GetByIdAsync(Guid id)
    {
        try
        {
            var bond = await _context.CustomerProfessionalBonds
                .Include(x => x.Customer)
                    .ThenInclude(c => c.Profile)
                .Include(x => x.Professional)
                    .ThenInclude(p => p.Profile)
                .Include(x => x.Sender)
                    .ThenInclude(s => s.Profile)
                .Include(x => x.Appointments)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (bond is null)
                throw new InvalidOperationException("Vínculo cliente-profissional não encontrado.");

            return bond;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar vínculo cliente-profissional.", ex);
        }
    }

    public async Task<CustomerProfessionalBondEntity> AddAsync(CustomerProfessionalBondEntity bond)
    {
        try
        {

            var validation = await _context.CustomerProfessionalBonds.FirstOrDefaultAsync(x => x.CustomerId == bond.CustomerId && x.ProfessionalId == bond.ProfessionalId && bond.Status == "A");
            if (validation is not null)
                throw new InvalidDataException("Já existe uma solicitação/vínculo entre os associados.");

            bond.Id = Guid.NewGuid();
            bond.CreatedAt = DateTime.UtcNow;
            bond.Status = "P";

            _context.CustomerProfessionalBonds.Add(bond);
            await _context.SaveChangesAsync();

            var customer = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == bond.SenderId);

            var pushMessage = new
            {
                title = "Nova proposta!",
                body = customer is null ? $"Você tem uma nova proposta!" : $"{customer.Name} te enviou uma proposta!"
            };

            await _pushService.SendToUserAsync(bond.ProfessionalId, pushMessage);

            return bond;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar vínculo cliente-profissional.", ex);
        }
    }

    public async Task<CustomerProfessionalBondEntity> UpdateAsync(CustomerProfessionalBondEntity bond)
    {
        try
        {
            var existing = await _context.CustomerProfessionalBonds.FindAsync(bond.Id);
            if (existing == null)
                throw new InvalidOperationException("Vínculo cliente-profissional não encontrado para atualização.");

            _context.Entry(existing).CurrentValues.SetValues(bond);
            existing.UpdatedAt = DateTime.UtcNow;

            // Se o vínculo foi cancelado (C) ou rejeitado (R), remover as rotinas associadas
            if (bond.Status == "C" || bond.Status == "R")
            {
                var customerRoutines = await _context.CustomerRoutines
                    .Include(cr => cr.Routine)
                    .Where(cr => cr.CustomerId == existing.CustomerId
                              && cr.Routine.PersonalId == existing.ProfessionalId
                              && cr.Status == "A")
                    .ToListAsync();

                foreach (var routine in customerRoutines)
                {
                    routine.Status = "I"; // Inativar as rotinas
                    routine.UpdatedAt = DateTime.UtcNow;
                }
            }


            var personalId = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == bond.ProfessionalId);
            var action = string.Empty;

            switch (bond.Status)
            {
                case "C":
                    action = "cancelou";
                    break;
                case "A":
                    action = "aceitou";
                    break;
                case "R":
                    action = "rejeitou";
                    break;
            }

            var pushMessage = new
            {
                title = "Atualização de vínculo.",
                body = personalId is null ? $"Seu personal {action} o vínculo!" : $"{personalId.Name} {action} o vínculo!"
            };

            await _pushService.SendToUserAsync(bond.CustomerId, pushMessage);

            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar vínculo cliente-profissional.", ex);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var bond = await _context.CustomerProfessionalBonds.FindAsync(id);
            if (bond == null)
                throw new InvalidOperationException("Vínculo cliente-profissional não encontrado para exclusão.");

            _context.CustomerProfessionalBonds.Remove(bond);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir vínculo cliente-profissional.", ex);
        }
    }

    public async Task<List<CustomerProfessionalBondEntity>> GetBySenderIdAsync(Guid senderId)
    {
        try
        {
            return await _context.CustomerProfessionalBonds
                .Include(x => x.Customer)
                    .ThenInclude(c => c.Profile)
                .Include(x => x.Professional)
                    .ThenInclude(p => p.Profile)
                .Include(x => x.Sender)
                    .ThenInclude(s => s.Profile)
                .Include(x => x.Appointments)
                .Where(x => x.SenderId == senderId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar vínculos enviados pelo usuário.", ex);
        }
    }

    public async Task<List<CustomerProfessionalBondEntity>> GetByCustomerIdAsync(Guid customerId)
    {
        try
        {
            return await _context.CustomerProfessionalBonds
                .Include(x => x.Customer)
                    .ThenInclude(c => c.Profile)
                .Include(x => x.Professional)
                    .ThenInclude(p => p.Profile)
                .Include(x => x.Sender)
                    .ThenInclude(s => s.Profile)
                .Include(x => x.Appointments)
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar vínculos do cliente.", ex);
        }
    }

    public async Task<List<CustomerProfessionalBondEntity>> GetByProfessionalIdAsync(Guid professionalId)
    {
        try
        {
            return await _context.CustomerProfessionalBonds
                .Include(x => x.Customer)
                    .ThenInclude(c => c.Profile)
                .Include(x => x.Professional)
                    .ThenInclude(p => p.Profile)
                .Include(x => x.Sender)
                    .ThenInclude(s => s.Profile)
                .Include(x => x.Appointments)
                .Where(x => x.ProfessionalId == professionalId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar vínculos do profissional.", ex);
        }
    }

    public async Task<List<CustomerProfessionalBondEntity>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            return await _context.CustomerProfessionalBonds
                .Include(x => x.Customer)
                    .ThenInclude(c => c.Profile)
                .Include(x => x.Professional)
                    .ThenInclude(p => p.Profile)
                .Include(x => x.Sender)
                    .ThenInclude(s => s.Profile)
                .Include(x => x.Appointments)
                .Where(x => x.CustomerId == userId || x.ProfessionalId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar vínculos do usuário.", ex);
        }
    }

    public async Task<List<CustomerProfessionalBondEntity>> GetReceivedByUserIdAsync(Guid userId)
    {
        try
        {
            return await _context.CustomerProfessionalBonds
                .Include(x => x.Customer)
                    .ThenInclude(c => c.Profile)
                .Include(x => x.Professional)
                    .ThenInclude(p => p.Profile)
                .Include(x => x.Sender)
                    .ThenInclude(s => s.Profile)
                .Include(x => x.Appointments)
                .Where(x => (x.CustomerId == userId || x.ProfessionalId == userId) && x.SenderId != userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar vínculos recebidos pelo usuário.", ex);
        }
    }

    public async Task<ApiResponse> GetActiveStudentsAsync(Guid professionalId, int page, int pageSize, string? searchTerm)
    {
        try
        {
            // Query base: vínculos ativos onde o usuário é o profissional
            var query = _context.CustomerProfessionalBonds
                .Include(x => x.Customer)
                    .ThenInclude(c => c.Profile)
                .Include(x => x.Customer.Address)
                .Where(x => x.ProfessionalId == professionalId && x.Status == "A");

            // Aplicar busca por nome, email ou telefone
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var searchLower = searchTerm.ToLower();
                query = query.Where(x =>
                    x.Customer.Name.ToLower().Contains(searchLower) ||
                    x.Customer.Email.ToLower().Contains(searchLower) ||
                    (x.Customer.PhoneNumber != null && x.Customer.PhoneNumber.Contains(searchTerm))
                );
            }

            // Contar total de itens
            var totalItems = await query.CountAsync();

            // Aplicar paginação
            var bonds = await query
                .OrderBy(x => x.Customer.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Mapear para DTO simplificado focado no aluno
            var students = bonds.Select(b => new
            {
                bondId = b.Id,
                studentId = b.CustomerId,
                studentName = b.Customer.Name,
                studentEmail = b.Customer.Email,
                studentPhone = b.Customer.PhoneNumber,
                studentDateOfBirth = b.Customer.DateOfBirth,
                studentSex = b.Customer.Sex,
                studentImageUrl = b.Customer.ImageUrl,
                bondCreatedAt = b.CreatedAt,
                bondStatus = b.Status
            }).ToList();

            var response = new
            {
                items = students,
                pagination = new
                {
                    currentPage = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
                    totalCount = totalItems
                }
            };

            return ApiResponse.CreateSuccess("Alunos encontrados.", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar alunos: {ex.Message}");
        }
    }
}