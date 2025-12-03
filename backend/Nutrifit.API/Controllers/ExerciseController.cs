using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExerciseController : ControllerBase
{
    private readonly IExerciseService _exerciseService;

    public ExerciseController(IExerciseService exerciseService)
    {
        _exerciseService = exerciseService;
    }

    /// <summary>
    /// Lista todos os exercícios disponíveis
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllExercises([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            var result = await _exerciseService.GetAllExercisesAsync(page, pageSize, userIdClaim);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar exercícios: {ex.Message}" });
        }
    }

    /// <summary>
    /// Busca um exercício por ID
    /// </summary>
    [HttpGet("{exerciseId}")]
    public async Task<IActionResult> GetExerciseById(Guid exerciseId)
    {
        try
        {
            var result = await _exerciseService.GetExerciseByIdAsync(exerciseId);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar exercício: {ex.Message}" });
        }
    }

    /// <summary>
    /// Pesquisa exercícios por nome ou categoria
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> SearchExercises(
        [FromQuery] string? searchTerm,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            var result = await _exerciseService.SearchExercisesAsync(searchTerm ?? "", categoryId, page, pageSize, userIdClaim);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao pesquisar exercícios: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista todas as categorias de exercícios
    /// </summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetExerciseCategories()
    {
        try
        {
            var result = await _exerciseService.GetExerciseCategoriesAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar categorias: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista todos os grupos musculares com seus músculos
    /// </summary>
    [HttpGet("muscle-groups")]
    public async Task<IActionResult> GetMuscleGroups()
    {
        try
        {
            var result = await _exerciseService.GetMuscleGroupsAsync();

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar grupos musculares: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista exercícios que trabalham um grupo muscular específico
    /// </summary>
    [HttpGet("muscle-groups/{muscleGroupId}/exercises")]
    public async Task<IActionResult> GetExercisesByMuscleGroup(Guid muscleGroupId)
    {
        try
        {
            var result = await _exerciseService.GetExercisesByMuscleGroupAsync(muscleGroupId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar exercícios: {ex.Message}" });
        }
    }

    /// <summary>
    /// Cria um novo exercício personalizado
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateExercise([FromBody] CreateExerciseRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Usuário não autenticado" });

            var result = await _exerciseService.CreateExerciseAsync(request, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao criar exercício: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza um exercício personalizado
    /// </summary>
    [HttpPut("{exerciseId}")]
    public async Task<IActionResult> UpdateExercise(Guid exerciseId, [FromBody] UpdateExerciseRequest request)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Usuário não autenticado" });

            var result = await _exerciseService.UpdateExerciseAsync(exerciseId, request, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atualizar exercício: {ex.Message}" });
        }
    }

    /// <summary>
    /// Atualiza apenas a mídia (imagem e vídeo) de um exercício
    /// </summary>
    [HttpPatch("{exerciseId}/media")]
    public async Task<IActionResult> UpdateExerciseMedia(Guid exerciseId, [FromBody] UpdateExerciseMediaRequest request)
    {
        try
        {
            var result = await _exerciseService.UpdateExerciseMediaAsync(exerciseId, request);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao atualizar mídia do exercício: {ex.Message}" });
        }
    }

    /// <summary>
    /// Deleta um exercício personalizado (soft delete)
    /// </summary>
    [HttpDelete("{exerciseId}")]
    public async Task<IActionResult> DeleteExercise(Guid exerciseId)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Usuário não autenticado" });

            var result = await _exerciseService.DeleteExerciseAsync(exerciseId, userId);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao deletar exercício: {ex.Message}" });
        }
    }

    /// <summary>
    /// Lista os exercícios personalizados do usuário autenticado
    /// </summary>
    [HttpGet("my-exercises")]
    public async Task<IActionResult> GetUserExercises([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Usuário não autenticado" });

            var result = await _exerciseService.GetUserExercisesAsync(userId, page, pageSize);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao buscar exercícios do usuário: {ex.Message}" });
        }
    }
}
