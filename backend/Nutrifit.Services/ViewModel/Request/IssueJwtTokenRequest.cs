namespace Nutrifit.Services.ViewModel.Request
{
    public class IssueJwtTokenRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public Guid Profile { get; set; }
        public bool IsAdmin { get; set; }
        public bool Invited { get; set; } = false;
        public Guid? ProfessionalInviterId { get; set; }
    }
}
