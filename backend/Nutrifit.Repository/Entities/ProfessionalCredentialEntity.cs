namespace Nutrifit.Repository.Entities;

public class ProfessionalCredentialEntity
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }
    public string Type { get; set; }
    public string? CredentialId { get; set; }
    public string? Biography { get; set; }
    public UserEntity Professional { get; set; } = null!;
}
