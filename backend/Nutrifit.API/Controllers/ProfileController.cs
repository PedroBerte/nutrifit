using Microsoft.AspNetCore.Mvc;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _service;
    public ProfileController(IProfileService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<Profile>>> GetAll()
    {
        try
        {
            var profiles = await _service.GetAllAsync();
            if (profiles.Count == 0)
                return NoContent();
            return Ok(profiles);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Profile>> GetById(Guid id)
    {
        try
        {
            var profile = await _service.GetByIdAsync(id);
            return Ok(profile);
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
    public async Task<ActionResult<Profile>> Create([FromBody] Profile profile)
    {
        if (profile == null)
            return BadRequest("Perfil inválido.");
        try
        {
            var created = await _service.AddAsync(profile);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Profile>> Update(Guid id, [FromBody] Profile profile)
    {
        if (id != profile.Id)
            return BadRequest("Id do perfil não corresponde ao parâmetro.");
        try
        {
            var updated = await _service.UpdateAsync(profile);
            return Ok(updated);
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
