using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;
using System.Security.Claims;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IFavoriteService _service;

    public FavoriteController(IFavoriteService service)
    {
        _service = service;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("Usuário não autenticado.");
        
        return Guid.Parse(userIdClaim);
    }

    [HttpPost("{professionalId}")]
    public async Task<ActionResult> AddFavorite(Guid professionalId)
    {
        try
        {
            var customerId = GetCurrentUserId();
            var favorite = await _service.AddFavoriteAsync(customerId, professionalId);
            return Ok(new { message = "Profissional adicionado aos favoritos.", favoriteId = favorite.Id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpDelete("{professionalId}")]
    public async Task<ActionResult> RemoveFavorite(Guid professionalId)
    {
        try
        {
            var customerId = GetCurrentUserId();
            await _service.RemoveFavoriteAsync(customerId, professionalId);
            return Ok(new { message = "Profissional removido dos favoritos." });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet]
    public async Task<ActionResult> GetFavorites()
    {
        try
        {
            var customerId = GetCurrentUserId();
            var favorites = await _service.GetCustomerFavoritesAsync(customerId);
            return Ok(favorites);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet("check/{professionalId}")]
    public async Task<ActionResult> CheckFavorite(Guid professionalId)
    {
        try
        {
            var customerId = GetCurrentUserId();
            var isFavorite = await _service.IsFavoriteAsync(customerId, professionalId);
            return Ok(new { isFavorite });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }
}
