using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IRoleService
{
    Task<List<Role>> GetAllAsync();
    Task<Role> GetByIdAsync(Guid id);
    Task<Role> AddAsync(Role role);
    Task<Role> UpdateAsync(Role role);
    Task DeleteAsync(Guid id);
}
