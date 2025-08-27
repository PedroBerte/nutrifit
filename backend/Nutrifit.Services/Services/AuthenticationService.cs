using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
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

        private readonly IMailService _mailService;
        public AuthenticationService(IConfiguration cfg, IConnectionMultiplexer mux, IMailService mailService)
        {
            _cfg = cfg;
            _mux = mux;

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
            var raw = await _mux.GetDatabase().StringGetDeleteAsync($"ml:{Sha256Hex(token)}");
            if (raw.IsNullOrEmpty) throw new UnauthorizedAccessException("Token inválido ou expirado.");

            var payload = JsonSerializer.Deserialize<MagicLinkPayload>(raw!);

            return IssueJwt(payload!.Email);
        }

        private string IssueJwt(string email)
        {
            var cfg = _cfg.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Sub, email),
            new Claim(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Email, email),
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
