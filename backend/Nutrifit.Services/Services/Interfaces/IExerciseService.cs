using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services.Interfaces;

public interface IExerciseService
{
    Task<ApiResponse> GetAllExercisesAsync(int page = 1, int pageSize = 50);
    Task<ApiResponse> GetExerciseByIdAsync(Guid exerciseId);
    Task<ApiResponse> SearchExercisesAsync(string searchTerm, Guid? categoryId = null, int page = 1, int pageSize = 20);
    Task<ApiResponse> GetExerciseCategoriesAsync();
    Task<ApiResponse> GetMuscleGroupsAsync();
    Task<ApiResponse> GetExercisesByMuscleGroupAsync(Guid muscleGroupId);
}
