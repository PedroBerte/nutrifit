using System;

namespace Nutrifit.Repository.Entities
{
    public class WorkoutEntity
    {
        public Guid Id { get; set; }
        public Guid RoutineId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ExpectedDuration { get; set; } // em minutos
        public string Status { get; set; } = "A";
        public Guid? WorkoutFeedbackId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? TotalVolume { get; set; } // Volume total em kg

        // Navigation properties
        public RoutineEntity Routine { get; set; } = null!;
        public WorkoutFeedbackEntity? WorkoutFeedback { get; set; }
        public ICollection<WorkoutSetEntity> WorkoutSets { get; set; } = new List<WorkoutSetEntity>();
    }
}
