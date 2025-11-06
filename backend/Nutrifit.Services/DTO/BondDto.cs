namespace Nutrifit.Services.DTO;

public class BondDto
{
    public Guid? Id { get; set; }
    public Guid CustomerId { get; set; }
    public Guid ProfessionalId { get; set; }
    public Guid SenderId { get; set; }
    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? Status { get; set; }
    
    public UserDto? Customer { get; set; }
    public UserDto? Professional { get; set; }
    public UserDto? Sender { get; set; }
    public List<AppointmentDto>? Appointments { get; set; }
}