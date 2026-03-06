namespace Nutrifit.Services.ViewModel.Response;

public class SelfManagedWorkoutTemplateResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public int Order { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<SelfManagedExerciseTemplateResponse> ExerciseTemplates { get; set; } = new();
}

public class SelfManagedExerciseTemplateResponse
{
    public Guid Id { get; set; }
    public Guid WorkoutTemplateId { get; set; }
    public Guid? ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public int Order { get; set; }
    public int TargetSets { get; set; }
    public int? TargetRepsMin { get; set; }
    public int? TargetRepsMax { get; set; }
    public decimal? SuggestedLoad { get; set; }
    public int? RestSeconds { get; set; }
    public string? Notes { get; set; }
    public string SetType { get; set; } = string.Empty;
    public string WeightUnit { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SelfManagedWorkoutSessionResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? WorkoutTemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal? TotalVolume { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PaginatedSelfManagedWorkoutSessionsResponse
{
    public List<SelfManagedWorkoutSessionResponse> Items { get; set; } = new();
    public int TotalItems { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
