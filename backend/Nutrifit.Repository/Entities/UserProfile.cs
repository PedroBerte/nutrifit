namespace Nutrifit.Repository.Entities;

public class UserProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ProfileId { get; set; }

    public User User { get; set; } = null!;
    public Profile Profile { get; set; } = null!;
}
