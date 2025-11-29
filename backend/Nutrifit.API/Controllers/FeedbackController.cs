using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
using System.Security.Claims;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public FeedbackController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackRequest request)
    {
        try
        {
            var userId = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            // Validate that the user is the customer in the request
            if (request.CustomerId.ToString() != userId)
            {
                return Forbid("You can only create feedback for yourself");
            }

            if (request.Rate < 1 || request.Rate > 5)
            {
                return BadRequest("Rating must be between 1 and 5");
            }

            var feedback = await _feedbackService.CreateFeedbackAsync(request);
            return Ok(feedback);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error creating feedback: {ex.Message}");
        }
    }

    [HttpGet("professional/{professionalId}")]
    public async Task<IActionResult> GetProfessionalFeedbacks(Guid professionalId)
    {
        try
        {
            var feedbacks = await _feedbackService.GetProfessionalFeedbacksAsync(professionalId);
            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving feedbacks: {ex.Message}");
        }
    }

    [HttpGet("bond")]
    public async Task<IActionResult> GetFeedbackByBond([FromQuery] Guid customerId, [FromQuery] Guid professionalId)
    {
        try
        {
            var userId = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            // Validate that the user is either the customer or the professional
            if (customerId.ToString() != userId && professionalId.ToString() != userId)
            {
                return Forbid("You can only view your own feedback");
            }

            var feedback = await _feedbackService.GetFeedbackByBondAsync(customerId, professionalId);
            
            if (feedback == null)
            {
                return NotFound("No feedback found for this bond");
            }

            return Ok(feedback);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error retrieving feedback: {ex.Message}");
        }
    }
}
