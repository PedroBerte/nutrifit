using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;

namespace Nutrifit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthenticationService _authService;
        private readonly IConfiguration _cfg;
        public AuthenticationController(IAuthenticationService authenticationService, IConfiguration configuration)
        {
            _authService = authenticationService;
            _cfg = configuration;
        }

        [HttpPost("sendAccessEmail")]
        [AllowAnonymous]
        public async Task<ActionResult> SendAccessEmail([FromBody] SendAccessEmailRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email inválido.");
            try
            {
                var baseAppUrl = Request.Headers["X-App-BaseUrl"].FirstOrDefault()
                         ?? _cfg["PublicAppUrl"] ?? "https://localhost:3000";

                var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
                var ua = Request.Headers.UserAgent.ToString();

                await _authService.SendAccessEmailAsync(request.Email, baseAppUrl, ip, ua);
                return Ok("Email de acesso enviado com sucesso.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpPost("ValidateSession")]
        [AllowAnonymous]
        public async Task<ActionResult> ValidateSession([FromQuery] string token)
        {
            try
            {
                var jwt = await _authService.ValidateSession(token);
                return Ok(jwt);
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
