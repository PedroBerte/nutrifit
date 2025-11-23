using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class AddressService : IAddressService
{
    private readonly NutrifitContext _context;
    private readonly IGeocodingService _geocodingService;

    public AddressService(NutrifitContext context, IGeocodingService geocodingService)
    {
        _context = context;
        _geocodingService = geocodingService;
    }

    public async Task<AddressEntity> CreateAsync(AddressEntity address)
    {
        try
        {
            address.Id = Guid.NewGuid();
            address.CreatedAt = DateTime.UtcNow;
            address.Status = "A";

            // Try to geocode address
            if (!string.IsNullOrEmpty(address.ZipCode) && !string.IsNullOrEmpty(address.City))
            {
                var (lat, lon) = await _geocodingService.GetCoordinatesAsync(
                    address.ZipCode, 
                    address.City, 
                    address.State, 
                    address.Country
                );
                address.Latitude = lat;
                address.Longitude = lon;
            }

            await _context.Addresses.AddAsync(address);
            await _context.SaveChangesAsync();

            return address;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar endereço.", ex);
        }
    }

    public async Task<AddressEntity> GetByIdAsync(Guid id)
    {
        try
        {
            var address = await _context.Addresses.FindAsync(id);
            if (address == null)
                throw new InvalidOperationException("Endereço não encontrado.");

            return address;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar endereço.", ex);
        }
    }

    public async Task<AddressEntity> UpdateAsync(AddressEntity address)
    {
        try
        {
            var existing = await _context.Addresses.FindAsync(address.Id);
            if (existing == null)
                throw new InvalidOperationException("Endereço não encontrado para atualização.");

            // Try to geocode if address details changed
            if (!string.IsNullOrEmpty(address.ZipCode) && !string.IsNullOrEmpty(address.City))
            {
                var (lat, lon) = await _geocodingService.GetCoordinatesAsync(
                    address.ZipCode,
                    address.City,
                    address.State,
                    address.Country
                );
                address.Latitude = lat;
                address.Longitude = lon;
            }

            _context.Entry(existing).CurrentValues.SetValues(address);
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar endereço.", ex);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var address = await _context.Addresses.FindAsync(id);
            if (address == null)
                throw new InvalidOperationException("Endereço não encontrado para exclusão.");

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir endereço.", ex);
        }
    }

    public async Task<(int processed, int success, int failed)> GeocodeAllAddressesAsync()
    {
        var addresses = await _context.Addresses
            .Where(a => a.Latitude == null || a.Longitude == null)
            .ToListAsync();

        int processed = 0;
        int success = 0;
        int failed = 0;

        foreach (var address in addresses)
        {
            processed++;
            
            if (string.IsNullOrEmpty(address.ZipCode) || string.IsNullOrEmpty(address.City))
            {
                failed++;
                continue;
            }

            var (lat, lon) = await _geocodingService.GetCoordinatesAsync(
                address.ZipCode,
                address.City,
                address.State,
                address.Country ?? "Brasil"
            );

            if (lat.HasValue && lon.HasValue)
            {
                address.Latitude = lat.Value;
                address.Longitude = lon.Value;
                success++;
            }
            else
            {
                failed++;
            }
        }

        await _context.SaveChangesAsync();
        return (processed, success, failed);
    }
}
