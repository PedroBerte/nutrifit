using System;
using System.Collections.Generic;

namespace Nutrifit.Services.ViewModel.Response
{
    public class ExerciseHistoryResponse
    {
        public Guid ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public string? VideoUrl { get; set; }
        public ExerciseStats Stats { get; set; } = new();
        public List<ExerciseSessionHistoryItem> Sessions { get; set; } = new();
    }

    public class ExerciseStats
    {
        public int TotalSessions { get; set; }
        public int TotalSets { get; set; }
        public int TotalReps { get; set; }
        public decimal TotalVolume { get; set; }
        public decimal MaxLoad { get; set; }
        public decimal AverageLoad { get; set; }
        public DateTime? LastPerformed { get; set; }
        public DateTime? FirstPerformed { get; set; }
    }

    public class ExerciseSessionHistoryItem
    {
        public Guid SessionId { get; set; }
        public DateTime PerformedAt { get; set; }
        public string WorkoutTemplateTitle { get; set; } = string.Empty;
        public List<SetHistoryItem> Sets { get; set; } = new();
        public decimal SessionVolume { get; set; }
        public decimal MaxLoad { get; set; }
        public decimal AverageLoad { get; set; }
        public int TotalReps { get; set; }
    }

    public class SetHistoryItem
    {
        public int SetNumber { get; set; }
        public decimal? Load { get; set; }
        public int? Reps { get; set; }
        public decimal Volume { get; set; }
    }
}
