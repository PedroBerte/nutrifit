using Nutrifit.Services.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Repository.Entities;
using AutoMapper;
using ProfileEntity = Nutrifit.Repository.Entities.Profile;
using Nutrifit.Services.DTO;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _service;
    private readonly IMapper _mapper;
    public ProfileController(IProfileService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProfileDto>>> GetAll()
    {
        try
        {
            var profiles = await _service.GetAllAsync();
            if (profiles.Count == 0)
                return NoContent();
            return Ok(_mapper.Map<List<ProfileDto>>(profiles));
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
            return Ok(_mapper.Map<ProfileDto>(profile));
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
            var profile = _mapper.Map<ProfileEntity>(profileDto);
            var created = await _service.AddAsync(profile);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, _mapper.Map<ProfileDto>(created));
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
            var profile = _mapper.Map<ProfileEntity>(profileDto);
            var updated = await _service.UpdateAsync(profile);
            return Ok(_mapper.Map<ProfileDto>(updated));
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
