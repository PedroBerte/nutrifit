using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class RoleService : IRoleService
{
    private readonly NutrifitContext _context;
    public RoleService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<List<Role>> GetAllAsync()
    {
        try
        {
            return await _context.Role.ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar roles.", ex);
        }
    }

    public async Task<Role> GetByIdAsync(Guid id)
    {
        try
        {
            var role = await _context.Role.FindAsync(id);
            if (role == null)
                throw new InvalidOperationException("Role não encontrado.");
            return role;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar role.", ex);
        }
    }

    public async Task<Role> AddAsync(Role role)
    {
        try
        {
            role.Id = Guid.NewGuid();
            _context.Role.Add(role);
            await _context.SaveChangesAsync();
            return role;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar role.", ex);
        }
    }

    public async Task<Role> UpdateAsync(Role role)
    {
        try
        {
            var existing = await _context.Role.FindAsync(role.Id);
            if (existing == null)
                throw new InvalidOperationException("Role não encontrado para atualização.");
            _context.Entry(existing).CurrentValues.SetValues(role);
            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar role.", ex);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var role = await _context.Role.FindAsync(id);
            if (role == null)
                throw new InvalidOperationException("Role não encontrado para exclusão.");
            _context.Role.Remove(role);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir role.", ex);
        }
    }
}
