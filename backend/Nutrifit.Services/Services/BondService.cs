using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class BondService : IBondService
{
    private readonly NutrifitContext _context;
    
    public BondService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<List<CustomerProfessionalBond>> GetAllAsync()
    {
        try
        {
            return await _context.CustomerProfessionalBond
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

    public async Task<CustomerProfessionalBond> GetByIdAsync(Guid id)
    {
        try
        {
            var bond = await _context.CustomerProfessionalBond
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

    public async Task<CustomerProfessionalBond> AddAsync(CustomerProfessionalBond bond)
    {
        try
        {
            bond.Id = Guid.NewGuid();
            bond.CreatedAt = DateTime.UtcNow;
            bond.Status = "A";
            
            _context.CustomerProfessionalBond.Add(bond);
            await _context.SaveChangesAsync();
            
            return bond;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar vínculo cliente-profissional.", ex);
        }
    }

    public async Task<CustomerProfessionalBond> UpdateAsync(CustomerProfessionalBond bond)
    {
        try
        {
            var existing = await _context.CustomerProfessionalBond.FindAsync(bond.Id);
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
            var bond = await _context.CustomerProfessionalBond.FindAsync(id);
            if (bond == null)
                throw new InvalidOperationException("Vínculo cliente-profissional não encontrado para exclusão.");
                
            _context.CustomerProfessionalBond.Remove(bond);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir vínculo cliente-profissional.", ex);
        }
    }
}