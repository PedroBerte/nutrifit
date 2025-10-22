namespace Nutrifit.Services.DTO;

public class WorkoutDto
{
    public Guid Id { get; set; }
    public Guid RoutineId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ExpectedDuration { get; set; }
    public string Status { get; set; } = "A";
    public Guid? WorkoutFeedbackId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? TotalVolume { get; set; }
    
    // Navigation properties
    public WorkoutFeedbackDto? WorkoutFeedback { get; set; }
    public List<WorkoutSetDto>? WorkoutSets { get; set; }
}

public class WorkoutFeedbackDto
{
    public Guid Id { get; set; }
    public int? Value { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class WorkoutSetDto
{
    public Guid Id { get; set; }
    public Guid WorkoutId { get; set; }
    public Guid ExerciseId { get; set; }
    public int MaxSets { get; set; }
    public int Order { get; set; }
    public string? Field { get; set; }
    public string? Description { get; set; }
    public int? ExpectedSets { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    // Navigation properties
    public ExerciseDto? Exercise { get; set; }
    public List<WorkoutExerciseDto>? WorkoutExercises { get; set; }
}

public class WorkoutExerciseDto
{
    public Guid Id { get; set; }
    public Guid WorkoutSetId { get; set; }
    public decimal? Load { get; set; }
    public int? ExpectedRepetitions { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
