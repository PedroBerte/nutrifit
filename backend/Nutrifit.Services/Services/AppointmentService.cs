using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class AppointmentService : IAppointmentService
{
    private readonly NutrifitContext _context;

    public AppointmentService(NutrifitContext context)
    {
        _context = context;
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
