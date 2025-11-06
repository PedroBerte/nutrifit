using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IAddressService
{
    Task<AddressEntity> CreateAsync(AddressEntity address);
    Task<AddressEntity> GetByIdAsync(Guid id);
    Task<AddressEntity> UpdateAsync(AddressEntity address);
    Task DeleteAsync(Guid id);
}
