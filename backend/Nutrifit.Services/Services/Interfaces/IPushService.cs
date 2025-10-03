using Nutrifit.Services.DTO;

namespace Nutrifit.Services.Services.Interfaces
{
    public interface IPushService
    {
        Task Subscribe(PushSubscriptionDto dto, Guid userId, string userAgent);
        Task Unsubscribe(string endpoint, Guid userId);
        Task SendToUserAsync(Guid userId, object payload);
    }
}
