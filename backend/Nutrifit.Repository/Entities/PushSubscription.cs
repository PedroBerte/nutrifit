namespace Nutrifit.Repository.Entities
{
    public class PushSubscription
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Endpoint { get; set; } = null!;
        public string P256dh { get; set; } = null!;
        public string Auth { get; set; } = null!;
        public DateTime? ExpirationTime { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}
