namespace Nutrifit.Services.DTO;

public class AppointmentWithBondDto
{
    public Guid Id { get; set; }
    public Guid CustomerProfessionalBondId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Type { get; set; } = string.Empty;
    public Guid? AddressId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public AddressDto? Address { get; set; }
    public BondInfoDto? CustomerProfessionalBond { get; set; }
}

public class BondInfoDto
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProfessionalId { get; set; }
    public ProfessionalInfoDto? Professional { get; set; }
}

public class ProfessionalInfoDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}
