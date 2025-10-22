using System;

namespace Nutrifit.Repository.Entities
{
    public class WorkoutExerciseEntity
    {
        public Guid Id { get; set; }
        public Guid WorkoutSetId { get; set; }
        public decimal? Load { get; set; } // Carga em kg
        public int? ExpectedRepetitions { get; set; } // Repetições esperadas
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Navigation property
        public WorkoutSetEntity WorkoutSet { get; set; } = null!;
    }
}
