using System;

namespace Nutrifit.Repository.Entities
{
    public class WorkoutTemplateEntity
    {
        public Guid Id { get; set; }
        public Guid RoutineId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public int Order { get; set; } // Ordem na semana (Dia 1, 2, 3...)
        public string Status { get; set; } = "A"; // A=Ativo, I=Inativo
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public RoutineEntity Routine { get; set; } = null!;
        public ICollection<ExerciseTemplateEntity> ExerciseTemplates { get; set; } = new List<ExerciseTemplateEntity>();
        public ICollection<WorkoutSessionEntity> WorkoutSessions { get; set; } = new List<WorkoutSessionEntity>();
    }
}
