using System;
using System.Collections.Generic;

namespace Nutrifit.Services.ViewModel.Response
{
    public class WorkoutTemplateResponse
    {
        public Guid Id { get; set; }
        public Guid RoutineId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public int Order { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ExerciseTemplateResponse>? ExerciseTemplates { get; set; }
    }

    public class ExerciseTemplateResponse
    {
        public Guid Id { get; set; }
        public Guid WorkoutTemplateId { get; set; }
        public Guid ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string? ExerciseImageUrl { get; set; }
        public string? ExerciseVideoUrl { get; set; }
        public int Order { get; set; }
        public int TargetSets { get; set; }
        public int? TargetRepsMin { get; set; }
        public int? TargetRepsMax { get; set; }
        public decimal? SuggestedLoad { get; set; }
        public int? RestSeconds { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
