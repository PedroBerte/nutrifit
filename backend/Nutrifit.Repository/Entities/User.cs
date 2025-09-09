namespace Nutrifit.Repository.Entities;

public class User
{
    public Guid Id { get; set; }

    public Guid? AddressId { get; set; }
    public Guid? ProfileId { get; set; }

    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string Password { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }
    public bool IsAdmin { get; set; }

    // Nav
    public Address? Address { get; set; }
    public ICollection<UserProfile> UserProfiles { get; set; } = new List<UserProfile>();
}
