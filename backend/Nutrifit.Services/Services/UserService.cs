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

    public async Task<List<User>> GetAllAsync()
    {
        try
        {
            return await _context.User.Include(x => x.Address).ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar usuários.", ex);
        }
    }

    public async Task<User> GetByIdAsync(Guid id)
    {
        try
        {
            var user = await _context.User.Include(x => x.Address).FirstOrDefaultAsync(x => x.Id == id);
            if (user is null)
                throw new InvalidOperationException("Usuário não encontrado.");
            return user;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar usuário.", ex);
        }
    }

    public async Task<User> AddAsync(User user)
    {
        try
        {
            user.Id = Guid.NewGuid();
            user.Status = "A";
            _context.User.Add(user);

            if (user.Address != null)
            {
                user.Address.Id = Guid.NewGuid();
                user.Address.Status = "A";
                _context.Address.Add(user.Address);
            }

            await _context.SaveChangesAsync();
            return user;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar usuário.", ex);
        }
    }

    public async Task<User> UpdateAsync(User user)
    {
        try
        {
            var existing = await _context.User.FindAsync(user.Id);
            if (existing == null)
                throw new InvalidOperationException("Usuário não encontrado para atualização.");
            _context.Entry(existing).CurrentValues.SetValues(user);
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar usuário.", ex);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var user = await _context.User.FindAsync(id);
            if (user == null)
                throw new InvalidOperationException("Usuário não encontrado para exclusão.");
            _context.User.Remove(user);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir usuário.", ex);
        }
    }
}
