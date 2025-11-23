namespace Nutrifit.Repository.Entities;

public class FavoriteProfessionalEntity
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProfessionalId { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public UserEntity Customer { get; set; } = null!;
    public UserEntity Professional { get; set; } = null!;
}
