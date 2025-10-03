namespace Nutrifit.Repository.Entities;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid CustomerProfessionalBondId { get; set; }

    public DateTime Date { get; set; }
    public int Type { get; set; }
    public string? Location { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }

    public CustomerProfessionalBond CustomerProfessionalBond { get; set; } = null!;
}
