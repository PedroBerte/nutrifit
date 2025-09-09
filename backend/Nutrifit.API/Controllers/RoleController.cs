using Nutrifit.Services.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Repository.Entities;
using AutoMapper;
using Nutrifit.Services.DTO;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly IRoleService _service;
    private readonly IMapper _mapper;
    public RoleController(IRoleService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<RoleDto>>> GetAll()
    {
        try
        {
            var roles = await _service.GetAllAsync();
            if (roles.Count == 0)
                return NoContent();
            return Ok(_mapper.Map<List<RoleDto>>(roles));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoleDto>> GetById(Guid id)
    {
        try
        {
            var role = await _service.GetByIdAsync(id);
            return Ok(_mapper.Map<RoleDto>(role));
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
    public async Task<ActionResult<RoleDto>> Create([FromBody] RoleDto roleDto)
    {
        if (roleDto == null)
            return BadRequest("Role inválido.");
        try
        {
            var role = _mapper.Map<Role>(roleDto);
            var created = await _service.AddAsync(role);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, _mapper.Map<RoleDto>(created));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RoleDto>> Update(Guid id, [FromBody] RoleDto roleDto)
    {
        if (id != roleDto.Id)
            return BadRequest("Id do role não corresponde ao parâmetro.");
        try
        {
            var role = _mapper.Map<Role>(roleDto);
            var updated = await _service.UpdateAsync(role);
            return Ok(_mapper.Map<RoleDto>(updated));
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
