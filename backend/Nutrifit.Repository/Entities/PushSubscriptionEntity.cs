namespace Nutrifit.Repository.Entities
{
    public class PushSubscriptionEntity
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }

        public string Endpoint { get; set; } = null!;
        public string P256dh { get; set; } = null!;
        public string Auth { get; set; } = null!;

        public DateTimeOffset? ExpirationTime { get; set; }
        public string? UserAgent { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}
