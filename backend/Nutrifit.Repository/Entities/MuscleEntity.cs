using System;

namespace Nutrifit.Repository.Entities
{
    public class MuscleEntity
    {
        public Guid Id { get; set; }
        public Guid MuscleGroupId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "A";

        // Navigation properties
        public MuscleGroupEntity MuscleGroup { get; set; } = null!;
        public ICollection<ExercisePrimaryMuscleEntity> PrimaryMuscleExercises { get; set; } = new List<ExercisePrimaryMuscleEntity>();
        public ICollection<ExerciseSecondaryMuscleEntity> SecondaryMuscleExercises { get; set; } = new List<ExerciseSecondaryMuscleEntity>();
    }
}
