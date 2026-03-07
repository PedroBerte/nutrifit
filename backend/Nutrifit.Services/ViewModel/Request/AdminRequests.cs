namespace Nutrifit.Services.ViewModel.Request;

public class ActivateAdminRequest
{
    public string Code { get; set; } = string.Empty;
}

public class UpdateUserStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class UpdateUserAdminRequest
{
    public bool IsAdmin { get; set; }
}

public class UpdateBondStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
