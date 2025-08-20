using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IProfileService
{
    Task<List<Profile>> GetAllAsync();
    Task<Profile> GetByIdAsync(Guid id);
    Task<Profile> AddAsync(Profile profile);
    Task<Profile> UpdateAsync(Profile profile);
    Task DeleteAsync(Guid id);
}
