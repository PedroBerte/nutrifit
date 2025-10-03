using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IBondService
{
    Task<List<CustomerProfessionalBond>> GetAllAsync();
    Task<CustomerProfessionalBond> GetByIdAsync(Guid id);
    Task<CustomerProfessionalBond> AddAsync(CustomerProfessionalBond bond);
    Task<CustomerProfessionalBond> UpdateAsync(CustomerProfessionalBond bond);
    Task DeleteAsync(Guid id);
}