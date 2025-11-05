using System;
using System.Collections.Generic;

namespace Nutrifit.Services.ViewModel.Request
{
    public class CompleteWorkoutSessionRequest
    {
        public Guid WorkoutTemplateId { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime CompletedAt { get; set; }
        public int DurationMinutes { get; set; }
        public int? DifficultyRating { get; set; } // 1-5
        public int? EnergyRating { get; set; } // 1-5
        public string? Notes { get; set; }
        public List<ExerciseSessionData> ExerciseSessions { get; set; } = new();
    }

    public class ExerciseSessionData
    {
        public Guid ExerciseTemplateId { get; set; }
        public Guid ExerciseId { get; set; }
        public int Order { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } = "C"; // C = Completed, SK = Skipped
        public string? Notes { get; set; }
        public List<SetSessionData> Sets { get; set; } = new();
    }

    public class SetSessionData
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
}
