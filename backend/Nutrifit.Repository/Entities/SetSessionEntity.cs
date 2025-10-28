using System;

namespace Nutrifit.Repository.Entities
{
    public class SetSessionEntity
    {
        public Guid Id { get; set; }
        public Guid ExerciseSessionId { get; set; }
        public int SetNumber { get; set; }

        // Dados reais executados
        public decimal? Load { get; set; }
        public int? Reps { get; set; }
        public int? RestSeconds { get; set; }
        public bool Completed { get; set; } = true;
        public string? Notes { get; set; }

        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation property
        public ExerciseSessionEntity ExerciseSession { get; set; } = null!;
    }
}
