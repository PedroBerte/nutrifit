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
        Task<ApiResponse> CompleteWorkoutSessionAsync(Guid customerId, CompleteWorkoutSessionRequest request);
        Task<ApiResponse> GetWorkoutSessionByIdAsync(Guid sessionId);
        Task<ApiResponse> GetCustomerWorkoutHistoryAsync(Guid customerId, int page = 1, int pageSize = 20);

        // Previous Exercise Data
        Task<ApiResponse> GetPreviousExerciseDataAsync(Guid exerciseId, Guid customerId);

        // Exercise History
        Task<ApiResponse> GetExerciseHistoryAsync(Guid exerciseId, Guid customerId);
    }
}
