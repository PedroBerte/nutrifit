using System;

namespace Nutrifit.Repository.Entities
{
    public class WorkoutSetEntity
    {
        public Guid Id { get; set; }
        public Guid WorkoutId { get; set; }
        public Guid ExerciseId { get; set; }
        public int MaxSets { get; set; } // Número máximo de séries
        public int Order { get; set; } // Ordem do exercício no treino
        public string? Field { get; set; } // Campo customizado
        public string? Description { get; set; }
        public int? ExpectedSets { get; set; } // Séries esperadas
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        public WorkoutEntity Workout { get; set; } = null!;
        public ExerciseEntity Exercise { get; set; } = null!;
        public ICollection<WorkoutExerciseEntity> WorkoutExercises { get; set; } = new List<WorkoutExerciseEntity>();
    }
}
