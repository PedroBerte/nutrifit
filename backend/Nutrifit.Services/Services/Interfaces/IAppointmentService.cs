using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;

namespace Nutrifit.Services.Services.Interfaces;

public interface IAppointmentService
{
    Task<List<AppointmentEntity>> GetByBondIdAsync(Guid bondId);
    Task<List<AppointmentDto>> GetCustomerPendingAppointmentsAsync(Guid customerId);
    Task<List<AppointmentDto>> GetCustomerAppointmentsAsync(Guid customerId);
    Task<List<AppointmentDto>> GetProfessionalAppointmentsAsync(Guid professionalId);
    Task<AppointmentEntity> GetByIdAsync(Guid id);
    Task<AppointmentEntity> CreateAsync(AppointmentEntity appointment);
    Task<AppointmentEntity> UpdateAsync(AppointmentEntity appointment);
    Task DeleteAsync(Guid id);
}
