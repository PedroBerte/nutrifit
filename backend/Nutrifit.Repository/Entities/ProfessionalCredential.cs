namespace Nutrifit.Repository.Entities;

public class ProfessionalCredential
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }
    public string Type { get; set; }
    public string? CredentialId { get; set; }
    public string? Biography { get; set; }
    public User Professional { get; set; } = null!;
}
