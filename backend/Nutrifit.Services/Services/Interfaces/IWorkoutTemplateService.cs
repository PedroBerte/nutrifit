using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Nutrifit.Services.Services.Interfaces
{
    public interface IWorkoutTemplateService
    {
        Task<ApiResponse> CreateWorkoutTemplateAsync(Guid routineId, Guid personalId, CreateWorkoutTemplateRequest request);
        Task<ApiResponse> UpdateWorkoutTemplateAsync(Guid templateId, Guid personalId, UpdateWorkoutTemplateRequest request);
        Task<ApiResponse> DeleteWorkoutTemplateAsync(Guid templateId, Guid personalId);
        Task<ApiResponse> GetWorkoutTemplateByIdAsync(Guid templateId);
        Task<ApiResponse> GetWorkoutTemplatesByRoutineAsync(Guid routineId);

        // Exercise Templates
        Task<ApiResponse> AddExerciseToTemplateAsync(Guid templateId, Guid personalId, CreateExerciseTemplateRequest request);
        Task<ApiResponse> UpdateExerciseTemplateAsync(Guid exerciseTemplateId, Guid personalId, UpdateExerciseTemplateRequest request);
        Task<ApiResponse> RemoveExerciseFromTemplateAsync(Guid exerciseTemplateId, Guid personalId);
        Task<ApiResponse> ReorderExercisesAsync(Guid templateId, Guid personalId, List<Guid> exerciseTemplateIds);
    }
}
