using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services.Interfaces;

public interface IGoalService
{
    Task<ApiResponse> GetWeeklyGoalAsync(Guid userId);
    Task<ApiResponse> UpsertWeeklyGoalAsync(Guid userId, UpsertWeeklyGoalRequest request);
    Task<ApiResponse> GetWeeklyProgressAsync(Guid userId);
}
