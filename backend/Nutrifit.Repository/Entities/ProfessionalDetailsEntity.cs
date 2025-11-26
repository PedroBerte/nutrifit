namespace Nutrifit.Repository.Entities;

public class ProfessionalDetailsEntity
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public AttendanceMode AttendanceMode { get; set; }
    public string? Tag1 { get; set; }
    public string? Tag2 { get; set; }
    public string? Tag3 { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public UserEntity Professional { get; set; } = null!;
}

public enum AttendanceMode
{
    Presencial = 0,
    Online = 1,
    Hibrido = 2
}
