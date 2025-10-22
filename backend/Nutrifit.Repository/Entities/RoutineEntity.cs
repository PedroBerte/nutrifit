using System;

namespace Nutrifit.Repository.Entities
{
    public class RoutineEntity
    {
        public Guid Id { get; set; }
        public Guid PersonalId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Goal { get; set; }
        public int? Weeks { get; set; }
        public string? Difficulty { get; set; }
        public string Status { get; set; } = "A";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public UserEntity Personal { get; set; } = null!;
        public ICollection<WorkoutEntity> Workouts { get; set; } = new List<WorkoutEntity>();
        public ICollection<CustomerRoutineEntity> CustomerRoutines { get; set; } = new List<CustomerRoutineEntity>();
    }
}
