namespace Nutrifit.Services.ViewModel.Request;

public class CreateSelfManagedWorkoutTemplateRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public int Order { get; set; }
    public List<CreateSelfManagedExerciseTemplateRequest>? ExerciseTemplates { get; set; }
}

public class CreateSelfManagedExerciseTemplateRequest
{
    public Guid? ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public int Order { get; set; }
    public int TargetSets { get; set; }
    public int? TargetRepsMin { get; set; }
    public int? TargetRepsMax { get; set; }
    public decimal? SuggestedLoad { get; set; }
    public int? RestSeconds { get; set; }
    public string? Notes { get; set; }
    public string SetType { get; set; } = "Reps";
    public string WeightUnit { get; set; } = "kg";
}

public class UpdateSelfManagedWorkoutTemplateRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public int? Order { get; set; }
}

public class CreateSelfManagedWorkoutSessionRequest
{
    public Guid? WorkoutTemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
}

public class FinishSelfManagedWorkoutSessionRequest
{
    public decimal? TotalVolume { get; set; }
    public string? Notes { get; set; }
    public int? DurationMinutes { get; set; }
}
