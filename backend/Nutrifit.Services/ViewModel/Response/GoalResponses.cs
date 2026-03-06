namespace Nutrifit.Services.ViewModel.Response;

public class WeeklyGoalResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int GoalDays { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class WeeklyGoalProgressResponse
{
    public int GoalDays { get; set; }
    public int CompletedDays { get; set; }
    public double Percentage { get; set; }
    public List<string> TrainedDates { get; set; } = new();
}
