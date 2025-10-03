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

    [HttpPost("subscribe")]
    [Authorize]
    public async Task<IActionResult> Subscribe([FromBody] PushSubscriptionDto dto)
    { 
        await _pushService.Subscribe(dto, Guid.Parse(User.FindFirst("id")!.Value), Request.Headers.UserAgent.ToString());
        return Ok();
    }

    [HttpPost("unsubscribe")]
    [Authorize]
    public async Task<IActionResult> Unsubscribe([FromBody] string endpoint)
    { 
        await _pushService.Unsubscribe(endpoint, Guid.Parse(User.FindFirst("id")!.Value));
        return Ok();
    }

    [HttpPost("notify-user/{userId:guid}")]
    [Authorize()]
    public async Task<IActionResult> NotifyUser(Guid userId, [FromServices] [FromBody] NotificationRequest req)
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

    [HttpPost("push/test-me")]
    [Authorize()]
    public async Task<IActionResult> TestMe()
    {
        var userId = Guid.Parse(User.FindFirst("id")!.Value);
        await _pushService.SendToUserAsync(userId, new
        {
            title = "Teste 🔔",
            body = "Notificação de teste enviada pela API",
            url = "/",
            actions = new[] { new { action = "open", title = "Abrir" } }
        });
        return Ok(new { ok = true });
    }

}
