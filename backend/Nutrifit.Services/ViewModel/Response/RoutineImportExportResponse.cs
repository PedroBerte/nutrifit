namespace Nutrifit.Services.ViewModel.Response;

public class ImportRoutineResultResponse
{
    public Guid RoutineId { get; set; }
    public string RoutineTitle { get; set; } = string.Empty;
    public int ImportedWorkouts { get; set; }
    public int ImportedExercises { get; set; }
    public int AssignedUsersCount { get; set; }
    public List<PendingExerciseImportResponse> PendingExercises { get; set; } = new();
}

public class PendingExerciseImportResponse
{
    public Guid ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public string WorkoutTitle { get; set; } = string.Empty;
    public int WorkoutOrder { get; set; }
    public int ExerciseOrder { get; set; }
}

public class RoutineExportResponse
{
    public string SchemaVersion { get; set; } = "1.0";
    public DateTime ExportedAt { get; set; }
    public List<ExportedWorkoutResponse> Workouts { get; set; } = new();
}

public class ExportedWorkoutResponse
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public int Order { get; set; }
    public List<ExportedExerciseResponse> ExerciseTemplates { get; set; } = new();
}

public class ExportedExerciseResponse
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
