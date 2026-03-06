namespace Nutrifit.Repository.Entities;

public class SelfManagedWorkoutSessionEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? WorkoutTemplateId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = "IP";
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal? TotalVolume { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public UserEntity User { get; set; } = null!;
    public SelfManagedWorkoutTemplateEntity? WorkoutTemplate { get; set; }
}
