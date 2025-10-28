using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using System.Security.Claims;

namespace Nutrifit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkoutTemplateController : ControllerBase
    {
        private readonly IWorkoutTemplateService _workoutTemplateService;

        public WorkoutTemplateController(IWorkoutTemplateService workoutTemplateService)
        {
            _workoutTemplateService = workoutTemplateService;
        }

        private Guid GetUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("id")?.Value;
            return Guid.Parse(userId!);
        }

        [HttpPost("routine/{routineId}")]
        public async Task<IActionResult> CreateWorkoutTemplate(Guid routineId, [FromBody] CreateWorkoutTemplateRequest request)
        {
            try
            {
                var personalId = GetUserId();
                var response = await _workoutTemplateService.CreateWorkoutTemplateAsync(routineId, personalId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{templateId}")]
        public async Task<IActionResult> GetWorkoutTemplateById(Guid templateId)
        {
            try
            {
                var response = await _workoutTemplateService.GetWorkoutTemplateByIdAsync(templateId);

                if (!response.Success)
                    return NotFound(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("routine/{routineId}")]
        public async Task<IActionResult> GetWorkoutTemplatesByRoutine(Guid routineId)
        {
            try
            {
                var response = await _workoutTemplateService.GetWorkoutTemplatesByRoutineAsync(routineId);

                if (!response.Success)
                    return NotFound(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{templateId}")]
        public async Task<IActionResult> UpdateWorkoutTemplate(Guid templateId, [FromBody] UpdateWorkoutTemplateRequest request)
        {
            try
            {
                var personalId = GetUserId();
                var response = await _workoutTemplateService.UpdateWorkoutTemplateAsync(templateId, personalId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{templateId}")]
        public async Task<IActionResult> DeleteWorkoutTemplate(Guid templateId)
        {
            try
            {
                var personalId = GetUserId();
                var response = await _workoutTemplateService.DeleteWorkoutTemplateAsync(templateId, personalId);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{templateId}/exercises")]
        public async Task<IActionResult> AddExerciseToTemplate(Guid templateId, [FromBody] CreateExerciseTemplateRequest request)
        {
            try
            {
                var personalId = GetUserId();
                var response = await _workoutTemplateService.AddExerciseToTemplateAsync(templateId, personalId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("exercise/{exerciseTemplateId}")]
        public async Task<IActionResult> UpdateExerciseTemplate(Guid exerciseTemplateId, [FromBody] UpdateExerciseTemplateRequest request)
        {
            try
            {
                var personalId = GetUserId();
                var response = await _workoutTemplateService.UpdateExerciseTemplateAsync(exerciseTemplateId, personalId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("exercise/{exerciseTemplateId}")]
        public async Task<IActionResult> RemoveExerciseFromTemplate(Guid exerciseTemplateId)
        {
            try
            {
                var personalId = GetUserId();
                var response = await _workoutTemplateService.RemoveExerciseFromTemplateAsync(exerciseTemplateId, personalId);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{templateId}/reorder")]
        public async Task<IActionResult> ReorderExercises(Guid templateId, [FromBody] List<Guid> exerciseTemplateIds)
        {
            try
            {
                var personalId = GetUserId();
                var response = await _workoutTemplateService.ReorderExercisesAsync(templateId, personalId, exerciseTemplateIds);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
