using System;

namespace Nutrifit.Repository.Entities
{
    public class ExerciseEntity
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Url { get; set; }
        public string? Instruction { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "A";

        // Navigation properties
        public ExerciseCategoryEntity Category { get; set; } = null!;
        public ICollection<ExercisePrimaryMuscleEntity> PrimaryMuscles { get; set; } = new List<ExercisePrimaryMuscleEntity>();
        public ICollection<ExerciseSecondaryMuscleEntity> SecondaryMuscles { get; set; } = new List<ExerciseSecondaryMuscleEntity>();
    }
}
