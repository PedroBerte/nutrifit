namespace Nutrifit.Repository.Entities;

public class CustomerProfessionalBondEntity
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProfessionalId { get; set; }
    public Guid SenderId { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }

    public UserEntity Customer { get; set; } = null!;
    public UserEntity Professional { get; set; } = null!;
    public UserEntity Sender { get; set; } = null!;
    public ICollection<AppointmentEntity> Appointments { get; set; } = new List<AppointmentEntity>();
}
