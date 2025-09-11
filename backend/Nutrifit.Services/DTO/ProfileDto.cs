namespace Nutrifit.Services.DTO;

public class ProfileDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Status { get; set; } = null!;
}
