using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _service;
    private readonly IAddressService _addressService;

    public AppointmentController(IAppointmentService service, IAddressService addressService)
    {
        _service = service;
        _addressService = addressService;
    }

    [HttpGet("bond/{bondId}")]
    public async Task<IActionResult> GetByBondId(Guid bondId)
    {
        try
        {
            var appointments = await _service.GetByBondIdAsync(bondId);
            return Ok(appointments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var appointment = await _service.GetByIdAsync(id);
            return Ok(appointment);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request)
    {
        try
        {
            var appointment = new AppointmentEntity
            {
                CustomerProfessionalBondId = request.CustomerProfessionalBondId,
                ScheduledAt = request.ScheduledAt,
                Type = request.Type
            };

            // Se for presencial e tiver endereço, criar o endereço primeiro
            if (request.Type == "PR" && request.Address != null)
            {
                var address = new AddressEntity
                {
                    ZipCode = request.Address.ZipCode,
                    AddressLine = request.Address.AddressLine,
                    Number = request.Address.Number,
                    City = request.Address.City,
                    State = request.Address.State,
                    Country = request.Address.Country ?? "Brasil",
                    AddressType = request.Address.Type == "residential" ? 0 : 1
                };

                var createdAddress = await _addressService.CreateAsync(address);
                appointment.AddressId = createdAddress.Id;
            }

            var result = await _service.CreateAsync(appointment);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAppointmentRequest request)
    {
        try
        {
            var existing = await _service.GetByIdAsync(id);
            existing.Status = request.Status;
            existing.ScheduledAt = request.ScheduledAt ?? existing.ScheduledAt;

            var result = await _service.UpdateAsync(existing);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
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
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}

public class CreateAppointmentRequest
{
    public Guid CustomerProfessionalBondId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Type { get; set; } = "PR";
    public AddressRequest? Address { get; set; }
}

public class AddressRequest
{
    public string ZipCode { get; set; } = string.Empty;
    public string AddressLine { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string? Country { get; set; }
    public string? Type { get; set; }
}

public class UpdateAppointmentRequest
{
    public string Status { get; set; } = string.Empty;
    public DateTime? ScheduledAt { get; set; }
}
