using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IProfileService
{
    Task<List<ProfileEntity>> GetAllAsync();
    Task<ProfileEntity> GetByIdAsync(Guid id);
    Task<ProfileEntity> AddAsync(ProfileEntity profile);
    Task<ProfileEntity> UpdateAsync(ProfileEntity profile);
    Task DeleteAsync(Guid id);
}
