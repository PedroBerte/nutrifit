namespace Nutrifit.Repository.Entities;

public class ProfileRole
{
    public Guid Id { get; set; }
    public Guid RoleId { get; set; }
    public Guid ProfileId { get; set; }

    public Role Role { get; set; } = null!;
    public Profile Profile { get; set; } = null!;
}
