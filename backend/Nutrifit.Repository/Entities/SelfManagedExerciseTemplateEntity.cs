namespace Nutrifit.Repository.Entities;

public class SelfManagedExerciseTemplateEntity
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
    public string SetType { get; set; } = "Reps";
    public string WeightUnit { get; set; } = "kg";
    public DateTime CreatedAt { get; set; }

    public SelfManagedWorkoutTemplateEntity WorkoutTemplate { get; set; } = null!;
    public ExerciseEntity? Exercise { get; set; }
}
