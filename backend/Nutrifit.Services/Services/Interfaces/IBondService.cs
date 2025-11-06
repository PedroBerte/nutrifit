using Nutrifit.Repository.Entities;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services.Interfaces;

public interface IBondService
{
    Task<List<CustomerProfessionalBondEntity>> GetAllAsync();
    Task<CustomerProfessionalBondEntity> GetByIdAsync(Guid id);
    Task<CustomerProfessionalBondEntity> AddAsync(CustomerProfessionalBondEntity bond);
    Task<CustomerProfessionalBondEntity> UpdateAsync(CustomerProfessionalBondEntity bond);
    Task DeleteAsync(Guid id);

    // New methods
    Task<List<CustomerProfessionalBondEntity>> GetBySenderIdAsync(Guid senderId);
    Task<List<CustomerProfessionalBondEntity>> GetByCustomerIdAsync(Guid customerId);
    Task<List<CustomerProfessionalBondEntity>> GetByProfessionalIdAsync(Guid professionalId);
    Task<List<CustomerProfessionalBondEntity>> GetByUserIdAsync(Guid userId);
    Task<List<CustomerProfessionalBondEntity>> GetReceivedByUserIdAsync(Guid userId);
    Task<ApiResponse> GetActiveStudentsAsync(Guid professionalId, int page, int pageSize, string? searchTerm);
}