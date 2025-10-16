namespace Nutrifit.Services.ViewModel.Response;

public class WorkoutSummaryResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ExpectedDuration { get; set; }
    public string Status { get; set; } = "A";
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int ExerciseCount { get; set; }
    public int? TotalVolume { get; set; }
    public bool HasFeedback { get; set; }
}

public class WorkoutDetailResponse
{
    public Guid Id { get; set; }
    public Guid RoutineId { get; set; }
    public string RoutineTitle { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ExpectedDuration { get; set; }
    public string Status { get; set; } = "A";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? TotalVolume { get; set; }
    public WorkoutFeedbackResponse? Feedback { get; set; }
    public List<WorkoutSetResponse>? Sets { get; set; }
}

public class WorkoutFeedbackResponse
{
    public Guid Id { get; set; }
    public int? Value { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class WorkoutSetResponse
{
    public Guid Id { get; set; }
    public Guid ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public string? ExerciseUrl { get; set; }
    public string? ExerciseInstruction { get; set; }
    public string? ExerciseCategoryName { get; set; }
    public int MaxSets { get; set; }
    public int Order { get; set; }
    public string? Field { get; set; }
    public string? Description { get; set; }
    public int? ExpectedSets { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<WorkoutExerciseResponse>? Exercises { get; set; }
    public List<string>? PrimaryMuscles { get; set; }
    public List<string>? SecondaryMuscles { get; set; }
}

public class WorkoutExerciseResponse
{
    public Guid Id { get; set; }
    public decimal? Load { get; set; }
    public int? ExpectedRepetitions { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
