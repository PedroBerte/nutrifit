namespace Nutrifit.Services.DTO
{
    public class AppointmentDto
    {
        public Guid Id { get; set; }
        public Guid CustomerProfessionalBondId { get; set; }
        public DateTime ScheduledAt { get; set; }
        public string Type { get; set; } = "PR"; // PR = Presencial, ON = Online
        public Guid? AddressId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = "P"; // P = Pendente, A = Aceito, R = Rejeitado, C = Cancelado

        // Navigation properties - populated only when needed
        public AddressDto? Address { get; set; }
        public AppointmentBondDto? CustomerProfessionalBond { get; set; }
    }

    public class AppointmentBondDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public Guid ProfessionalId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties - populated only when needed
        public UserSimpleDto? Customer { get; set; }
        public UserSimpleDto? Professional { get; set; }
    }

    public class UserSimpleDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}
