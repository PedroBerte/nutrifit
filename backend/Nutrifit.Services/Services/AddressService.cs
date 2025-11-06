using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class AddressService : IAddressService
{
    private readonly NutrifitContext _context;

    public AddressService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<AddressEntity> CreateAsync(AddressEntity address)
    {
        try
        {
            address.Id = Guid.NewGuid();
            address.CreatedAt = DateTime.UtcNow;
            address.Status = "A";

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
}
