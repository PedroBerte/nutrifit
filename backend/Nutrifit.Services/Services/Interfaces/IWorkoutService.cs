using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services.Interfaces;

public interface IWorkoutService
{
    // Workout CRUD
    Task<ApiResponse> CreateWorkoutAsync(Guid routineId, Guid personalId, CreateWorkoutRequest request);
    Task<ApiResponse> UpdateWorkoutAsync(Guid workoutId, Guid personalId, UpdateWorkoutRequest request);
    Task<ApiResponse> DeleteWorkoutAsync(Guid workoutId, Guid personalId);
    Task<ApiResponse> GetWorkoutByIdAsync(Guid workoutId);
    Task<ApiResponse> GetWorkoutsByRoutineAsync(Guid routineId);
    Task<ApiResponse> CompleteWorkoutAsync(Guid workoutId, Guid userId, CompleteWorkoutRequest request);
    
    // Workout Feedback
    Task<ApiResponse> CreateWorkoutFeedbackAsync(Guid workoutId, Guid userId, CreateWorkoutFeedbackRequest request);
    Task<ApiResponse> UpdateWorkoutFeedbackAsync(Guid workoutId, Guid userId, CreateWorkoutFeedbackRequest request);
    
    // Workout Sets
    Task<ApiResponse> CreateWorkoutSetAsync(Guid workoutId, Guid personalId, CreateWorkoutSetRequest request);
    Task<ApiResponse> UpdateWorkoutSetAsync(Guid setId, Guid personalId, UpdateWorkoutSetRequest request);
    Task<ApiResponse> DeleteWorkoutSetAsync(Guid setId, Guid personalId);
    
    // Workout Exercises
    Task<ApiResponse> CreateWorkoutExerciseAsync(Guid setId, Guid userId, CreateWorkoutExerciseRequest request);
    Task<ApiResponse> UpdateWorkoutExerciseAsync(Guid exerciseId, Guid userId, UpdateWorkoutExerciseRequest request);
    Task<ApiResponse> DeleteWorkoutExerciseAsync(Guid exerciseId, Guid userId);
    Task<ApiResponse> CompleteWorkoutExerciseAsync(Guid exerciseId, Guid userId);
}
