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
            throw new Exception("Erro ao buscar v�nculos cliente-profissional.", ex);
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
                throw new InvalidOperationException("V�nculo cliente-profissional n�o encontrado.");

            return bond;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar v�nculo cliente-profissional.", ex);
        }
    }

    public async Task<CustomerProfessionalBondEntity> AddAsync(CustomerProfessionalBondEntity bond)
    {
        try
        {

            var validation = await _context.CustomerProfessionalBonds.FirstOrDefaultAsync(x => x.CustomerId == bond.CustomerId && x.ProfessionalId == bond.ProfessionalId);
            if (validation is not null)
                throw new InvalidDataException("J� existe uma solicita��o/v�nculo entre os associados.");

            bond.Id = Guid.NewGuid();
            bond.CreatedAt = DateTime.UtcNow;
            bond.Status = "P";

            _context.CustomerProfessionalBonds.Add(bond);
            await _context.SaveChangesAsync();

            var pushMessage = new
            {
                title = "Nova solicita��o!",
                body = $"Voc� tem uma nova proposta!"
            };

            await _pushService.SendToUserAsync(bond.ProfessionalId, pushMessage);

            return bond;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar v�nculo cliente-profissional.", ex);
        }
    }

    public async Task<CustomerProfessionalBondEntity> UpdateAsync(CustomerProfessionalBondEntity bond)
    {
        try
        {
            var existing = await _context.CustomerProfessionalBonds.FindAsync(bond.Id);
            if (existing == null)
                throw new InvalidOperationException("V�nculo cliente-profissional n�o encontrado para atualiza��o.");

            _context.Entry(existing).CurrentValues.SetValues(bond);
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar v�nculo cliente-profissional.", ex);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var bond = await _context.CustomerProfessionalBonds.FindAsync(id);
            if (bond == null)
                throw new InvalidOperationException("V�nculo cliente-profissional n�o encontrado para exclus�o.");

            _context.CustomerProfessionalBonds.Remove(bond);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir v�nculo cliente-profissional.", ex);
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
            throw new Exception("Erro ao buscar v�nculos enviados pelo usu�rio.", ex);
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
            throw new Exception("Erro ao buscar v�nculos do cliente.", ex);
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
            throw new Exception("Erro ao buscar v�nculos do profissional.", ex);
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
            throw new Exception("Erro ao buscar v�nculos do usu�rio.", ex);
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
            throw new Exception("Erro ao buscar v�nculos recebidos pelo usu�rio.", ex);
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