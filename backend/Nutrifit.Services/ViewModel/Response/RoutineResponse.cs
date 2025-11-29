namespace Nutrifit.Services.ViewModel.Response;

public class RoutineResponse
{
    public Guid Id { get; set; }
    public Guid PersonalId { get; set; }
    public string PersonalName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public string? Difficulty { get; set; }
    public int? Weeks { get; set; }
    public string Status { get; set; } = "A";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int WorkoutCount { get; set; }
    public int AssignedCustomersCount { get; set; }
}

public class RoutineDetailResponse
{
    public Guid Id { get; set; }
    public Guid PersonalId { get; set; }
    public string PersonalName { get; set; } = string.Empty;
    public string? PersonalImageUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public string? Difficulty { get; set; }
    public int? Weeks { get; set; }
    public string Status { get; set; } = "A";
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<WorkoutSummaryResponse>? Workouts { get; set; }
    public List<AssignedCustomerResponse>? AssignedCustomers { get; set; }
}

public class AssignedCustomerResponse
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerImageUrl { get; set; }
    public DateTime AssignedAt { get; set; }
}

public class RoutineCustomersResponse
{
    public List<CustomerBasicInfo> AssignedCustomers { get; set; } = new();
    public List<CustomerBasicInfo> AvailableCustomers { get; set; } = new();
}

public class CustomerBasicInfo
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? VideoUrl { get; set; }
    public DateTime? AssignedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
