using Microsoft.AspNetCore.Mvc;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("[controller]")]
public class RoleController : ControllerBase
{
    private readonly IRoleService _service;
    public RoleController(IRoleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<Role>>> GetAll()
    {
        try
        {
            var roles = await _service.GetAllAsync();
            if (roles.Count == 0)
                return NoContent();
            return Ok(roles);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Role>> GetById(Guid id)
    {
        try
        {
            var role = await _service.GetByIdAsync(id);
            return Ok(role);
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
    public async Task<ActionResult<Role>> Create([FromBody] Role role)
    {
        if (role == null)
            return BadRequest("Role inválido.");
        try
        {
            var created = await _service.AddAsync(role);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Role>> Update(Guid id, [FromBody] Role role)
    {
        if (id != role.Id)
            return BadRequest("Id do role não corresponde ao parâmetro.");
        try
        {
            var updated = await _service.UpdateAsync(role);
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
