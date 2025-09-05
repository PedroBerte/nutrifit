namespace Nutrifit.Services.DTO
{
    public class IssueJwtTokenRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public Guid[] Roles { get; set; } = null!;
        public bool IsAdmin { get; set; }
    }
}
