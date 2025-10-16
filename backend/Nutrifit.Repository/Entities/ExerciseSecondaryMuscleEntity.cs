using System;

namespace Nutrifit.Repository.Entities
{
    public class ExerciseSecondaryMuscleEntity
    {
        public Guid Id { get; set; }
        public Guid MuscleId { get; set; }
        public Guid ExerciseId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "A";

        // Navigation properties
        public MuscleEntity Muscle { get; set; } = null!;
        public ExerciseEntity Exercise { get; set; } = null!;
    }
}
