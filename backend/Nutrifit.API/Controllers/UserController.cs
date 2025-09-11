using Nutrifit.Services.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Repository.Entities;
using AutoMapper;
using Nutrifit.Services.DTO;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _service;
    private readonly IMapper _mapper;
    public UserController(IUserService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        try
        {
            var users = await _service.GetAllAsync();
            if (users == null)
                return StatusCode(500, "Erro ao buscar usuários.");
            if (users.Count == 0)
                return NoContent();
            return Ok(_mapper.Map<List<UserDto>>(users));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id)
    {
        try
        {
            var user = await _service.GetByIdAsync(id);
            if (user == null)
                return NotFound();
            return Ok(_mapper.Map<UserDto>(user));
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
    public async Task<ActionResult<UserDto>> Create([FromBody] UserDto userDto)
    {
        if (userDto == null)
            return BadRequest("Usuário inválido.");
        try
        {
            var user = _mapper.Map<User>(userDto);
            user.Password = "";
            var created = await _service.AddAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, _mapper.Map<UserDto>(created));
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> Update(Guid id, [FromBody] UserDto userDto)
    {
        if (id != userDto.Id)
            return BadRequest("Id do usuário não corresponde ao parâmetro.");
        try
        {
            var user = _mapper.Map<User>(userDto);
            user.Password = ""; // Defina a senha conforme sua lógica
            var updated = await _service.UpdateAsync(user);
            return Ok(_mapper.Map<UserDto>(updated));
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
