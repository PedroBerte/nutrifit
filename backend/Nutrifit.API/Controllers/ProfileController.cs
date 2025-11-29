using Nutrifit.Services.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;
using Mapster;
using Microsoft.AspNetCore.Authorization;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _service;

    public ProfileController(IProfileService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProfileDto>>> GetAll()
    {
        try
        {
            var profiles = await _service.GetAllAsync();
            if (profiles.Count == 0)
                return NoContent();

            return Ok(profiles.Adapt<List<ProfileDto>>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProfileDto>> GetById(Guid id)
    {
        try
        {
            var profile = await _service.GetByIdAsync(id);
            if (profile == null)
                return NotFound();

            return Ok(profile.Adapt<ProfileDto>());
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

    [HttpPost]
    public async Task<ActionResult<ProfileDto>> Create([FromBody] ProfileDto profileDto)
    {
        if (profileDto == null)
            return BadRequest("Perfil inválido.");

        try
        {
            var profile = profileDto.Adapt<ProfileEntity>();
            var created = await _service.AddAsync(profile);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.Adapt<ProfileDto>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProfileDto>> Update(Guid id, [FromBody] ProfileDto profileDto)
    {
        if (id != profileDto.Id)
            return BadRequest("Id do perfil não corresponde ao parâmetro.");

        try
        {
            var profile = profileDto.Adapt<ProfileEntity>();
            var updated = await _service.UpdateAsync(profile);
            return Ok(updated.Adapt<ProfileDto>());
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return NoContent();
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
}
