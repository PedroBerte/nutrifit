using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services.Interfaces;

public interface IRoutineService
{
    Task<ApiResponse> CreateRoutineAsync(Guid personalId, CreateRoutineRequest request);
    Task<ApiResponse> UpdateRoutineAsync(Guid routineId, Guid personalId, UpdateRoutineRequest request);
    Task<ApiResponse> DeleteRoutineAsync(Guid routineId, Guid personalId);
    Task<ApiResponse> GetRoutineByIdAsync(Guid routineId);
    Task<ApiResponse> GetRoutinesByPersonalAsync(Guid personalId, int page = 1, int pageSize = 10);
    Task<ApiResponse> AssignRoutineToCustomerAsync(Guid personalId, AssignRoutineToCustomerRequest request);
    Task<ApiResponse> UnassignRoutineFromCustomerAsync(Guid routineId, Guid customerId, Guid personalId);
    Task<ApiResponse> GetCustomerRoutinesAsync(Guid customerId, int page = 1, int pageSize = 10);
    Task<ApiResponse> GetRoutineCustomersAsync(Guid routineId, Guid personalId);
}
