using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IUserService
{
    Task<List<UserEntity>> GetAllAsync();
    Task<UserEntity> GetByIdAsync(Guid id);
    Task<UserEntity> AddAsync(UserEntity user);
    Task<UserEntity> UpdateAsync(UserEntity user);
    Task DeleteAsync(Guid id);
    Task<List<CustomerFeedbackEntity>> GetProfessionalFeedbacksAsync(Guid professionalId);
}
