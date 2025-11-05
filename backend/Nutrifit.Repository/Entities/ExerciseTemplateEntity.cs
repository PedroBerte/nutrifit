using System;

namespace Nutrifit.Repository.Entities
{
    public class ExerciseTemplateEntity
    {
        public Guid Id { get; set; }
        public Guid WorkoutTemplateId { get; set; }
        public Guid ExerciseId { get; set; }
        public int Order { get; set; }

        // Parâmetros planejados (meta/sugestão)
        public int TargetSets { get; set; }
        public int? TargetRepsMin { get; set; }
        public int? TargetRepsMax { get; set; }
        public decimal? SuggestedLoad { get; set; }
        public int? RestSeconds { get; set; }
        public string? Notes { get; set; }

        // Status: A = Ativo, I = Inativo (soft delete)
        public string Status { get; set; } = "A";

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public WorkoutTemplateEntity WorkoutTemplate { get; set; } = null!;
        public ExerciseEntity Exercise { get; set; } = null!;
        public ICollection<ExerciseSessionEntity> ExerciseSessions { get; set; } = new List<ExerciseSessionEntity>();
    }
}
