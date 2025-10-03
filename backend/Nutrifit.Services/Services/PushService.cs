using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
using Org.BouncyCastle.Asn1.Ocsp;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Nutrifit.Services.Services
{
    public class PushService : IPushService
    {
        public async Task Subscribe(PushSubscriptionDto dto)
        {
            //var userId = Guid.Parse(User.FindFirst("sub")!.Value); // ajuste à sua claim
            //var existing = await _db.PushSubscriptions
            //    .FirstOrDefaultAsync(s => s.UserId == userId && s.Endpoint == dto.endpoint);

            //if (existing == null)
            //{
            //    _db.PushSubscriptions.Add(new PushSubscriptionEntity
            //    {
            //        UserId = userId,
            //        Endpoint = dto.endpoint,
            //        P256dh = dto.keys.p256dh,
            //        Auth = dto.keys.auth,
            //        ExpirationTime = dto.expirationTime,
            //        UserAgent = Request.Headers.UserAgent.ToString(),
            //        IsActive = true
            //    });
            //}
            //else
            //{
            //    existing.P256dh = dto.keys.p256dh;
            //    existing.Auth = dto.keys.auth;
            //    existing.ExpirationTime = dto.expirationTime;
            //    existing.IsActive = true;
            //}
            //await _db.SaveChangesAsync();
            //return Ok();
        }

        public async Task Unsubscribe(string endpoint)
        {
            //var userId = Guid.Parse(User.FindFirst("sub")!.Value);
            //var sub = await _db.PushSubscriptions
            //    .FirstOrDefaultAsync(s => s.UserId == userId && s.Endpoint == endpoint);

            //if (sub != null) { sub.IsActive = false; await _db.SaveChangesAsync(); }
            //return Ok();
        }
    }
}
