namespace Nutrifit.Services.DTO
{
    public class ProfessionalCredentialDto
    {
        public Guid? Id { get; set; }
        public Guid ProfessionalId { get; set; }
        public string? Status { get; set; }
        public string Type { get; set; }
        public string CredentialId { get; set; }
        public string? Biography { get; set; }
    }
}
