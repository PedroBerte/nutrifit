namespace Nutrifit.Repository.Entities;

public class CustomerProfessionalBond
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProfessionalId { get; set; }
    public Guid? SenderId { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }

    // Nav
    public User Customer { get; set; } = null!;
    public User Professional { get; set; } = null!;
    public User? Sender { get; set; }
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
