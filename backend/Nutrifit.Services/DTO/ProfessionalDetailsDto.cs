using Nutrifit.Repository.Entities;

namespace Nutrifit.Services.DTO;

public class ProfessionalDetailsDto
{
    public Guid? Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public AttendanceMode AttendanceMode { get; set; }
    public string? Tag1 { get; set; }
    public string? Tag2 { get; set; }
    public string? Tag3 { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
