using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class UserService : IUserService
{
    private readonly NutrifitContext _context;
    public UserService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<List<UserEntity>> GetAllAsync()
    {
        try
        {
            return await _context.Users
                .Include(x => x.Address)
                .Include(x => x.ProfessionalCredential)
                .Include(x => x.Profile)
                .Include(x => x.CustomerProfessionalBonds)
                .ThenInclude(x => x.Appointments)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar usu�rios.", ex);
        }
    }

    public async Task<UserEntity> GetByIdAsync(Guid id)
    {
        try
        {
            var user = await _context.Users
                .Include(x => x.Address)
                .Include(x => x.ProfessionalCredential)
                .Include(x => x.Profile)
                .Include(x => x.CustomerProfessionalBonds)
                .ThenInclude(x => x.Professional)
                .Include(x => x.CustomerProfessionalBonds)
                .ThenInclude(x => x.Appointments)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (user is null)
                throw new InvalidOperationException("Usu�rio n�o encontrado.");
            return user;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar usu�rio.", ex);
        }
    }

    public async Task<UserEntity> AddAsync(UserEntity user)
    {
        try
        {
            user.Id = Guid.NewGuid();
            user.Status = "A";
            _context.Users.Add(user);

            if (user.Address != null)
            {
                user.Address.Id = Guid.NewGuid();
                user.Address.Status = "A";
                _context.Addresses.Add(user.Address);
            }

            await _context.SaveChangesAsync();
            return user;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar usu�rio.", ex);
        }
    }

    public async Task<UserEntity> UpdateAsync(UserEntity user)
    {
        try
        {
            var existing = await _context.Users.FindAsync(user.Id);
            if (existing == null)
                throw new InvalidOperationException("Usu�rio n�o encontrado para atualiza��o.");
            _context.Entry(existing).CurrentValues.SetValues(user);
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar usu�rio.", ex);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new InvalidOperationException("Usu�rio n�o encontrado para exclus�o.");
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir usu�rio.", ex);
        }
    }
}
