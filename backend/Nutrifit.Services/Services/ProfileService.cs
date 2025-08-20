using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class ProfileService : IProfileService
{
    private readonly NutrifitContext _context;
    public ProfileService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<List<Profile>> GetAllAsync()
    {
        try
        {
            return await _context.Profile.ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar perfis.", ex);
        }
    }

    public async Task<Profile> GetByIdAsync(Guid id)
    {
        try
        {
            var profile = await _context.Profile.FindAsync(id);
            if (profile == null)
                throw new InvalidOperationException("Perfil não encontrado.");
            return profile;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar perfil.", ex);
        }
    }

    public async Task<Profile> AddAsync(Profile profile)
    {
        try
        {
            profile.Id = Guid.NewGuid();
            profile.CreatedAt = DateTime.UtcNow;
            _context.Profile.Add(profile);
            await _context.SaveChangesAsync();
            return profile;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar perfil.", ex);
        }
    }

    public async Task<Profile> UpdateAsync(Profile profile)
    {
        try
        {
            var existing = await _context.Profile.FindAsync(profile.Id);
            if (existing == null)
                throw new InvalidOperationException("Perfil não encontrado para atualização.");
            _context.Entry(existing).CurrentValues.SetValues(profile);
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar perfil.", ex);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var profile = await _context.Profile.FindAsync(id);
            if (profile == null)
                throw new InvalidOperationException("Perfil não encontrado para exclusão.");
            _context.Profile.Remove(profile);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir perfil.", ex);
        }
    }
}
