using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using System.Security.Claims;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/workouts")]
[Authorize]
public class SelfManagedWorkoutController : ControllerBase
{
    private readonly ISelfManagedWorkoutService _selfManagedWorkoutService;

    public SelfManagedWorkoutController(ISelfManagedWorkoutService selfManagedWorkoutService)
    {
        _selfManagedWorkoutService = selfManagedWorkoutService;
    }

    private Guid GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("id")?.Value;
        return Guid.Parse(userId!);
    }

    [HttpGet("templates")]
    public async Task<IActionResult> GetTemplates()
    {
        var response = await _selfManagedWorkoutService.GetTemplatesAsync(GetUserId());
        return Ok(response.Data);
    }

    [HttpPost("templates")]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateSelfManagedWorkoutTemplateRequest request)
    {
        var response = await _selfManagedWorkoutService.CreateTemplateAsync(GetUserId(), request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response.Data);
    }

    [HttpGet("templates/{workoutId}")]
    public async Task<IActionResult> GetTemplateById(Guid workoutId)
    {
        var response = await _selfManagedWorkoutService.GetTemplateByIdAsync(GetUserId(), workoutId);
        if (!response.Success)
            return NotFound(response);

        return Ok(response.Data);
    }

    [HttpPut("templates/{workoutId}")]
    public async Task<IActionResult> UpdateTemplate(Guid workoutId, [FromBody] UpdateSelfManagedWorkoutTemplateRequest request)
    {
        var response = await _selfManagedWorkoutService.UpdateTemplateAsync(GetUserId(), workoutId, request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    [HttpDelete("templates/{workoutId}")]
    public async Task<IActionResult> DeleteTemplate(Guid workoutId)
    {
        var response = await _selfManagedWorkoutService.DeleteTemplateAsync(GetUserId(), workoutId);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var response = await _selfManagedWorkoutService.GetSessionsAsync(GetUserId(), page, pageSize);
        return Ok(response.Data);
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession([FromBody] CreateSelfManagedWorkoutSessionRequest request)
    {
        var response = await _selfManagedWorkoutService.CreateSessionAsync(GetUserId(), request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response.Data);
    }

    [HttpGet("sessions/{sessionId}")]
    public async Task<IActionResult> GetSessionById(Guid sessionId)
    {
        var response = await _selfManagedWorkoutService.GetSessionByIdAsync(GetUserId(), sessionId);
        if (!response.Success)
            return NotFound(response);

        return Ok(response.Data);
    }

    [HttpPost("sessions/{sessionId}/finish")]
    public async Task<IActionResult> FinishSession(Guid sessionId, [FromBody] FinishSelfManagedWorkoutSessionRequest request)
    {
        var response = await _selfManagedWorkoutService.FinishSessionAsync(GetUserId(), sessionId, request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response.Data);
    }
}
