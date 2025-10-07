using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LogsController : ControllerBase
    {
        private readonly ILogService _service;
        private readonly ILogger<LogsController> _logger;

        public LogsController(ILogService service, ILogger<LogsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        /// <summary>
        /// Consulta logs da tabela padrão (app_logs).
        /// Exemplos:
        /// GET /api/logs?level=Error&take=50
        /// GET /api/logs?since=2025-10-06T00:00:00Z
        /// GET /api/logs?text=timeout
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? level, [FromQuery] DateTimeOffset? since, [FromQuery] string? text, [FromQuery] int take = 200)
        {
            var list = await _service.GetAsync(level, since, text, take);
            return Ok(list);
        }

        /// <summary>
        /// Endpoint de teste que gera alguns logs (Info/Error) com propriedades.
        /// </summary>
        [HttpPost("demo")]
        public IActionResult DemoLogs()
        {
            using (Serilog.Context.LogContext.PushProperty("UserId", Guid.NewGuid()))
            using (Serilog.Context.LogContext.PushProperty("Feature", "LogsDemo"))
            {
                _logger.LogInformation("Usuário abriu a tela de logs");
                try
                {
                    throw new InvalidOperationException("Exceção de teste");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Falha simulada ao processar ação de demo");
                }

                _logger.LogInformation("Demo finalizada com sucesso {@payload}", new { Valor = 123, Itens = 3 });
            }

            return Ok(new { ok = true });
        }
    }
}
