namespace Nutrifit.Repository.Entities;

public class ProfessionalFeedback
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public Guid CustomerId { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? Testimony { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int Rate { get; set; }
    public int Type { get; set; }
    public string Status { get; set; }

    // Nav
    public User Professional { get; set; } = null!;
    public User Customer { get; set; } = null!;
}
