namespace Nutrifit.Services.ViewModel.Request;

public class ImportRoutineRequest
{
    public RoutineImportPayload Payload { get; set; } = new();
    public string? RoutineTitle { get; set; }
    public string? Goal { get; set; }
    public string? Difficulty { get; set; }
    public int? Weeks { get; set; }
    public List<Guid>? AssignToUserIds { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class RoutineImportPayload
{
    public string SchemaVersion { get; set; } = "1.0";
    public DateTime? ExportedAt { get; set; }
    public List<ImportedWorkoutPayload> Workouts { get; set; } = new();
}

public class ImportedWorkoutPayload
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public int Order { get; set; }
    public List<ImportedExercisePayload> ExerciseTemplates { get; set; } = new();
}

public class ImportedExercisePayload
{
    public string ExerciseName { get; set; } = string.Empty;
    public int Order { get; set; }
    public int TargetSets { get; set; }
    public int? TargetRepsMin { get; set; }
    public int? TargetRepsMax { get; set; }
    public decimal? SuggestedLoad { get; set; }
    public int? RestSeconds { get; set; }
    public string SetType { get; set; } = "Reps";
    public string WeightUnit { get; set; } = "kg";
    public string? Notes { get; set; }
    public bool IsBisetWithPrevious { get; set; }
}
