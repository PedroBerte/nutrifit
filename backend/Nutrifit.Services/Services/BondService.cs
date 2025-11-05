using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

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

            var validation = await _context.CustomerProfessionalBonds.FirstOrDefaultAsync(x => x.CustomerId == bond.CustomerId && x.ProfessionalId == bond.ProfessionalId);
            if (validation is not null)
                throw new InvalidDataException("Já existe uma solicitação/vínculo entre os associados.");

            bond.Id = Guid.NewGuid();
            bond.CreatedAt = DateTime.UtcNow;
            bond.Status = "P";
            
            _context.CustomerProfessionalBonds.Add(bond);
            await _context.SaveChangesAsync();

            var pushMessage = new
            {
                title = "Nova solicitação!",
                body = $"Você tem uma nova proposta!"
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
}