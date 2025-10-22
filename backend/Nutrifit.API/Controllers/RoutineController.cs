using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using System.Security.Claims;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoutineController : ControllerBase
{
    private readonly IRoutineService _routineService;

    public RoutineController(IRoutineService routineService)
    {
        _routineService = routineService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst("id")?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Cria uma nova rotina de treino (apenas Personal)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateRoutine([FromBody] CreateRoutineRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.CreateRoutineAsync(userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao criar rotina: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza uma rotina existente
    /// </summary>
    [HttpPut("{routineId}")]
    public async Task<IActionResult> UpdateRoutine(Guid routineId, [FromBody] UpdateRoutineRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.UpdateRoutineAsync(routineId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atualizar rotina: {ex.Message}" });
        }
    }

    /// <summary>
    /// Exclui uma rotina
    /// </summary>
    [HttpDelete("{routineId}")]
    public async Task<IActionResult> DeleteRoutine(Guid routineId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.DeleteRoutineAsync(routineId, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao excluir rotina: {ex.Message}" });
        }
    }

    /// <summary>
    /// Busca uma rotina por ID com todos os detalhes
    /// </summary>
    [HttpGet("{routineId}")]
    public async Task<IActionResult> GetRoutineById(Guid routineId)
    {
        try
        {
            var result = await _routineService.GetRoutineByIdAsync(routineId);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar rotina: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista todas as rotinas criadas pelo Personal logado
    /// </summary>
    [HttpGet("my-routines")]
    public async Task<IActionResult> GetMyRoutines([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.GetRoutinesByPersonalAsync(userId, page, pageSize);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar rotinas: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atribui uma rotina a um cliente
    /// </summary>
    [HttpPost("assign")]
    public async Task<IActionResult> AssignRoutineToCustomer([FromBody] AssignRoutineToCustomerRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.AssignRoutineToCustomerAsync(userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atribuir rotina: {ex.Message}" });
        }
    }

    /// <summary>
    /// Remove a atribuição de uma rotina de um cliente
    /// </summary>
    [HttpDelete("{routineId}/customer/{customerId}")]
    public async Task<IActionResult> UnassignRoutineFromCustomer(Guid routineId, Guid customerId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.UnassignRoutineFromCustomerAsync(routineId, customerId, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao remover atribuição: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista todas as rotinas atribuídas ao cliente logado
    /// </summary>
    [HttpGet("my-assigned-routines")]
    public async Task<IActionResult> GetMyAssignedRoutines([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.GetCustomerRoutinesAsync(userId, page, pageSize);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar rotinas: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista rotinas atribuídas a um cliente específico (para Personal)
    /// </summary>
    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetCustomerRoutines(Guid customerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _routineService.GetCustomerRoutinesAsync(customerId, page, pageSize);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar rotinas do cliente: {ex.Message}" });
        }
    }
}
