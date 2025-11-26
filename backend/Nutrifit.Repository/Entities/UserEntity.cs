namespace Nutrifit.Repository.Entities;

public class UserEntity
{
    public Guid Id { get; set; }

    public Guid? AddressId { get; set; }
    public Guid ProfileId { get; set; }

    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string Password { get; set; } = null!;
    public string Sex { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }
    public bool IsAdmin { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string PhoneNumber { get; set; }

    public ProfileEntity Profile { get; set; } = null!;
    public AddressEntity? Address { get; set; }
    public ProfessionalCredentialEntity? ProfessionalCredential { get; set; }
    public ProfessionalDetailsEntity? ProfessionalDetails { get; set; }
    public ICollection<CustomerFeedbackEntity> CustomerFeedbacks { get; set; }  = new List<CustomerFeedbackEntity>();
}
