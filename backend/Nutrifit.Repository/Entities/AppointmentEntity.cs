namespace Nutrifit.Repository.Entities;

public class AppointmentEntity
{
    public Guid Id { get; set; }
    public Guid CustomerProfessionalBondId { get; set; }

    public DateTime ScheduledAt { get; set; }
    public string Type { get; set; } = "PR"; // PR = Presencial, ON = Online
    public Guid? AddressId { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; } = "P"; // P = Pendente, A = Aceito, R = Rejeitado, C = Cancelado

    // Navigation properties
    public AddressEntity? Address { get; set; }
    public CustomerProfessionalBondEntity? CustomerProfessionalBond { get; set; }
}
