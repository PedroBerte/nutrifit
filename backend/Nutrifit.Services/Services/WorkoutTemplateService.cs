using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services
{
    public class WorkoutTemplateService : IWorkoutTemplateService
    {
        private readonly NutrifitContext _context;

        public WorkoutTemplateService(NutrifitContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse> CreateWorkoutTemplateAsync(Guid routineId, Guid personalId, CreateWorkoutTemplateRequest request)
        {
            try
            {
                var routine = await _context.Routines
                    .FirstOrDefaultAsync(r => r.Id == routineId && r.PersonalId == personalId);

                if (routine == null)
                    return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão.");

                var template = new WorkoutTemplateEntity
                {
                    Id = Guid.NewGuid(),
                    RoutineId = routineId,
                    Title = request.Title,
                    Description = request.Description,
                    EstimatedDurationMinutes = request.EstimatedDurationMinutes,
                    Order = request.Order,
                    Status = "A",
                    CreatedAt = DateTime.UtcNow
                };

                _context.WorkoutTemplates.Add(template);

                if (request.ExerciseTemplates != null && request.ExerciseTemplates.Any())
                {
                    foreach (var exerciseReq in request.ExerciseTemplates)
                    {
                        var exerciseTemplate = new ExerciseTemplateEntity
                        {
                            Id = Guid.NewGuid(),
                            WorkoutTemplateId = template.Id,
                            ExerciseId = exerciseReq.ExerciseId,
                            Order = exerciseReq.Order,
                            TargetSets = exerciseReq.TargetSets,
                            TargetRepsMin = exerciseReq.TargetRepsMin,
                            TargetRepsMax = exerciseReq.TargetRepsMax,
                            SuggestedLoad = exerciseReq.SuggestedLoad,
                            RestSeconds = exerciseReq.RestSeconds,
                            Notes = exerciseReq.Notes,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.ExerciseTemplates.Add(exerciseTemplate);
                    }
                }

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Template de treino criado com sucesso!", template.Id);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao criar template: {ex.Message}");
            }
        }

        public async Task<ApiResponse> UpdateWorkoutTemplateAsync(Guid templateId, Guid personalId, UpdateWorkoutTemplateRequest request)
        {
            try
            {
                var template = await _context.WorkoutTemplates
                    .Include(wt => wt.Routine)
                    .FirstOrDefaultAsync(wt => wt.Id == templateId);

                if (template == null || template.Routine.PersonalId != personalId)
                    return ApiResponse.CreateFailure("Template não encontrado ou você não tem permissão.");

                if (!string.IsNullOrEmpty(request.Title))
                    template.Title = request.Title;

                if (request.Description != null)
                    template.Description = request.Description;

                if (request.EstimatedDurationMinutes.HasValue)
                    template.EstimatedDurationMinutes = request.EstimatedDurationMinutes;

                if (request.Order.HasValue)
                    template.Order = request.Order.Value;

                template.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Template atualizado com sucesso!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao atualizar template: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeleteWorkoutTemplateAsync(Guid templateId, Guid personalId)
        {
            try
            {
                var template = await _context.WorkoutTemplates
                    .Include(wt => wt.Routine)
                    .FirstOrDefaultAsync(wt => wt.Id == templateId);

                if (template == null || template.Routine.PersonalId != personalId)
                    return ApiResponse.CreateFailure("Template não encontrado ou você não tem permissão.");

                template.Status = "I";
                template.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Template excluído com sucesso!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao excluir template: {ex.Message}");
            }
        }

        public async Task<ApiResponse> GetWorkoutTemplateByIdAsync(Guid templateId)
        {
            try
            {
                var template = await _context.WorkoutTemplates
                    .Include(wt => wt.ExerciseTemplates)
                        .ThenInclude(et => et.Exercise)
                    .FirstOrDefaultAsync(wt => wt.Id == templateId && wt.Status == "A");

                if (template == null)
                    return ApiResponse.CreateFailure("Template não encontrado.");

                var response = new WorkoutTemplateResponse
                {
                    Id = template.Id,
                    RoutineId = template.RoutineId,
                    Title = template.Title,
                    Description = template.Description,
                    EstimatedDurationMinutes = template.EstimatedDurationMinutes,
                    Order = template.Order,
                    Status = template.Status,
                    CreatedAt = template.CreatedAt,
                    UpdatedAt = template.UpdatedAt,
                    ExerciseTemplates = template.ExerciseTemplates
                        .OrderBy(et => et.Order)
                        .Select(et => new ExerciseTemplateResponse
                        {
                            Id = et.Id,
                            WorkoutTemplateId = et.WorkoutTemplateId,
                            ExerciseId = et.ExerciseId,
                            ExerciseName = et.Exercise.Name,
                            ExerciseUrl = et.Exercise.Url,
                            Order = et.Order,
                            TargetSets = et.TargetSets,
                            TargetRepsMin = et.TargetRepsMin,
                            TargetRepsMax = et.TargetRepsMax,
                            SuggestedLoad = et.SuggestedLoad,
                            RestSeconds = et.RestSeconds,
                            Notes = et.Notes,
                            CreatedAt = et.CreatedAt
                        }).ToList()
                };

                return ApiResponse.CreateSuccess("Template encontrado.", response);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao buscar template: {ex.Message}");
            }
        }

        public async Task<ApiResponse> GetWorkoutTemplatesByRoutineAsync(Guid routineId)
        {
            try
            {
                var templates = await _context.WorkoutTemplates
                    .Include(wt => wt.ExerciseTemplates)
                        .ThenInclude(et => et.Exercise)
                    .Where(wt => wt.RoutineId == routineId && wt.Status == "A")
                    .OrderBy(wt => wt.Order)
                    .ToListAsync();

                var response = templates.Select(template => new WorkoutTemplateResponse
                {
                    Id = template.Id,
                    RoutineId = template.RoutineId,
                    Title = template.Title,
                    Description = template.Description,
                    EstimatedDurationMinutes = template.EstimatedDurationMinutes,
                    Order = template.Order,
                    Status = template.Status,
                    CreatedAt = template.CreatedAt,
                    UpdatedAt = template.UpdatedAt,
                    ExerciseTemplates = template.ExerciseTemplates
                        .OrderBy(et => et.Order)
                        .Select(et => new ExerciseTemplateResponse
                        {
                            Id = et.Id,
                            WorkoutTemplateId = et.WorkoutTemplateId,
                            ExerciseId = et.ExerciseId,
                            ExerciseName = et.Exercise.Name,
                            ExerciseUrl = et.Exercise.Url,
                            Order = et.Order,
                            TargetSets = et.TargetSets,
                            TargetRepsMin = et.TargetRepsMin,
                            TargetRepsMax = et.TargetRepsMax,
                            SuggestedLoad = et.SuggestedLoad,
                            RestSeconds = et.RestSeconds,
                            Notes = et.Notes,
                            CreatedAt = et.CreatedAt
                        }).ToList()
                }).ToList();

                return ApiResponse.CreateSuccess("Templates encontrados.", response);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao buscar templates: {ex.Message}");
            }
        }

        public async Task<ApiResponse> AddExerciseToTemplateAsync(Guid templateId, Guid personalId, CreateExerciseTemplateRequest request)
        {
            try
            {
                var template = await _context.WorkoutTemplates
                    .Include(wt => wt.Routine)
                    .FirstOrDefaultAsync(wt => wt.Id == templateId);

                if (template == null || template.Routine.PersonalId != personalId)
                    return ApiResponse.CreateFailure("Template não encontrado ou você não tem permissão.");

                var exerciseTemplate = new ExerciseTemplateEntity
                {
                    Id = Guid.NewGuid(),
                    WorkoutTemplateId = templateId,
                    ExerciseId = request.ExerciseId,
                    Order = request.Order,
                    TargetSets = request.TargetSets,
                    TargetRepsMin = request.TargetRepsMin,
                    TargetRepsMax = request.TargetRepsMax,
                    SuggestedLoad = request.SuggestedLoad,
                    RestSeconds = request.RestSeconds,
                    Notes = request.Notes,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ExerciseTemplates.Add(exerciseTemplate);
                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Exercício adicionado ao template!", exerciseTemplate.Id);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao adicionar exercício: {ex.Message}");
            }
        }

        public async Task<ApiResponse> UpdateExerciseTemplateAsync(Guid exerciseTemplateId, Guid personalId, UpdateExerciseTemplateRequest request)
        {
            try
            {
                var exerciseTemplate = await _context.ExerciseTemplates
                    .Include(et => et.WorkoutTemplate)
                        .ThenInclude(wt => wt.Routine)
                    .FirstOrDefaultAsync(et => et.Id == exerciseTemplateId);

                if (exerciseTemplate == null || exerciseTemplate.WorkoutTemplate.Routine.PersonalId != personalId)
                    return ApiResponse.CreateFailure("Exercício não encontrado ou você não tem permissão.");

                if (request.Order.HasValue)
                    exerciseTemplate.Order = request.Order.Value;

                if (request.TargetSets.HasValue)
                    exerciseTemplate.TargetSets = request.TargetSets.Value;

                if (request.TargetRepsMin.HasValue)
                    exerciseTemplate.TargetRepsMin = request.TargetRepsMin;

                if (request.TargetRepsMax.HasValue)
                    exerciseTemplate.TargetRepsMax = request.TargetRepsMax;

                if (request.SuggestedLoad.HasValue)
                    exerciseTemplate.SuggestedLoad = request.SuggestedLoad;

                if (request.RestSeconds.HasValue)
                    exerciseTemplate.RestSeconds = request.RestSeconds;

                if (request.Notes != null)
                    exerciseTemplate.Notes = request.Notes;

                exerciseTemplate.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Exercício atualizado com sucesso!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao atualizar exercício: {ex.Message}");
            }
        }

        public async Task<ApiResponse> RemoveExerciseFromTemplateAsync(Guid exerciseTemplateId, Guid personalId)
        {
            try
            {
                var exerciseTemplate = await _context.ExerciseTemplates
                    .Include(et => et.WorkoutTemplate)
                        .ThenInclude(wt => wt.Routine)
                    .FirstOrDefaultAsync(et => et.Id == exerciseTemplateId);

                if (exerciseTemplate == null || exerciseTemplate.WorkoutTemplate.Routine.PersonalId != personalId)
                    return ApiResponse.CreateFailure("Exercício não encontrado ou você não tem permissão.");

                _context.ExerciseTemplates.Remove(exerciseTemplate);
                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Exercício removido do template!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao remover exercício: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ReorderExercisesAsync(Guid templateId, Guid personalId, List<Guid> exerciseTemplateIds)
        {
            try
            {
                var template = await _context.WorkoutTemplates
                    .Include(wt => wt.Routine)
                    .Include(wt => wt.ExerciseTemplates)
                    .FirstOrDefaultAsync(wt => wt.Id == templateId);

                if (template == null || template.Routine.PersonalId != personalId)
                    return ApiResponse.CreateFailure("Template não encontrado ou você não tem permissão.");

                for (int i = 0; i < exerciseTemplateIds.Count; i++)
                {
                    var exerciseTemplate = template.ExerciseTemplates.FirstOrDefault(et => et.Id == exerciseTemplateIds[i]);
                    if (exerciseTemplate != null)
                    {
                        exerciseTemplate.Order = i + 1;
                        exerciseTemplate.UpdatedAt = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Ordem dos exercícios atualizada!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao reordenar exercícios: {ex.Message}");
            }
        }
    }
}
