using System;

namespace Nutrifit.Repository.Entities
{
    public class WorkoutFeedbackEntity
    {
        public Guid Id { get; set; }
        public int? Value { get; set; } // Rating de 1-5 ou outro sistema
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public WorkoutEntity? Workout { get; set; }
    }
}
