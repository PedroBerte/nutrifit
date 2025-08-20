namespace Nutrifit.Repository.Entities;

public class ProfessionalCredential
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }

    public DateTime CreatedAt { get; set; }
    public string? Url { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Value { get; set; }      // número/registro
    public int Type { get; set; }           // enum-like (ex.: CRN/CFM/…)
    public Guid? CredentialId { get; set; } // se referenciar outra tabela no futuro
    public string Status { get; set; }

    // Nav
    public User Professional { get; set; } = null!;
}
