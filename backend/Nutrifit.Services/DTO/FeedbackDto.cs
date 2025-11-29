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

public class CreateFeedbackRequest
{
    public Guid ProfessionalId { get; set; }
    public Guid CustomerId { get; set; }
    public int Rate { get; set; }
    public string? Testimony { get; set; }
}

public class FeedbackResponse
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public Guid CustomerId { get; set; }
    public string ProfessionalName { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? ProfessionalImageUrl { get; set; }
    public string? CustomerImageUrl { get; set; }
    public int Rate { get; set; }
    public string? Testimony { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
