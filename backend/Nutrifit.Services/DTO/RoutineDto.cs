namespace Nutrifit.Services.DTO;

public class RoutineDto
{
    public Guid Id { get; set; }
    public Guid PersonalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public string? Difficulty { get; set; }
    public string Status { get; set; } = "A";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public UserDto? Personal { get; set; }
    public List<WorkoutDto>? Workouts { get; set; }
    public List<CustomerRoutineDto>? CustomerRoutines { get; set; }
}

public class CustomerRoutineDto
{
    public Guid Id { get; set; }
    public Guid RoutineId { get; set; }
    public Guid CustomerId { get; set; }
    public string Status { get; set; } = "A";
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public UserDto? Customer { get; set; }
    public RoutineDto? Routine { get; set; }
}
