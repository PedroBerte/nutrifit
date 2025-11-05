using System;

namespace Nutrifit.Repository.Entities
{
    public class ExerciseSessionEntity
    {
        public Guid Id { get; set; }
        public Guid WorkoutSessionId { get; set; }
        public Guid ExerciseTemplateId { get; set; }
        public Guid ExerciseId { get; set; }
        public int Order { get; set; }

        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } = "NS"; // NS=Não iniciado, IP=Em progresso, C=Completo, SK=Pulado
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public WorkoutSessionEntity WorkoutSession { get; set; } = null!;
        public ExerciseTemplateEntity ExerciseTemplate { get; set; } = null!;
        public ExerciseEntity Exercise { get; set; } = null!;
        public ICollection<SetSessionEntity> SetSessions { get; set; } = new List<SetSessionEntity>();
    }
}
