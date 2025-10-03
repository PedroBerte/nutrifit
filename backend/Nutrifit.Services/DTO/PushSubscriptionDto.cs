namespace Nutrifit.Services.DTO
{
    public class PushSubscriptionDto
    {
        public string endpoint { get; set; } = null!;
        public DateTime? expirationTime { get; set; }
        public Keys keys { get; set; } = null!;
        public class Keys { public string p256dh { get; set; } = null!; public string auth { get; set; } = null!; }
    }
}
