using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services;

public class WorkoutService : IWorkoutService
{
    private readonly NutrifitContext _context;

    public WorkoutService(NutrifitContext context)
    {
        _context = context;
    }

    #region Workout CRUD

    public async Task<ApiResponse> CreateWorkoutAsync(Guid routineId, Guid personalId, CreateWorkoutRequest request)
    {
        try
        {
            var routine = await _context.Routines
                .FirstOrDefaultAsync(r => r.Id == routineId && r.PersonalId == personalId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão");

            var workout = new WorkoutEntity
            {
                Id = Guid.NewGuid(),
                RoutineId = routineId,
                Title = request.Title,
                Description = request.Description,
                ExpectedDuration = request.ExpectedDuration,
                Status = "A",
                CreatedAt = DateTime.UtcNow
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            var response = new WorkoutSummaryResponse
            {
                Id = workout.Id,
                Title = workout.Title,
                Description = workout.Description,
                ExpectedDuration = workout.ExpectedDuration,
                Status = workout.Status,
                CreatedAt = workout.CreatedAt,
                ExerciseCount = 0,
                HasFeedback = false
            };

            return ApiResponse.CreateSuccess("Treino criado com sucesso", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao criar treino: {ex.Message}");
        }
    }

    public async Task<ApiResponse> UpdateWorkoutAsync(Guid workoutId, Guid personalId, UpdateWorkoutRequest request)
    {
        try
        {
            var workout = await _context.Workouts
                .Include(w => w.Routine)
                .FirstOrDefaultAsync(w => w.Id == workoutId && w.Routine.PersonalId == personalId);

            if (workout == null)
                return ApiResponse.CreateFailure("Treino não encontrado ou você não tem permissão");

            if (!string.IsNullOrEmpty(request.Title))
                workout.Title = request.Title;

            if (request.Description != null)
                workout.Description = request.Description;

            if (request.ExpectedDuration.HasValue)
                workout.ExpectedDuration = request.ExpectedDuration;

            if (!string.IsNullOrEmpty(request.Status))
                workout.Status = request.Status;

            if (request.TotalVolume.HasValue)
                workout.TotalVolume = request.TotalVolume;

            workout.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Treino atualizado com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao atualizar treino: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteWorkoutAsync(Guid workoutId, Guid personalId)
    {
        try
        {
            var workout = await _context.Workouts
                .Include(w => w.Routine)
                .FirstOrDefaultAsync(w => w.Id == workoutId && w.Routine.PersonalId == personalId);

            if (workout == null)
                return ApiResponse.CreateFailure("Treino não encontrado ou você não tem permissão");

            _context.Workouts.Remove(workout);
            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Treino excluído com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao excluir treino: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetWorkoutByIdAsync(Guid workoutId)
    {
        try
        {
            var workout = await _context.Workouts
                .Include(w => w.Routine)
                .Include(w => w.WorkoutFeedback)
                .Include(w => w.WorkoutSets.OrderBy(ws => ws.Order))
                    .ThenInclude(ws => ws.Exercise)
                        .ThenInclude(e => e.Category)
                .Include(w => w.WorkoutSets)
                    .ThenInclude(ws => ws.Exercise.PrimaryMuscles)
                        .ThenInclude(pm => pm.Muscle)
                .Include(w => w.WorkoutSets)
                    .ThenInclude(ws => ws.Exercise.SecondaryMuscles)
                        .ThenInclude(sm => sm.Muscle)
                .Include(w => w.WorkoutSets)
                    .ThenInclude(ws => ws.WorkoutExercises)
                .FirstOrDefaultAsync(w => w.Id == workoutId);

            if (workout == null)
                return ApiResponse.CreateFailure("Treino não encontrado");

            var response = new WorkoutDetailResponse
            {
                Id = workout.Id,
                RoutineId = workout.RoutineId,
                RoutineTitle = workout.Routine.Title,
                Title = workout.Title,
                Description = workout.Description,
                ExpectedDuration = workout.ExpectedDuration,
                Status = workout.Status,
                CreatedAt = workout.CreatedAt,
                UpdatedAt = workout.UpdatedAt,
                CompletedAt = workout.CompletedAt,
                TotalVolume = workout.TotalVolume,
                Feedback = workout.WorkoutFeedback != null ? new WorkoutFeedbackResponse
                {
                    Id = workout.WorkoutFeedback.Id,
                    Value = workout.WorkoutFeedback.Value,
                    Description = workout.WorkoutFeedback.Description,
                    CreatedAt = workout.WorkoutFeedback.CreatedAt
                } : null,
                Sets = workout.WorkoutSets.Select(ws => new WorkoutSetResponse
                {
                    Id = ws.Id,
                    ExerciseId = ws.ExerciseId,
                    ExerciseName = ws.Exercise.Name,
                    ExerciseUrl = ws.Exercise.Url,
                    ExerciseInstruction = ws.Exercise.Instruction,
                    ExerciseCategoryName = ws.Exercise.Category?.Name,
                    MaxSets = ws.MaxSets,
                    Order = ws.Order,
                    Field = ws.Field,
                    Description = ws.Description,
                    ExpectedSets = ws.ExpectedSets,
                    CompletedAt = ws.CompletedAt,
                    PrimaryMuscles = ws.Exercise.PrimaryMuscles
                        .Select(pm => pm.Muscle.Name)
                        .ToList(),
                    SecondaryMuscles = ws.Exercise.SecondaryMuscles
                        .Select(sm => sm.Muscle.Name)
                        .ToList(),
                    Exercises = ws.WorkoutExercises.Select(we => new WorkoutExerciseResponse
                    {
                        Id = we.Id,
                        Load = we.Load,
                        ExpectedRepetitions = we.ExpectedRepetitions,
                        CreatedAt = we.CreatedAt,
                        CompletedAt = we.CompletedAt
                    }).ToList()
                }).ToList()
            };

            return ApiResponse.CreateSuccess("Treino encontrado", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar treino: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetWorkoutsByRoutineAsync(Guid routineId)
    {
        try
        {
            var workouts = await _context.Workouts
                .Include(w => w.WorkoutSets)
                .Include(w => w.WorkoutFeedback)
                .Where(w => w.RoutineId == routineId)
                .OrderBy(w => w.CreatedAt)
                .ToListAsync();

            var response = workouts.Select(w => new WorkoutSummaryResponse
            {
                Id = w.Id,
                Title = w.Title,
                Description = w.Description,
                ExpectedDuration = w.ExpectedDuration,
                Status = w.Status,
                CreatedAt = w.CreatedAt,
                CompletedAt = w.CompletedAt,
                ExerciseCount = w.WorkoutSets.Count,
                TotalVolume = w.TotalVolume,
                HasFeedback = w.WorkoutFeedbackId.HasValue
            }).ToList();

            return ApiResponse.CreateSuccess("Treinos encontrados", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar treinos: {ex.Message}");
        }
    }

    public async Task<ApiResponse> CompleteWorkoutAsync(Guid workoutId, Guid userId, CompleteWorkoutRequest request)
    {
        try
        {
            var workout = await _context.Workouts
                .Include(w => w.Routine)
                    .ThenInclude(r => r.CustomerRoutines)
                .FirstOrDefaultAsync(w => w.Id == workoutId);

            if (workout == null)
                return ApiResponse.CreateFailure("Treino não encontrado");

            // Verificar se o usuário tem acesso a esta rotina
            var hasAccess = workout.Routine.PersonalId == userId ||
                           workout.Routine.CustomerRoutines.Any(cr => cr.CustomerId == userId && cr.Status == "A");

            if (!hasAccess)
                return ApiResponse.CreateFailure("Você não tem permissão para completar este treino");

            workout.CompletedAt = DateTime.UtcNow;
            workout.TotalVolume = request.TotalVolume;
            workout.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Treino marcado como completo");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao completar treino: {ex.Message}");
        }
    }

    #endregion

    #region Workout Feedback

    public async Task<ApiResponse> CreateWorkoutFeedbackAsync(Guid workoutId, Guid userId, CreateWorkoutFeedbackRequest request)
    {
        try
        {
            var workout = await _context.Workouts
                .Include(w => w.Routine)
                    .ThenInclude(r => r.CustomerRoutines)
                .FirstOrDefaultAsync(w => w.Id == workoutId);

            if (workout == null)
                return ApiResponse.CreateFailure("Treino não encontrado");

            var hasAccess = workout.Routine.PersonalId == userId ||
                           workout.Routine.CustomerRoutines.Any(cr => cr.CustomerId == userId && cr.Status == "A");

            if (!hasAccess)
                return ApiResponse.CreateFailure("Você não tem permissão");

            if (workout.WorkoutFeedbackId.HasValue)
                return ApiResponse.CreateFailure("Este treino já possui feedback. Use o endpoint de atualização.");

            var feedback = new WorkoutFeedbackEntity
            {
                Id = Guid.NewGuid(),
                Value = request.Value,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkoutFeedbacks.Add(feedback);
            workout.WorkoutFeedbackId = feedback.Id;
            workout.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Feedback criado com sucesso", new WorkoutFeedbackResponse
            {
                Id = feedback.Id,
                Value = feedback.Value,
                Description = feedback.Description,
                CreatedAt = feedback.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao criar feedback: {ex.Message}");
        }
    }

    public async Task<ApiResponse> UpdateWorkoutFeedbackAsync(Guid workoutId, Guid userId, CreateWorkoutFeedbackRequest request)
    {
        try
        {
            var workout = await _context.Workouts
                .Include(w => w.Routine)
                    .ThenInclude(r => r.CustomerRoutines)
                .Include(w => w.WorkoutFeedback)
                .FirstOrDefaultAsync(w => w.Id == workoutId);

            if (workout == null)
                return ApiResponse.CreateFailure("Treino não encontrado");

            var hasAccess = workout.Routine.PersonalId == userId ||
                           workout.Routine.CustomerRoutines.Any(cr => cr.CustomerId == userId && cr.Status == "A");

            if (!hasAccess)
                return ApiResponse.CreateFailure("Você não tem permissão");

            if (workout.WorkoutFeedback == null)
                return ApiResponse.CreateFailure("Este treino não possui feedback. Use o endpoint de criação.");

            workout.WorkoutFeedback.Value = request.Value;
            workout.WorkoutFeedback.Description = request.Description;
            workout.WorkoutFeedback.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Feedback atualizado com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao atualizar feedback: {ex.Message}");
        }
    }

    #endregion

    #region Workout Sets

    public async Task<ApiResponse> CreateWorkoutSetAsync(Guid workoutId, Guid personalId, CreateWorkoutSetRequest request)
    {
        try
        {
            var workout = await _context.Workouts
                .Include(w => w.Routine)
                .FirstOrDefaultAsync(w => w.Id == workoutId && w.Routine.PersonalId == personalId);

            if (workout == null)
                return ApiResponse.CreateFailure("Treino não encontrado ou você não tem permissão");

            var exercise = await _context.Exercises
                .FirstOrDefaultAsync(e => e.Id == request.ExerciseId);

            if (exercise == null)
                return ApiResponse.CreateFailure("Exercício não encontrado");

            var workoutSet = new WorkoutSetEntity
            {
                Id = Guid.NewGuid(),
                WorkoutId = workoutId,
                ExerciseId = request.ExerciseId,
                MaxSets = request.MaxSets,
                Order = request.Order,
                Field = request.Field,
                Description = request.Description,
                ExpectedSets = request.ExpectedSets,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkoutSets.Add(workoutSet);
            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Exercício adicionado ao treino com sucesso", new
            {
                id = workoutSet.Id,
                exerciseName = exercise.Name
            });
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao adicionar exercício: {ex.Message}");
        }
    }

    public async Task<ApiResponse> UpdateWorkoutSetAsync(Guid setId, Guid personalId, UpdateWorkoutSetRequest request)
    {
        try
        {
            var workoutSet = await _context.WorkoutSets
                .Include(ws => ws.Workout)
                    .ThenInclude(w => w.Routine)
                .FirstOrDefaultAsync(ws => ws.Id == setId && ws.Workout.Routine.PersonalId == personalId);

            if (workoutSet == null)
                return ApiResponse.CreateFailure("Série não encontrada ou você não tem permissão");

            if (request.MaxSets.HasValue)
                workoutSet.MaxSets = request.MaxSets.Value;

            if (request.Order.HasValue)
                workoutSet.Order = request.Order.Value;

            if (request.Field != null)
                workoutSet.Field = request.Field;

            if (request.Description != null)
                workoutSet.Description = request.Description;

            if (request.ExpectedSets.HasValue)
                workoutSet.ExpectedSets = request.ExpectedSets;

            workoutSet.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Série atualizada com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao atualizar série: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteWorkoutSetAsync(Guid setId, Guid personalId)
    {
        try
        {
            var workoutSet = await _context.WorkoutSets
                .Include(ws => ws.Workout)
                    .ThenInclude(w => w.Routine)
                .FirstOrDefaultAsync(ws => ws.Id == setId && ws.Workout.Routine.PersonalId == personalId);

            if (workoutSet == null)
                return ApiResponse.CreateFailure("Série não encontrada ou você não tem permissão");

            _context.WorkoutSets.Remove(workoutSet);
            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Série removida com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao remover série: {ex.Message}");
        }
    }

    #endregion

    #region Workout Exercises

    public async Task<ApiResponse> CreateWorkoutExerciseAsync(Guid setId, Guid userId, CreateWorkoutExerciseRequest request)
    {
        try
        {
            var workoutSet = await _context.WorkoutSets
                .Include(ws => ws.Workout)
                    .ThenInclude(w => w.Routine)
                        .ThenInclude(r => r.CustomerRoutines)
                .FirstOrDefaultAsync(ws => ws.Id == setId);

            if (workoutSet == null)
                return ApiResponse.CreateFailure("Série não encontrada");

            var hasAccess = workoutSet.Workout.Routine.PersonalId == userId ||
                           workoutSet.Workout.Routine.CustomerRoutines.Any(cr => cr.CustomerId == userId && cr.Status == "A");

            if (!hasAccess)
                return ApiResponse.CreateFailure("Você não tem permissão");

            var workoutExercise = new WorkoutExerciseEntity
            {
                Id = Guid.NewGuid(),
                WorkoutSetId = setId,
                Load = request.Load,
                ExpectedRepetitions = request.ExpectedRepetitions,
                CreatedAt = DateTime.UtcNow
            };

            _context.WorkoutExercises.Add(workoutExercise);
            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Execução registrada com sucesso", new WorkoutExerciseResponse
            {
                Id = workoutExercise.Id,
                Load = workoutExercise.Load,
                ExpectedRepetitions = workoutExercise.ExpectedRepetitions,
                CreatedAt = workoutExercise.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao registrar execução: {ex.Message}");
        }
    }

    public async Task<ApiResponse> UpdateWorkoutExerciseAsync(Guid exerciseId, Guid userId, UpdateWorkoutExerciseRequest request)
    {
        try
        {
            var workoutExercise = await _context.WorkoutExercises
                .Include(we => we.WorkoutSet)
                    .ThenInclude(ws => ws.Workout)
                        .ThenInclude(w => w.Routine)
                            .ThenInclude(r => r.CustomerRoutines)
                .FirstOrDefaultAsync(we => we.Id == exerciseId);

            if (workoutExercise == null)
                return ApiResponse.CreateFailure("Execução não encontrada");

            var hasAccess = workoutExercise.WorkoutSet.Workout.Routine.PersonalId == userId ||
                           workoutExercise.WorkoutSet.Workout.Routine.CustomerRoutines
                               .Any(cr => cr.CustomerId == userId && cr.Status == "A");

            if (!hasAccess)
                return ApiResponse.CreateFailure("Você não tem permissão");

            if (request.Load.HasValue)
                workoutExercise.Load = request.Load;

            if (request.ExpectedRepetitions.HasValue)
                workoutExercise.ExpectedRepetitions = request.ExpectedRepetitions;

            workoutExercise.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Execução atualizada com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao atualizar execução: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteWorkoutExerciseAsync(Guid exerciseId, Guid userId)
    {
        try
        {
            var workoutExercise = await _context.WorkoutExercises
                .Include(we => we.WorkoutSet)
                    .ThenInclude(ws => ws.Workout)
                        .ThenInclude(w => w.Routine)
                            .ThenInclude(r => r.CustomerRoutines)
                .FirstOrDefaultAsync(we => we.Id == exerciseId);

            if (workoutExercise == null)
                return ApiResponse.CreateFailure("Execução não encontrada");

            var hasAccess = workoutExercise.WorkoutSet.Workout.Routine.PersonalId == userId ||
                           workoutExercise.WorkoutSet.Workout.Routine.CustomerRoutines
                               .Any(cr => cr.CustomerId == userId && cr.Status == "A");

            if (!hasAccess)
                return ApiResponse.CreateFailure("Você não tem permissão");

            _context.WorkoutExercises.Remove(workoutExercise);
            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Execução removida com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao remover execução: {ex.Message}");
        }
    }

    public async Task<ApiResponse> CompleteWorkoutExerciseAsync(Guid exerciseId, Guid userId)
    {
        try
        {
            var workoutExercise = await _context.WorkoutExercises
                .Include(we => we.WorkoutSet)
                    .ThenInclude(ws => ws.Workout)
                        .ThenInclude(w => w.Routine)
                            .ThenInclude(r => r.CustomerRoutines)
                .FirstOrDefaultAsync(we => we.Id == exerciseId);

            if (workoutExercise == null)
                return ApiResponse.CreateFailure("Execução não encontrada");

            var hasAccess = workoutExercise.WorkoutSet.Workout.Routine.PersonalId == userId ||
                           workoutExercise.WorkoutSet.Workout.Routine.CustomerRoutines
                               .Any(cr => cr.CustomerId == userId && cr.Status == "A");

            if (!hasAccess)
                return ApiResponse.CreateFailure("Você não tem permissão");

            workoutExercise.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Execução marcada como completa");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao completar execução: {ex.Message}");
        }
    }

    #endregion
}
