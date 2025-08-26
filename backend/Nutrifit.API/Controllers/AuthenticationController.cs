using Microsoft.AspNetCore.Mvc;

namespace Nutrifit.API.Controllers
{
    [ApiController]
    [Route("v1/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        public AuthenticationController()
        {
            
        }

        [HttpPost("sendAccessEmail")]
        public async Task<ActionResult> SendAccessEmail([FromBody] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest("Email inválido.");
            try
            {
                // Lógica para enviar o email de acesso
                // await _authService.SendAccessEmailAsync(email);
                return Ok("Email de acesso enviado com sucesso.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }
    }
}
