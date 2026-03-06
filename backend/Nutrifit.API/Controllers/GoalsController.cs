using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using System.Security.Claims;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/goals")]
[Authorize]
public class GoalsController : ControllerBase
{
    private readonly IGoalService _goalService;

    public GoalsController(IGoalService goalService)
    {
        _goalService = goalService;
    }

    private Guid GetUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("id")?.Value;
        return Guid.Parse(userId!);
    }

    [HttpGet("weekly")]
    public async Task<IActionResult> GetWeeklyGoal()
    {
        var response = await _goalService.GetWeeklyGoalAsync(GetUserId());
        if (!response.Success)
            return NotFound(response);

        return Ok(response.Data);
    }

    [HttpPut("weekly")]
    public async Task<IActionResult> UpsertWeeklyGoal([FromBody] UpsertWeeklyGoalRequest request)
    {
        var response = await _goalService.UpsertWeeklyGoalAsync(GetUserId(), request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response.Data);
    }

    [HttpGet("weekly/progress")]
    public async Task<IActionResult> GetWeeklyProgress()
    {
        var response = await _goalService.GetWeeklyProgressAsync(GetUserId());
        if (!response.Success)
            return NotFound(response);

        return Ok(response.Data);
    }
}
