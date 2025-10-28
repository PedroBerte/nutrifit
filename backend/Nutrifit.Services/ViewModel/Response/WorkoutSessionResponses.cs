using System;
using System.Collections.Generic;

namespace Nutrifit.Services.ViewModel.Response
{
    public class WorkoutSessionResponse
    {
        public Guid Id { get; set; }
        public Guid WorkoutTemplateId { get; set; }
        public string WorkoutTemplateTitle { get; set; } = string.Empty;
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public Guid RoutineId { get; set; }
        public string RoutineTitle { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? DurationMinutes { get; set; }
        public decimal? TotalVolume { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? DifficultyRating { get; set; }
        public int? EnergyRating { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ExerciseSessionResponse>? ExerciseSessions { get; set; }
    }

    public class ExerciseSessionResponse
    {
        public Guid Id { get; set; }
        public Guid WorkoutSessionId { get; set; }
        public Guid ExerciseTemplateId { get; set; }
        public Guid ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string? ExerciseUrl { get; set; }
        public int Order { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public List<SetSessionResponse>? SetSessions { get; set; }

        // Dados do template para referência
        public int? TargetSets { get; set; }
        public int? TargetRepsMin { get; set; }
        public int? TargetRepsMax { get; set; }
        public decimal? SuggestedLoad { get; set; }
    }

    public class SetSessionResponse
    {
        public Guid Id { get; set; }
        public Guid ExerciseSessionId { get; set; }
        public int SetNumber { get; set; }
        public decimal? Load { get; set; }
        public int? Reps { get; set; }
        public int? RestSeconds { get; set; }
        public bool Completed { get; set; }
        public string? Notes { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class WorkoutSessionSummaryResponse
    {
        public Guid Id { get; set; }
        public string WorkoutTemplateTitle { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? DurationMinutes { get; set; }
        public decimal? TotalVolume { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? DifficultyRating { get; set; }
        public int ExercisesCompleted { get; set; }
        public int TotalExercises { get; set; }
    }
}
