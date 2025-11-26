namespace Nutrifit.Services.DTO;

public class FeedbackDto
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public Guid CustomerId { get; set; }
    public string? CustomerName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Testimony { get; set; }
    public int Rate { get; set; }
}
