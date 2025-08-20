namespace Nutrifit.Repository.Entities;

public class Profile
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }

    // Nav
    public ICollection<UserProfile> UserProfiles { get; set; } = new List<UserProfile>();
    public ICollection<ProfileRole> ProfileRoles { get; set; } = new List<ProfileRole>();
}
