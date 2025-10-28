using System;

namespace Nutrifit.Repository.Entities
{
    public class WorkoutSessionEntity
    {
        public Guid Id { get; set; }
        public Guid WorkoutTemplateId { get; set; }
        public Guid CustomerId { get; set; }
        public Guid RoutineId { get; set; }

        // Dados da sessão
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? DurationMinutes { get; set; }
        public decimal? TotalVolume { get; set; }
        public string Status { get; set; } = "IP"; // IP=Em progresso, C=Completo, CA=Cancelado

        // Feedback opcional
        public int? DifficultyRating { get; set; }
        public int? EnergyRating { get; set; }
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public WorkoutTemplateEntity WorkoutTemplate { get; set; } = null!;
        public UserEntity Customer { get; set; } = null!;
        public RoutineEntity Routine { get; set; } = null!;
        public ICollection<ExerciseSessionEntity> ExerciseSessions { get; set; } = new List<ExerciseSessionEntity>();
    }
}
