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

    public async Task<List<ProfileEntity>> GetAllAsync()
    {
        try
        {
            return await _context.Profiles.ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar perfis.", ex);
        }
    }

    public async Task<ProfileEntity> GetByIdAsync(Guid id)
    {
        try
        {
            var profile = await _context.Profiles.FindAsync(id);
            if (profile == null)
                throw new InvalidOperationException("Perfil não encontrado.");
            return profile;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar perfil.", ex);
        }
    }

    public async Task<ProfileEntity> AddAsync(ProfileEntity profile)
    {
        try
        {
            profile.Id = Guid.NewGuid();
            profile.CreatedAt = DateTime.UtcNow;
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();
            return profile;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar perfil.", ex);
        }
    }

    public async Task<ProfileEntity> UpdateAsync(ProfileEntity profile)
    {
        try
        {
            var existing = await _context.Profiles.FindAsync(profile.Id);
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
            var profile = await _context.Profiles.FindAsync(id);
            if (profile == null)
                throw new InvalidOperationException("Perfil não encontrado para exclusão.");
            _context.Profiles.Remove(profile);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir perfil.", ex);
        }
    }
}
