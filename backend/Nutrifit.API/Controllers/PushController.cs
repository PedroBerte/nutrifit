using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using System;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PushController : ControllerBase
{
    private readonly IPushService _pushService;
    public PushController(IPushService push)
    {
        _pushService = push;
    }

    [HttpPost("Subscribe")]
    [Authorize]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionDto dto)
    { 
        await _pushService.Subscribe(dto, Guid.Parse(User.FindFirst("id")!.Value), Request.Headers.UserAgent.ToString());
        return Ok();
    }

    [HttpPost("Unsubscribe")]
    [Authorize]
    public async Task<IActionResult> Unsubscribe([FromBody] string endpoint)
    { 
        await _pushService.Unsubscribe(endpoint, Guid.Parse(User.FindFirst("id")!.Value));
        return Ok();
    }

    [HttpPost("NotifyUser/{userId:guid}")]
    [Authorize]
    public async Task<IActionResult> NotifyUser(Guid userId, [FromBody] NotificationRequest req)
    {
        var payload = new
        {
            title = req.Title,
            body = req.Body,
            url = req.Url,
            actions = req.Actions
        };

        await _pushService.SendToUserAsync(userId, payload);
        return Ok(new { ok = true });
    }
}
