using System;

namespace Nutrifit.Services.ViewModel.Request
{
    public class StartWorkoutSessionRequest
    {
        public Guid WorkoutTemplateId { get; set; }
        public DateTime? StartedAt { get; set; } // Opcional, default = agora
    }

    public class CompleteWorkoutSessionRequest
    {
        public DateTime? CompletedAt { get; set; } // Opcional, default = agora
        public int? DifficultyRating { get; set; } // 1-5
        public int? EnergyRating { get; set; } // 1-5
        public string? Notes { get; set; }
    }

    public class StartExerciseSessionRequest
    {
        public Guid ExerciseTemplateId { get; set; }
        public DateTime? StartedAt { get; set; }
    }

    public class CompleteExerciseSessionRequest
    {
        public DateTime? CompletedAt { get; set; }
        public string? Notes { get; set; }
    }

    public class SkipExerciseSessionRequest
    {
        public string? Reason { get; set; }
    }

    public class RegisterSetSessionRequest
    {
        public int SetNumber { get; set; }
        public decimal? Load { get; set; }
        public int? Reps { get; set; }
        public int? RestSeconds { get; set; }
        public bool Completed { get; set; } = true;
        public string? Notes { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class UpdateSetSessionRequest
    {
        public decimal? Load { get; set; }
        public int? Reps { get; set; }
        public int? RestSeconds { get; set; }
        public bool? Completed { get; set; }
        public string? Notes { get; set; }
    }
}
