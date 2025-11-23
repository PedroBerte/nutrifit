using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class FavoriteService : IFavoriteService
{
    private readonly NutrifitContext _context;

    public FavoriteService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<FavoriteProfessionalEntity> AddFavoriteAsync(Guid customerId, Guid professionalId)
    {
        try
        {
            // Verificar se já existe
            var existing = await _context.FavoriteProfessionals
                .FirstOrDefaultAsync(f => f.CustomerId == customerId && f.ProfessionalId == professionalId);

            if (existing != null)
                throw new InvalidOperationException("Este profissional já está nos favoritos.");

            var favorite = new FavoriteProfessionalEntity
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                ProfessionalId = professionalId,
                CreatedAt = DateTime.UtcNow
            };

            _context.FavoriteProfessionals.Add(favorite);
            await _context.SaveChangesAsync();

            return favorite;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao adicionar favorito.", ex);
        }
    }

    public async Task RemoveFavoriteAsync(Guid customerId, Guid professionalId)
    {
        try
        {
            var favorite = await _context.FavoriteProfessionals
                .FirstOrDefaultAsync(f => f.CustomerId == customerId && f.ProfessionalId == professionalId);

            if (favorite == null)
                throw new InvalidOperationException("Favorito não encontrado.");

            _context.FavoriteProfessionals.Remove(favorite);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao remover favorito.", ex);
        }
    }

    public async Task<List<FavoriteProfessionalEntity>> GetCustomerFavoritesAsync(Guid customerId)
    {
        try
        {
            return await _context.FavoriteProfessionals
                .Include(f => f.Professional)
                    .ThenInclude(p => p.ProfessionalCredential)
                .Include(f => f.Professional)
                    .ThenInclude(p => p.ProfessionalDetails)
                .Include(f => f.Professional)
                    .ThenInclude(p => p.Address)
                .Include(f => f.Professional)
                    .ThenInclude(p => p.Profile)
                .Where(f => f.CustomerId == customerId)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar favoritos.", ex);
        }
    }

    public async Task<bool> IsFavoriteAsync(Guid customerId, Guid professionalId)
    {
        try
        {
            return await _context.FavoriteProfessionals
                .AnyAsync(f => f.CustomerId == customerId && f.ProfessionalId == professionalId);
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao verificar favorito.", ex);
        }
    }
}
