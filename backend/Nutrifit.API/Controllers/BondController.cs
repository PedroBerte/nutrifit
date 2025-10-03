using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BondController : ControllerBase
{
    private readonly IBondService _service;

    public BondController(IBondService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<BondDto>>> GetAll()
    {
        try
        {
            var bonds = await _service.GetAllAsync();
            if (bonds == null)
                return StatusCode(500, "Erro ao buscar vínculos cliente-profissional.");

            if (bonds.Count == 0)
                return NoContent();

            return Ok(bonds.Adapt<List<BondDto>>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BondDto>> GetById(Guid id)
    {
        try
        {
            var bond = await _service.GetByIdAsync(id);

            if (bond == null)
                return NotFound();

            return Ok(bond.Adapt<BondDto>());
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
    public async Task<ActionResult<BondDto>> Create([FromBody] BondDto bondDto)
    {
        if (bondDto == null)
            return BadRequest("Vínculo cliente-profissional inválido.");

        try
        {
            var bond = bondDto.Adapt<CustomerProfessionalBondEntity>();
            var created = await _service.AddAsync(bond);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created.Adapt<BondDto>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BondDto>> Update(Guid id, [FromBody] BondDto bondDto)
    {
        if (bondDto == null || id != bondDto.Id)
            return BadRequest("Id do vínculo cliente-profissional não corresponde ao parâmetro.");

        try
        {
            var bond = bondDto.Adapt<CustomerProfessionalBondEntity>();
            var updated = await _service.UpdateAsync(bond);
            return Ok(updated.Adapt<BondDto>());
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