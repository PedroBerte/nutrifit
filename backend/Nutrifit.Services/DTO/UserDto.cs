using System.Net;

namespace Nutrifit.Services.DTO;

public class UserDto
{
    public Guid? Id { get; set; }
    public Guid? AddressId { get; set; }
    public Guid ProfileId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Status { get; set; } = null!;
    public bool? IsAdmin { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Sex { get; set; } = null!;
    public string PhoneNumber { get; set; }
    public AddressDto? Address { get; set; }
    public ProfileDto? Profile { get; set; } = null!;    
    public ProfessionalCredentialDto? ProfessionalCredential { get; set; }
    public List<BondDto>? CustomerProfessionalBonds { get; set; }
}

public class AddressDto
{
    public Guid? Id { get; set; }
    public string? AddressLine { get; set; } = null!;
    public string? Number { get; set; }
    public string? City { get; set; } = null!;
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; } = null!;
    public int? AddressType { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Status { get; set; }
}
