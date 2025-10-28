using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Nutrifit.Services.Services.Interfaces
{
    public interface IWorkoutSessionService
    {
        // Session Management
        Task<ApiResponse> StartWorkoutSessionAsync(Guid customerId, StartWorkoutSessionRequest request);
        Task<ApiResponse> CompleteWorkoutSessionAsync(Guid sessionId, Guid customerId, CompleteWorkoutSessionRequest request);
        Task<ApiResponse> CancelWorkoutSessionAsync(Guid sessionId, Guid customerId);
        Task<ApiResponse> GetWorkoutSessionByIdAsync(Guid sessionId);
        Task<ApiResponse> GetCustomerWorkoutHistoryAsync(Guid customerId, int page = 1, int pageSize = 20);
        Task<ApiResponse> GetActiveWorkoutSessionAsync(Guid customerId);

        // Exercise Session Management
        Task<ApiResponse> StartExerciseSessionAsync(Guid sessionId, Guid customerId, StartExerciseSessionRequest request);
        Task<ApiResponse> CompleteExerciseSessionAsync(Guid exerciseSessionId, Guid customerId);
        Task<ApiResponse> SkipExerciseSessionAsync(Guid exerciseSessionId, Guid customerId);

        // Set Registration
        Task<ApiResponse> RegisterSetAsync(Guid exerciseSessionId, Guid customerId, RegisterSetSessionRequest request);
        Task<ApiResponse> UpdateSetAsync(Guid setId, Guid customerId, UpdateSetSessionRequest request);
        Task<ApiResponse> DeleteSetAsync(Guid setId, Guid customerId);
    }
}
