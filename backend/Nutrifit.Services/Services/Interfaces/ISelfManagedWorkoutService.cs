using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services.Interfaces;

public interface ISelfManagedWorkoutService
{
    Task<ApiResponse> GetTemplatesAsync(Guid userId);
    Task<ApiResponse> CreateTemplateAsync(Guid userId, CreateSelfManagedWorkoutTemplateRequest request);
    Task<ApiResponse> GetTemplateByIdAsync(Guid userId, Guid workoutId);
    Task<ApiResponse> UpdateTemplateAsync(Guid userId, Guid workoutId, UpdateSelfManagedWorkoutTemplateRequest request);
    Task<ApiResponse> DeleteTemplateAsync(Guid userId, Guid workoutId);

    Task<ApiResponse> GetSessionsAsync(Guid userId, int page, int pageSize);
    Task<ApiResponse> CreateSessionAsync(Guid userId, CreateSelfManagedWorkoutSessionRequest request);
    Task<ApiResponse> GetSessionByIdAsync(Guid userId, Guid sessionId);
    Task<ApiResponse> FinishSessionAsync(Guid userId, Guid sessionId, FinishSelfManagedWorkoutSessionRequest request);
}
