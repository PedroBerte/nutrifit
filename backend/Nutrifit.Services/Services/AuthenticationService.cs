using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Nutrifit.Repository;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Nutrifit.Services.Services
{
    record MagicLinkPayload(string Email, string? Ip, string? Ua, DateTimeOffset CreatedAt);
    public class AuthenticationService : IAuthenticationService
    {
        private readonly IConfiguration _cfg;
        private readonly IConnectionMultiplexer _mux;
        private readonly NutrifitContext _context;

        private readonly IMailService _mailService;

        public AuthenticationService(IConfiguration cfg, IConnectionMultiplexer mux, IMailService mailService, NutrifitContext context)
        {
            _cfg = cfg;
            _mux = mux;
            _context = context;
            _mailService = mailService;
        }

        public async Task SendAccessEmailAsync(string email, string baseAppUrl, string ip, string ua)
        {
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token = WebEncoders.Base64UrlEncode(tokenBytes);
            var url = $"{baseAppUrl.TrimEnd('/')}/login/callback?token={token}";

            var payload = new MagicLinkPayload(
                Email: email.Trim().ToLowerInvariant(),
                Ip: ip,
                Ua: ua,
                CreatedAt: DateTimeOffset.UtcNow
            );
            var val = JsonSerializer.Serialize(payload);
            var ttl = TimeSpan.FromMinutes(_cfg.GetValue<int>("MagicLink:ExpiresMinutes", 10));

            await _mux.GetDatabase().StringSetAsync($"ml:{Sha256Hex(token)}", val, ttl, When.NotExists);

            await _mailService.SendAsync(new MailMessageDTO(
                To: email,
                Subject: "Seu acesso à NutriFit",
                HtmlBody: $@"
                    <p>Olá! Clique para acessar:</p>
                    <p><a href=""{url}"">Entrar na NutriFit</a></p>
                    <p>O link expira em {ttl.TotalMinutes} minutos.</p>",
                TextBody: null,
                Attachments: null,
                Cc: null,
                Bcc: null
            ));
        }

        public async Task<string> ValidateSession(string token)
        {
            var raw = await _mux.GetDatabase().StringGetAsync($"ml:{Sha256Hex(token)}");
            if (raw.IsNullOrEmpty) throw new UnauthorizedAccessException("Token inválido ou expirado.");

            var payload = JsonSerializer.Deserialize<MagicLinkPayload>(raw!);

            var user = await _context.Users
                .Include(x => x.Profile)
                .FirstOrDefaultAsync(u => u.Email == payload!.Email);

            var request = new IssueJwtTokenRequest
            {
                Id = Guid.NewGuid(),
                Name = "",
                Email = payload.Email,
                Profile = Guid.Empty,
                IsAdmin = user?.IsAdmin ?? false
            };

            if(user is not null)
            {
                request.Id = user.Id;
                request.Name = user.Name;
                request.Profile = user.ProfileId;
            }

            return IssueJwt(request);
        }

        private string IssueJwt(IssueJwtTokenRequest request)
        {
            var cfg = _cfg.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("id", request.Id.ToString()),
                new Claim("name", request.Name),
                new Claim("isAdmin", request.IsAdmin.ToString()),
                new Claim("profile", request.Profile == Guid.Empty ? string.Empty : request.Profile.ToString()),
                new Claim(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Sub, request.Id.ToString()),
                new Claim(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Email, request.Email),
                new Claim(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: cfg["Issuer"],
                audience: cfg["Audience"],
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(cfg["ExpiresMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string Sha256Hex(string s)
        {
            using var sha = SHA256.Create();
            return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(s)));
        }
    }
}
