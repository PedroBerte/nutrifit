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
    /// Remove a atribui��o de uma rotina de um cliente
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
            return StatusCode(500, new { message = $"Erro ao remover atribui��o: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista todas as rotinas atribu�das ao cliente logado
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
    /// Lista rotinas atribu�das a um cliente espec�fico (para Personal)
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

    /// <summary>
    /// Busca alunos atribuídos e disponíveis para uma rotina
    /// </summary>
    [HttpGet("{routineId}/customers")]
    public async Task<IActionResult> GetRoutineCustomers(Guid routineId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.GetRoutineCustomersAsync(routineId, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar alunos da rotina: {ex.Message}" });
        }
    }

    /// <summary>
    /// Busca rotinas próximas da validade (CustomerRoutines com ExpiresAt dentro do threshold)
    /// </summary>
    [HttpGet("near-expiry")]
    public async Task<IActionResult> GetRoutinesNearExpiry([FromQuery] int daysThreshold = 7)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.GetRoutinesNearExpiryAsync(userId, daysThreshold);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar rotinas próximas da validade: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza a data de vencimento de uma rotina atribuída a um cliente
    /// </summary>
    [HttpPut("{routineId}/customer/{customerId}/expiry")]
    public async Task<IActionResult> UpdateCustomerRoutineExpiry(
        Guid routineId,
        Guid customerId,
        [FromBody] UpdateExpiryRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _routineService.UpdateCustomerRoutineExpiryAsync(
                routineId,
                customerId,
                userId,
                request.ExpiresAt);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atualizar data de vencimento: {ex.Message}" });
        }
    }
}

public class UpdateExpiryRequest
{
    public DateTime? ExpiresAt { get; set; }
}
