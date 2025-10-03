using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
using System.Net;
using System.Text.Json;
using WebPush;

namespace Nutrifit.Services.Services
{
    public class PushService : IPushService
    {
        private readonly NutrifitContext _context;
        private readonly VapidDetails _vapid;
        private readonly WebPushClient _client;
        public PushService(NutrifitContext context, IConfiguration cfg)
        {
            _context = context;
            _client = new WebPushClient();
            _vapid = new VapidDetails(
                cfg["Vapid:Subject"],
                cfg["Vapid:PublicKey"],
                cfg["Vapid:PrivateKey"]
            );
        }

        public async Task Subscribe(PushSubscriptionDto dto, Guid userId, string userAgent)
        {
            var existing = await _context.PushSubscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Endpoint == dto.endpoint);

            if (existing == null)
            {
                _context.PushSubscriptions.Add(new PushSubscriptionEntity
                {
                    UserId = userId,
                    Endpoint = dto.endpoint,
                    P256dh = dto.keys.p256dh,
                    Auth = dto.keys.auth,
                    ExpirationTime = dto.expirationTime,
                    UserAgent = userAgent,
                    IsActive = true
                });
            }
            else
            {
                existing.P256dh = dto.keys.p256dh;
                existing.Auth = dto.keys.auth;
                existing.ExpirationTime = dto.expirationTime;
                existing.IsActive = true;
            }
            await _context.SaveChangesAsync();
        }

        public async Task Unsubscribe(string endpoint, Guid userId)
        {
            var sub = await _context.PushSubscriptions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.Endpoint == endpoint);

            if (sub != null) { sub.IsActive = false; await _context.SaveChangesAsync(); }
        }

        public async Task SendToUserAsync(Guid userId, object payload)
        {
            var subs = await _context.PushSubscriptions
                .Where(s => s.UserId == userId && s.IsActive)
                .ToListAsync();

            var json = JsonSerializer.Serialize(payload);

            foreach (var s in subs)
            {
                var pushSub = new PushSubscription(s.Endpoint, s.P256dh, s.Auth);
                try
                {
                    await _client.SendNotificationAsync(pushSub, json, _vapid);
                }
                catch (WebPushException ex) when (
                    ex.StatusCode == HttpStatusCode.Gone ||
                    ex.StatusCode == HttpStatusCode.NotFound)
                {
                    s.IsActive = false;
                }
                catch
                {
                }
            }
            await _context.SaveChangesAsync();
        }
    }
}
