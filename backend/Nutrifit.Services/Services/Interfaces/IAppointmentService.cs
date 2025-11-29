using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;

namespace Nutrifit.Services.Services.Interfaces;

public interface IAppointmentService
{
    Task<List<AppointmentEntity>> GetByBondIdAsync(Guid bondId);
    Task<List<AppointmentWithBondDto>> GetCustomerPendingAppointmentsAsync(Guid customerId);
    Task<List<AppointmentWithBondDto>> GetCustomerAppointmentsAsync(Guid customerId);
    Task<List<AppointmentWithBondDto>> GetProfessionalAppointmentsAsync(Guid professionalId);
    Task<AppointmentEntity> GetByIdAsync(Guid id);
    Task<AppointmentEntity> CreateAsync(AppointmentEntity appointment);
    Task<AppointmentEntity> UpdateAsync(AppointmentEntity appointment);
    Task DeleteAsync(Guid id);
}
