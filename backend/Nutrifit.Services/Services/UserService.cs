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
                .Include(x => x.ProfessionalDetails)
                .Include(x => x.Profile)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar usuários.", ex);
        }
    }

    public async Task<UserEntity> GetByIdAsync(Guid id)
    {
        try
        {
            var user = await _context.Users
                .Include(x => x.Address)
                .Include(x => x.ProfessionalCredential)
                .Include(x => x.ProfessionalDetails)
                .Include(x => x.Profile)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (user is null)
                throw new InvalidOperationException("Usuário não encontrado.");
            return user;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar usuário.", ex);
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
                throw new InvalidOperationException("Usuário não encontrado para exclusão.");
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir usuário.", ex);
        }
    }

    public async Task<List<CustomerFeedbackEntity>> GetProfessionalFeedbacksAsync(Guid professionalId)
    {
        try
        {
            return await _context.CustomerFeedbacks
                .Include(f => f.Customer)
                .Where(f => f.ProfessionalId == professionalId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar feedbacks do profissional.", ex);
        }
    }

    public static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // Raio da Terra em km
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
}
