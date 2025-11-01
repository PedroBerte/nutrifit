using Nutrifit.Services.DTO;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services.Interfaces;

public interface IExerciseService
{
    Task<ApiResponse> GetAllExercisesAsync(int page = 1, int pageSize = 50, string? userId = null);
    Task<ApiResponse> GetExerciseByIdAsync(Guid exerciseId);
    Task<ApiResponse> SearchExercisesAsync(string searchTerm, Guid? categoryId = null, int page = 1, int pageSize = 20, string? userId = null);
    Task<ApiResponse> GetExerciseCategoriesAsync();
    Task<ApiResponse> GetMuscleGroupsAsync();
    Task<ApiResponse> GetExercisesByMuscleGroupAsync(Guid muscleGroupId);
    Task<ApiResponse> CreateExerciseAsync(CreateExerciseRequest request, Guid userId);
    Task<ApiResponse> UpdateExerciseAsync(Guid exerciseId, UpdateExerciseRequest request, Guid userId);
    Task<ApiResponse> DeleteExerciseAsync(Guid exerciseId, Guid userId);
    Task<ApiResponse> GetUserExercisesAsync(Guid userId, int page = 1, int pageSize = 50);
}
