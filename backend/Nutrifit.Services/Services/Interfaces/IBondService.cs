using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IBondService
{
    Task<List<CustomerProfessionalBondEntity>> GetAllAsync();
    Task<CustomerProfessionalBondEntity> GetByIdAsync(Guid id);
    Task<CustomerProfessionalBondEntity> AddAsync(CustomerProfessionalBondEntity bond);
    Task<CustomerProfessionalBondEntity> UpdateAsync(CustomerProfessionalBondEntity bond);
    Task DeleteAsync(Guid id);
}