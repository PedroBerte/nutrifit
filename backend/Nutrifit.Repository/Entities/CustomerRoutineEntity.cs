using System;

namespace Nutrifit.Repository.Entities
{
    public class CustomerRoutineEntity
    {
        public Guid Id { get; set; }
        public Guid RoutineId { get; set; }
        public Guid CustomerId { get; set; }
        public string Status { get; set; } = "A";
        public DateTime? ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public RoutineEntity Routine { get; set; } = null!;
        public UserEntity Customer { get; set; } = null!;
    }
}
