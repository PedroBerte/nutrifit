namespace Nutrifit.Repository.Entities;

public class UserProfile
{
    // Seu DER mostra PK própria. Se preferir PK composta (UserId, ProfileId), remova Id.
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ProfileId { get; set; }

    // Nav
    public User User { get; set; } = null!;
    public Profile Profile { get; set; } = null!;
}
