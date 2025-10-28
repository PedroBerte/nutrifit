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
                return StatusCode(500, "Erro ao buscar v�nculos cliente-profissional.");

            if (bonds.Count == 0)
                return NoContent();

            return Ok(bonds.Adapt<List<BondDto>>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    /// <summary>
    /// Retorna os v�nculos enviados pelo usu�rio autenticado
    /// </summary>
    [HttpGet("sent")]
    public async Task<ActionResult<List<BondDto>>> GetSent()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);
            var bonds = await _service.GetBySenderIdAsync(userId);
            
            if (bonds.Count == 0)
                return NoContent();

            return Ok(bonds.Adapt<List<BondDto>>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    /// <summary>
    /// Retorna os v�nculos recebidos pelo usu�rio autenticado (onde ele n�o � o sender)
    /// </summary>
    [HttpGet("received")]
    public async Task<ActionResult<List<BondDto>>> GetReceived()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);
            var bonds = await _service.GetReceivedByUserIdAsync(userId);
            
            if (bonds.Count == 0)
                return NoContent();

            return Ok(bonds.Adapt<List<BondDto>>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    /// <summary>
    /// Retorna os v�nculos onde o usu�rio autenticado � o cliente
    /// </summary>
    [HttpGet("as-customer")]
    public async Task<ActionResult<List<BondDto>>> GetAsCustomer()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);
            var bonds = await _service.GetByCustomerIdAsync(userId);
            
            if (bonds.Count == 0)
                return NoContent();

            return Ok(bonds.Adapt<List<BondDto>>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    /// <summary>
    /// Retorna os v�nculos onde o usu�rio autenticado � o profissional
    /// </summary>
    [HttpGet("as-professional")]
    public async Task<ActionResult<List<BondDto>>> GetAsProfessional()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);
            var bonds = await _service.GetByProfessionalIdAsync(userId);
            
            if (bonds.Count == 0)
                return NoContent();

            return Ok(bonds.Adapt<List<BondDto>>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    /// <summary>
    /// Retorna todos os v�nculos do usu�rio autenticado (como cliente ou profissional)
    /// </summary>
    [HttpGet("my-bonds")]
    public async Task<ActionResult<List<BondDto>>> GetMyBonds()
    {
        try
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);
            var bonds = await _service.GetByUserIdAsync(userId);
            
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
            return BadRequest("V�nculo cliente-profissional inv�lido.");

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
            return BadRequest("Id do v�nculo cliente-profissional n�o corresponde ao par�metro.");

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