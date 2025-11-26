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
    public class WorkoutSessionController : ControllerBase
    {
        private readonly IWorkoutSessionService _workoutSessionService;

        public WorkoutSessionController(IWorkoutSessionService workoutSessionService)
        {
            _workoutSessionService = workoutSessionService;
        }

        private Guid GetUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("id")?.Value;
            return Guid.Parse(userId!);
        }

        [HttpPost("complete")]
        public async Task<IActionResult> CompleteWorkoutSession([FromBody] CompleteWorkoutSessionRequest request)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.CompleteWorkoutSessionAsync(customerId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkoutSessionById(Guid id)
        {
            try
            {
                var response = await _workoutSessionService.GetWorkoutSessionByIdAsync(id);

                if (!response.Success)
                    return NotFound(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetWorkoutHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.GetCustomerWorkoutHistoryAsync(customerId, page, pageSize);

                if (!response.Success)
                    return NotFound(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("exercise/{exerciseId}/previous")]
        public async Task<IActionResult> GetPreviousExerciseData(Guid exerciseId)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.GetPreviousExerciseDataAsync(exerciseId, customerId);

                if (!response.Success)
                    return NotFound(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("exercise/{exerciseId}/history")]
        public async Task<IActionResult> GetExerciseHistory(Guid exerciseId)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.GetExerciseHistoryAsync(exerciseId, customerId);

                if (!response.Success)
                    return NotFound(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetCustomerWorkoutHistory(Guid customerId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var response = await _workoutSessionService.GetCustomerWorkoutHistoryAsync(customerId, page, pageSize);

                if (!response.Success)
                    return NotFound(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
