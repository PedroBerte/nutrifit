using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkoutController : ControllerBase
{
    private readonly IWorkoutService _workoutService;

    public WorkoutController(IWorkoutService workoutService)
    {
        _workoutService = workoutService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst("id")?.Value;
        return Guid.Parse(userIdClaim!);
    }

    #region Workout CRUD

    /// <summary>
    /// Cria um novo treino em uma rotina (apenas Personal)
    /// </summary>
    [HttpPost("routine/{routineId}")]
    public async Task<IActionResult> CreateWorkout(Guid routineId, [FromBody] CreateWorkoutRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.CreateWorkoutAsync(routineId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao criar treino: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza um treino existente
    /// </summary>
    [HttpPut("{workoutId}")]
    public async Task<IActionResult> UpdateWorkout(Guid workoutId, [FromBody] UpdateWorkoutRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.UpdateWorkoutAsync(workoutId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atualizar treino: {ex.Message}" });
        }
    }

    /// <summary>
    /// Exclui um treino
    /// </summary>
    [HttpDelete("{workoutId}")]
    public async Task<IActionResult> DeleteWorkout(Guid workoutId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.DeleteWorkoutAsync(workoutId, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao excluir treino: {ex.Message}" });
        }
    }

    /// <summary>
    /// Busca um treino por ID com todos os detalhes
    /// </summary>
    [HttpGet("{workoutId}")]
    public async Task<IActionResult> GetWorkoutById(Guid workoutId)
    {
        try
        {
            var result = await _workoutService.GetWorkoutByIdAsync(workoutId);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar treino: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista todos os treinos de uma rotina
    /// </summary>
    [HttpGet("routine/{routineId}")]
    public async Task<IActionResult> GetWorkoutsByRoutine(Guid routineId)
    {
        try
        {
            var result = await _workoutService.GetWorkoutsByRoutineAsync(routineId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar treinos: {ex.Message}" });
        }
    }

    /// <summary>
    /// Marca um treino como completo
    /// </summary>
    [HttpPost("{workoutId}/complete")]
    public async Task<IActionResult> CompleteWorkout(Guid workoutId, [FromBody] CompleteWorkoutRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.CompleteWorkoutAsync(workoutId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao completar treino: {ex.Message}" });
        }
    }

    #endregion

    #region Workout Feedback

    /// <summary>
    /// Adiciona feedback a um treino
    /// </summary>
    [HttpPost("{workoutId}/feedback")]
    public async Task<IActionResult> CreateWorkoutFeedback(Guid workoutId, [FromBody] CreateWorkoutFeedbackRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.CreateWorkoutFeedbackAsync(workoutId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao criar feedback: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza o feedback de um treino
    /// </summary>
    [HttpPut("{workoutId}/feedback")]
    public async Task<IActionResult> UpdateWorkoutFeedback(Guid workoutId, [FromBody] CreateWorkoutFeedbackRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.UpdateWorkoutFeedbackAsync(workoutId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atualizar feedback: {ex.Message}" });
        }
    }

    #endregion

    #region Workout Sets

    /// <summary>
    /// Adiciona um exercício ao treino (cria um WorkoutSet)
    /// </summary>
    [HttpPost("{workoutId}/sets")]
    public async Task<IActionResult> CreateWorkoutSet(Guid workoutId, [FromBody] CreateWorkoutSetRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.CreateWorkoutSetAsync(workoutId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao adicionar exercício: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza um WorkoutSet
    /// </summary>
    [HttpPut("sets/{setId}")]
    public async Task<IActionResult> UpdateWorkoutSet(Guid setId, [FromBody] UpdateWorkoutSetRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.UpdateWorkoutSetAsync(setId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atualizar série: {ex.Message}" });
        }
    }

    /// <summary>
    /// Remove um exercício do treino (deleta o WorkoutSet)
    /// </summary>
    [HttpDelete("sets/{setId}")]
    public async Task<IActionResult> DeleteWorkoutSet(Guid setId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.DeleteWorkoutSetAsync(setId, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao remover exercício: {ex.Message}" });
        }
    }

    #endregion

    #region Workout Exercises

    /// <summary>
    /// Registra uma execução de série (WorkoutExercise)
    /// </summary>
    [HttpPost("sets/{setId}/exercises")]
    public async Task<IActionResult> CreateWorkoutExercise(Guid setId, [FromBody] CreateWorkoutExerciseRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.CreateWorkoutExerciseAsync(setId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao registrar execução: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza uma execução de série
    /// </summary>
    [HttpPut("exercises/{exerciseId}")]
    public async Task<IActionResult> UpdateWorkoutExercise(Guid exerciseId, [FromBody] UpdateWorkoutExerciseRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.UpdateWorkoutExerciseAsync(exerciseId, userId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atualizar execução: {ex.Message}" });
        }
    }

    /// <summary>
    /// Remove uma execução de série
    /// </summary>
    [HttpDelete("exercises/{exerciseId}")]
    public async Task<IActionResult> DeleteWorkoutExercise(Guid exerciseId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.DeleteWorkoutExerciseAsync(exerciseId, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao remover execução: {ex.Message}" });
        }
    }

    /// <summary>
    /// Marca uma execução como completa
    /// </summary>
    [HttpPost("exercises/{exerciseId}/complete")]
    public async Task<IActionResult> CompleteWorkoutExercise(Guid exerciseId)
    {
        try
        {
            var userId = GetUserId();
            var result = await _workoutService.CompleteWorkoutExerciseAsync(exerciseId, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao completar execução: {ex.Message}" });
        }
    }

    #endregion
}
