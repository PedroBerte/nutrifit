using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IUserService
{
    Task<List<User>> GetAllAsync();
    Task<User> GetByIdAsync(Guid id);
    Task<User> AddAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(Guid id);
}
