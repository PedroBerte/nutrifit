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

    /// <summary>
    /// Retorna os vínculos enviados pelo usuário autenticado
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
    /// Retorna os vínculos recebidos pelo usuário autenticado (onde ele não é o sender)
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
    /// Retorna os vínculos onde o usuário autenticado é o cliente
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
    /// Retorna os vínculos onde o usuário autenticado é o profissional
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
    /// Retorna todos os vínculos do usuário autenticado (como cliente ou profissional)
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

    /// <summary>
    /// Retorna os alunos ativos do profissional autenticado com paginação e busca
    /// </summary>
    [HttpGet("active-students")]
    public async Task<IActionResult> GetActiveStudents([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
    {
        try
        {
            var professionalId = Guid.Parse(User.FindFirst("id")!.Value);
            var response = await _service.GetActiveStudentsAsync(professionalId, page, pageSize, search);

            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
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
            return BadRequest("vínculo cliente-profissional inválido.");

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