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
            throw new Exception("Erro ao criar usuário.", ex);
        }
    }

    public async Task<UserEntity> UpdateAsync(UserEntity user)
    {
        try
        {
            var existing = await _context.Users
                .Include(x => x.Address)
                .Include(x => x.ProfessionalCredential)
                .Include(x => x.Profile)
                .FirstOrDefaultAsync(x => x.Id == user.Id);

            if (existing == null)
                throw new InvalidOperationException("usuário não encontrado para atualização.");

            existing.Name = user.Name;
            existing.Email = user.Email;
            existing.ProfileId = user.ProfileId;
            existing.PhoneNumber = user.PhoneNumber;
            existing.Sex = user.Sex;
            existing.DateOfBirth = user.DateOfBirth;
            existing.ImageUrl = user.ImageUrl;

            if (!string.IsNullOrWhiteSpace(user.Password))
                existing.Password = user.Password;

            if (user.Address != null)
            {
                if (existing.AddressId.HasValue && existing.Address != null)
                {
                    existing.Address.AddressLine = user.Address.AddressLine;
                    existing.Address.Number = user.Address.Number;
                    existing.Address.City = user.Address.City;
                    existing.Address.State = user.Address.State;
                    existing.Address.ZipCode = user.Address.ZipCode;
                    existing.Address.Country = user.Address.Country;
                    existing.Address.AddressType = user.Address.AddressType;
                    existing.Address.Latitude = user.Address.Latitude;
                    existing.Address.Longitude = user.Address.Longitude;
                    existing.Address.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var newAddress = new AddressEntity
                    {
                        Id = Guid.NewGuid(),
                        AddressLine = user.Address.AddressLine,
                        Number = user.Address.Number,
                        City = user.Address.City,
                        State = user.Address.State,
                        ZipCode = user.Address.ZipCode,
                        Country = user.Address.Country,
                        AddressType = user.Address.AddressType,
                        Latitude = user.Address.Latitude,
                        Longitude = user.Address.Longitude,
                        Status = string.IsNullOrWhiteSpace(user.Address.Status) ? "A" : user.Address.Status,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Addresses.Add(newAddress);
                    existing.AddressId = newAddress.Id;
                }
            }

            if (user.ProfessionalCredential != null && await IsProfessionalProfileAsync(existing.ProfileId))
            {
                if (existing.ProfessionalCredential == null)
                {
                    existing.ProfessionalCredential = new ProfessionalCredentialEntity
                    {
                        Id = Guid.NewGuid(),
                        ProfessionalId = existing.Id,
                        Type = user.ProfessionalCredential.Type,
                        CredentialId = user.ProfessionalCredential.CredentialId,
                        Biography = user.ProfessionalCredential.Biography,
                        Status = string.IsNullOrWhiteSpace(user.ProfessionalCredential.Status)
                            ? "A"
                            : user.ProfessionalCredential.Status,
                        CreatedAt = DateTime.UtcNow
                    };
                }
                else
                {
                    existing.ProfessionalCredential.Type = user.ProfessionalCredential.Type;
                    existing.ProfessionalCredential.CredentialId = user.ProfessionalCredential.CredentialId;
                    existing.ProfessionalCredential.Biography = user.ProfessionalCredential.Biography;
                    existing.ProfessionalCredential.Status = string.IsNullOrWhiteSpace(user.ProfessionalCredential.Status)
                        ? existing.ProfessionalCredential.Status
                        : user.ProfessionalCredential.Status;
                    existing.ProfessionalCredential.UpdatedAt = DateTime.UtcNow;
                }
            }

            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _context.Entry(existing).Reference(x => x.Address).LoadAsync();
            await _context.Entry(existing).Reference(x => x.ProfessionalCredential).LoadAsync();
            await _context.Entry(existing).Reference(x => x.Profile).LoadAsync();

            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar usuário.", ex);
        }
    }

    private async Task<bool> IsProfessionalProfileAsync(Guid profileId)
    {
        var profileName = await _context.Profiles
            .Where(x => x.Id == profileId)
            .Select(x => x.Name)
            .FirstOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(profileName))
            return false;

        var normalized = profileName.Trim().ToLowerInvariant();
        return normalized.Contains("personal") || normalized.Contains("nutricionista") || normalized.Contains("nutritionist");
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
