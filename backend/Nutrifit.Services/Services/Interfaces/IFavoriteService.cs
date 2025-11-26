using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IFavoriteService
{
    Task<FavoriteProfessionalEntity> AddFavoriteAsync(Guid customerId, Guid professionalId);
    Task RemoveFavoriteAsync(Guid customerId, Guid professionalId);
    Task<List<FavoriteProfessionalEntity>> GetCustomerFavoritesAsync(Guid customerId);
    Task<bool> IsFavoriteAsync(Guid customerId, Guid professionalId);
}
