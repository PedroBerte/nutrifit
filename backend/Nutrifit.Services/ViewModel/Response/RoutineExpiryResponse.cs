namespace Nutrifit.Services.ViewModel.Response;

public class RoutineExpiryResponse
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerImageUrl { get; set; }
    public Guid RoutineId { get; set; }
    public string RoutineTitle { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int DaysUntilExpiry { get; set; }
}
