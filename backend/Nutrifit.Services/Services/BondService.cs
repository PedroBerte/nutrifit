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
}