using System;

namespace Nutrifit.Repository.Entities
{
    public class ExerciseCategoryEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "A";

        // Navigation properties
        public ICollection<ExerciseEntity> Exercises { get; set; } = new List<ExerciseEntity>();
    }
}
