using System;
using System.Collections.Generic;

namespace Nutrifit.Services.ViewModel.Request
{
    public class CreateWorkoutTemplateRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public int Order { get; set; }
        public List<CreateExerciseTemplateRequest>? ExerciseTemplates { get; set; }
    }

    public class CreateExerciseTemplateRequest
    {
        public Guid ExerciseId { get; set; }
        public int Order { get; set; }
        public int TargetSets { get; set; }
        public int? TargetRepsMin { get; set; }
        public int? TargetRepsMax { get; set; }
        public decimal? SuggestedLoad { get; set; }
        public int? RestSeconds { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateWorkoutTemplateRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? EstimatedDurationMinutes { get; set; }
        public int? Order { get; set; }
    }

    public class UpdateExerciseTemplateRequest
    {
        public int? Order { get; set; }
        public int? TargetSets { get; set; }
        public int? TargetRepsMin { get; set; }
        public int? TargetRepsMax { get; set; }
        public decimal? SuggestedLoad { get; set; }
        public int? RestSeconds { get; set; }
        public string? Notes { get; set; }
    }
}
