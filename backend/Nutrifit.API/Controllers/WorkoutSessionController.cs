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

        [HttpPost("start")]
        public async Task<IActionResult> StartWorkoutSession([FromBody] StartWorkoutSessionRequest request)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.StartWorkoutSessionAsync(customerId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteWorkoutSession(Guid id, [FromBody] CompleteWorkoutSessionRequest request)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.CompleteWorkoutSessionAsync(id, customerId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelWorkoutSession(Guid id)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.CancelWorkoutSessionAsync(id, customerId);

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

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveWorkoutSession()
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.GetActiveWorkoutSessionAsync(customerId);

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

        [HttpPost("{id}/exercise/start")]
        public async Task<IActionResult> StartExerciseSession(Guid id, [FromBody] StartExerciseSessionRequest request)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.StartExerciseSessionAsync(id, customerId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{id}/exercise/{exerciseId}/complete")]
        public async Task<IActionResult> CompleteExerciseSession(Guid id, Guid exerciseId)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.CompleteExerciseSessionAsync(exerciseId, customerId);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("{id}/exercise/{exerciseId}/skip")]
        public async Task<IActionResult> SkipExerciseSession(Guid id, Guid exerciseId)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.SkipExerciseSessionAsync(exerciseId, customerId);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("exercise/{exerciseId}/set")]
        public async Task<IActionResult> RegisterSet(Guid exerciseId, [FromBody] RegisterSetSessionRequest request)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.RegisterSetAsync(exerciseId, customerId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("set/{setId}")]
        public async Task<IActionResult> UpdateSet(Guid setId, [FromBody] UpdateSetSessionRequest request)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.UpdateSetAsync(setId, customerId, request);

                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("set/{setId}")]
        public async Task<IActionResult> DeleteSet(Guid setId)
        {
            try
            {
                var customerId = GetUserId();
                var response = await _workoutSessionService.DeleteSetAsync(setId, customerId);

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
