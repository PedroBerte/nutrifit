namespace Nutrifit.Repository.Entities;

public class WeeklyGoalEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int GoalDays { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public UserEntity User { get; set; } = null!;
}
