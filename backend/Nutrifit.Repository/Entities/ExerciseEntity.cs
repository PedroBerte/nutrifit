using System;

namespace Nutrifit.Repository.Entities
{
    public class ExerciseEntity
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Instruction { get; set; }
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public Guid? CreatedByUserId { get; set; }
        public bool IsPublished { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "A";

        public ExerciseCategoryEntity Category { get; set; } = null!;
        public UserEntity? CreatedByUser { get; set; }
        public ICollection<ExercisePrimaryMuscleEntity> PrimaryMuscles { get; set; } = new List<ExercisePrimaryMuscleEntity>();
        public ICollection<ExerciseSecondaryMuscleEntity> SecondaryMuscles { get; set; } = new List<ExerciseSecondaryMuscleEntity>();
    }
}
