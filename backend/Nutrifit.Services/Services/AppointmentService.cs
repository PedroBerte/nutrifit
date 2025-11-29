using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.DTO;

namespace Nutrifit.Services.Services;

public class AppointmentService : IAppointmentService
{
    private readonly NutrifitContext _context;
    private readonly IPushService _pushService;

    public AppointmentService(NutrifitContext context, IPushService pushService)
    {
        _context = context;
        _pushService = pushService;
    }

    public async Task<List<AppointmentEntity>> GetByBondIdAsync(Guid bondId)
    {
        try
        {
            return await _context.Appointments
                .Include(x => x.Address)
                .Where(x => x.CustomerProfessionalBondId == bondId)
                .OrderByDescending(x => x.ScheduledAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar agendamentos.", ex);
        }
    }

    public async Task<List<AppointmentWithBondDto>> GetCustomerPendingAppointmentsAsync(Guid customerId)
    {
        try
        {
            // Busca os bonds onde o usuário é customer
            var bondIds = await _context.CustomerProfessionalBonds
                .Where(x => x.CustomerId == customerId)
                .Select(x => x.Id)
                .ToListAsync();

            // Busca os appointments pendentes com join manual
            var appointments = await _context.Appointments
                .Include(x => x.Address)
                .Where(x => bondIds.Contains(x.CustomerProfessionalBondId) && x.Status == "P")
                .OrderBy(x => x.ScheduledAt)
                .ToListAsync();

            // Busca os bonds com os profissionais
            var bonds = await _context.CustomerProfessionalBonds
                .Include(x => x.Professional)
                .Where(x => bondIds.Contains(x.Id))
                .ToListAsync();

            return BuildAppointmentDtos(appointments, bonds);
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar agendamentos pendentes.", ex);
        }
    }

    public async Task<List<AppointmentWithBondDto>> GetCustomerAppointmentsAsync(Guid customerId)
    {
        try
        {
            // Busca os bonds onde o usuário é customer
            var bondIds = await _context.CustomerProfessionalBonds
                .Where(x => x.CustomerId == customerId)
                .Select(x => x.Id)
                .ToListAsync();

            // Busca todos os appointments (exceto cancelados)
            var appointments = await _context.Appointments
                .Include(x => x.Address)
                .Where(x => bondIds.Contains(x.CustomerProfessionalBondId) && x.Status != "C")
                .OrderBy(x => x.ScheduledAt)
                .ToListAsync();

            // Busca os bonds com os profissionais
            var bonds = await _context.CustomerProfessionalBonds
                .Include(x => x.Professional)
                .Where(x => bondIds.Contains(x.Id))
                .ToListAsync();

            return BuildAppointmentDtos(appointments, bonds);
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar agendamentos.", ex);
        }
    }

    private List<AppointmentWithBondDto> BuildAppointmentDtos(
        List<AppointmentEntity> appointments,
        List<CustomerProfessionalBondEntity> bonds)
    {
        return appointments.Select(apt =>
        {
            var bond = bonds.FirstOrDefault(b => b.Id == apt.CustomerProfessionalBondId);

            return new AppointmentWithBondDto
            {
                Id = apt.Id,
                CustomerProfessionalBondId = apt.CustomerProfessionalBondId,
                ScheduledAt = apt.ScheduledAt,
                Type = apt.Type,
                AddressId = apt.AddressId,
                CreatedAt = apt.CreatedAt,
                UpdatedAt = apt.UpdatedAt,
                Status = apt.Status,
                Address = apt.Address != null ? new AddressDto
                {
                    Id = apt.Address.Id,
                    AddressLine = apt.Address.AddressLine,
                    Number = apt.Address.Number,
                    City = apt.Address.City,
                    State = apt.Address.State,
                    ZipCode = apt.Address.ZipCode,
                    Country = apt.Address.Country,
                    AddressType = apt.Address.AddressType
                } : null,
                CustomerProfessionalBond = bond != null ? new BondInfoDto
                {
                    Id = bond.Id,
                    CustomerId = bond.CustomerId,
                    ProfessionalId = bond.ProfessionalId,
                    Professional = bond.Professional != null ? new ProfessionalInfoDto
                    {
                        Id = bond.Professional.Id,
                        Name = bond.Professional.Name,
                        Email = bond.Professional.Email,
                        ImageUrl = bond.Professional.ImageUrl
                    } : null
                } : null
            };
        }).ToList();
    }

    public async Task<AppointmentEntity> GetByIdAsync(Guid id)
    {
        try
        {
            var appointment = await _context.Appointments
                .Include(x => x.Address)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (appointment == null)
                throw new InvalidOperationException("Agendamento não encontrado.");

            return appointment;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao buscar agendamento.", ex);
        }
    }

    public async Task<AppointmentEntity> CreateAsync(AppointmentEntity appointment)
    {
        try
        {
            appointment.Id = Guid.NewGuid();
            appointment.CreatedAt = DateTime.UtcNow;
            appointment.Status = "P"; // Pendente por padrão

            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();

            var bond = await _context.CustomerProfessionalBonds.FirstOrDefaultAsync(x => x.Id == appointment.CustomerProfessionalBondId);
            if (bond is null) return appointment;

            // Busca o profissional que criou a consulta para notificar o cliente
            var professional = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == bond.ProfessionalId);

            var pushMessage = new
            {
                title = "Consulta solicitada!",
                body = professional is null ? $"Seu personal marcou uma nova consulta!" : $"{professional.Name} solicitou uma nova consulta!"
            };

            // Envia notificação para o cliente (customer)
            _ = _pushService.SendToUserAsync(bond.CustomerId, pushMessage);

            return appointment;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao criar agendamento.", ex);
        }
    }

    public async Task<AppointmentEntity> UpdateAsync(AppointmentEntity appointment)
    {
        try
        {
            var existing = await _context.Appointments.FindAsync(appointment.Id);
            if (existing == null)
                throw new InvalidOperationException("Agendamento não encontrado para atualização.");

            _context.Entry(existing).CurrentValues.SetValues(appointment);
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existing;
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao atualizar agendamento.", ex);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        try
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null)
                throw new InvalidOperationException("Agendamento não encontrado para exclusão.");

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new Exception("Erro ao excluir agendamento.", ex);
        }
    }
}
