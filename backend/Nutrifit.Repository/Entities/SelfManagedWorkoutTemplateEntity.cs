namespace Nutrifit.Repository.Entities;

public class SelfManagedWorkoutTemplateEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public int Order { get; set; }
    public string Status { get; set; } = "A";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public UserEntity User { get; set; } = null!;
    public ICollection<SelfManagedExerciseTemplateEntity> Exercises { get; set; } = new List<SelfManagedExerciseTemplateEntity>();
    public ICollection<SelfManagedWorkoutSessionEntity> Sessions { get; set; } = new List<SelfManagedWorkoutSessionEntity>();
}
