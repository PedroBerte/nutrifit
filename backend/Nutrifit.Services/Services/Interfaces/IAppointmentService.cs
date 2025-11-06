using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.Services.Interfaces;

public interface IAppointmentService
{
    Task<List<AppointmentEntity>> GetByBondIdAsync(Guid bondId);
    Task<AppointmentEntity> GetByIdAsync(Guid id);
    Task<AppointmentEntity> CreateAsync(AppointmentEntity appointment);
    Task<AppointmentEntity> UpdateAsync(AppointmentEntity appointment);
    Task DeleteAsync(Guid id);
}
