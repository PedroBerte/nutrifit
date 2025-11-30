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
    record MagicLinkPayload(string Email, string? Ip, string? Ua, DateTimeOffset CreatedAt, bool Invited = false, Guid? ProfessionalInviterId = null);
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

        public async Task SendAccessEmailAsync(string email, string baseAppUrl, string ip, string ua, bool invited = false, Guid? professionalInviterId = null)
        {
            var tokenBytes = RandomNumberGenerator.GetBytes(32);
            var token = WebEncoders.Base64UrlEncode(tokenBytes);
            var url = $"{baseAppUrl.TrimEnd('/')}/login/callback?token={token}";

            var payload = new MagicLinkPayload(
                Email: email.Trim().ToLowerInvariant(),
                Ip: ip,
                Ua: ua,
                CreatedAt: DateTimeOffset.UtcNow,
                Invited: invited,
                ProfessionalInviterId: professionalInviterId
            );
            var val = JsonSerializer.Serialize(payload);
            var ttl = TimeSpan.FromMinutes(_cfg.GetValue<int>("MagicLink:ExpiresMinutes", 10));

            await _mux.GetDatabase().StringSetAsync($"ml:{Sha256Hex(token)}", val, ttl, When.NotExists);

            var html = GetMagicLinkEmailHtml(url, ttl.TotalMinutes);
            var text = $"Olá! Use o link para acessar a NutriFit: {url}\nO link expira em {ttl.TotalMinutes:0} minutos.";

            await _mailService.SendAsync(new MailMessageDTO(
                To: email,
                Subject: "Seu acesso à NutriFit",
                HtmlBody: html,
                TextBody: text,
                Attachments: null,
                Cc: null,
                Bcc: null
            ));
        }

        private static string GetMagicLinkEmailHtml(string url, double expiresInMinutes)
        {
            const string brand = "#16a34a";
            const string brandDark = "#15803d"; 
            const string bg = "#0b0f0d";
            const string lightBg = "#f6f8f7";
            const string text = "#1f2937";

            return $@"
                <!doctype html>
                <html lang=""pt-BR"">
                  <head>
                    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
                    <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8""/>
                    <title>Seu acesso à NutriFit</title>
                    <style>
                      /* Reset básico */
                      html, body {{ margin:0; padding:0; }}
                      img {{ border:0; outline:none; text-decoration:none; max-width:100%; height:auto; display:block; }}
                      table {{ border-collapse:collapse; }}
                      a {{ color:{brand}; }}
                      /* Dark mode (clientes compatíveis) */
                      @media (prefers-color-scheme: dark) {{
                        .wrapper {{ background:{bg} !important; }}
                        .card {{ background:#111716 !important; border-color:#233128 !important; }}
                        .text {{ color:#e5e7eb !important; }}
                        .muted {{ color:#9ca3af !important; }}
                        .link {{ color:#34d399 !important; }}
                      }}
                      /* Responsivo */
                      @media only screen and (max-width:600px) {{
                        .container {{ width:100% !important; }}
                        .px {{ padding-left:20px !important; padding-right:20px !important; }}
                      }}
                    </style>
                  </head>
                  <body style=""background:{lightBg}; margin:0; padding:0;"">
                    <span style=""display:none;font-size:1px;color:#f6f8f7;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;"">
                      Seu link mágico para entrar na NutriFit. Expira em {expiresInMinutes:0} minutos.
                    </span>
                
                    <table role=""presentation"" class=""wrapper"" width=""100%"" bgcolor=""{lightBg}"" style=""background:{lightBg};"">
                      <tr>
                        <td align=""center"" style=""padding:32px 16px;"">
                          <table role=""presentation"" class=""container"" width=""600"" style=""width:600px; max-width:100%;"">
                            <!-- Card -->
                            <tr>
                              <td class=""px"" style=""padding:0 24px 24px 24px;"">
                                <table role=""presentation"" width=""100%"" class=""card"" style=""background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;"">
                                  <tr>
                                    <td style=""padding:28px 24px 8px 24px;"">
                                      <h1 class=""text"" style=""margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.35;color:{text};"">
                                        Acesse sua conta
                                      </h1>
                                      <p class=""text"" style=""margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:{text};"">
                                        Olá! Clique no botão abaixo para entrar na <strong>NutriFit</strong>.
                                      </p>
                                    </td>
                                  </tr>
                
                                  <!-- Botão bulletproof -->
                                  <tr>
                                    <td align=""center"" style=""padding:0 24px 8px 24px;"">
                                      <!--[if mso]>
                                        <v:roundrect xmlns:v=""urn:schemas-microsoft-com:vml"" xmlns:w=""urn:schemas-microsoft-com:office:word"" href=""{url}""
                                          style=""height:48px;v-text-anchor:middle;width:280px;"" arcsize=""12%"" stroke=""f"" fillcolor=""{brand}"">
                                          <w:anchorlock/>
                                          <center style=""color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;"">
                                            Entrar na NutriFit
                                          </center>
                                        </v:roundrect>
                                      <![endif]-->
                                      <!--[if !mso]><!-- -->
                                      <a href=""{url}"" target=""_blank""
                                        style=""display:inline-block;background:{brand};border-radius:8px;text-decoration:none;
                                               font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:16px;
                                               line-height:48px;height:48px;padding:0 28px;color:#ffffff;min-width:220px;text-align:center;""
                                        >
                                        Entrar na NutriFit
                                      </a>
                                      <!--<![endif]-->
                                    </td>
                                  </tr>
                
                                  <tr>
                                    <td style=""padding:0 24px 24px 24px;"">
                                      <p class=""muted"" style=""margin:12px 0 0 0;font-family:Arial,Helvetica,sans-serif;
                                        font-size:13px;line-height:1.6;color:#6b7280;"">
                                        O link expira em <strong>{expiresInMinutes:0} minutos</strong>. Se você não solicitou este acesso, ignore este e-mail.
                                      </p>
                                    </td>
                                  </tr>
                
                                  <!-- Fallback do link -->
                                  <tr>
                                    <td style=""padding:14px 24px 22px 24px;border-top:1px solid #eef2f1;"">
                                      <p class=""muted"" style=""margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;
                                        font-size:12px;line-height:1.6;color:#6b7280;"">
                                        Problemas com o botão? Copie e cole este link no navegador:
                                      </p>
                                      <p class=""link"" style=""margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;word-break:break-all;"">
                                        <a href=""{url}"" style=""text-decoration:underline;color:{brand};"">{url}</a>
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                
                            <!-- Rodapé -->
                            <tr>
                              <td class=""px"" align=""center"" style=""padding:8px 24px 0 24px;"">
                                <p class=""muted"" style=""margin:10px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;"">
                                  © {DateTime.UtcNow.Year} NutriFit — Treinos, saúde e performance.
                                </p>
                                <p class=""muted"" style=""margin:6px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9ca3af;"">
                                  Este e-mail foi enviado para confirmar seu acesso.
                                </p>
                              </td>
                            </tr>
                
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>";
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
                IsAdmin = user?.IsAdmin ?? false,
                Invited = payload.Invited,
                ProfessionalInviterId = payload.ProfessionalInviterId
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

            var claimsList = new List<Claim>
            {
                new Claim("id", request.Id.ToString()),
                new Claim("name", request.Name),
                new Claim("isAdmin", request.IsAdmin.ToString()),
                new Claim("profile", request.Profile == Guid.Empty ? string.Empty : request.Profile.ToString()),
                new Claim("invited", request.Invited.ToString()),
                new Claim(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Sub, request.Id.ToString()),
                new Claim(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Email, request.Email),
                new Claim(Microsoft.IdentityModel.JsonWebTokens.JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (request.ProfessionalInviterId.HasValue)
            {
                claimsList.Add(new Claim("professionalInviterId", request.ProfessionalInviterId.Value.ToString()));
            }

            var claims = claimsList.ToArray();

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
