namespace Nutrifit.Repository.Entities
{
    public class ExerciseStepEntity
    {
        public Guid Id { get; set; }
        public Guid ExerciseId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Order { get; set; }
        public int? DurationSeconds { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public ExerciseEntity Exercise { get; set; } = null!;
    }
}
