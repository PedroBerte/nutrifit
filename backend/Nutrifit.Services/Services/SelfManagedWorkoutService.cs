using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services;

public class SelfManagedWorkoutService : ISelfManagedWorkoutService
{
    private readonly NutrifitContext _context;

    public SelfManagedWorkoutService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse> GetTemplatesAsync(Guid userId)
    {
        var templates = await _context.SelfManagedWorkoutTemplates
            .Include(x => x.Exercises)
            .Where(x => x.UserId == userId && x.Status == "A")
            .OrderBy(x => x.Order)
            .ToListAsync();

        var response = templates.Select(MapTemplate).ToList();
        return ApiResponse.CreateSuccess("Templates encontrados.", response);
    }

    public async Task<ApiResponse> CreateTemplateAsync(Guid userId, CreateSelfManagedWorkoutTemplateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return ApiResponse.CreateFailure("Título é obrigatório.");

        var template = new SelfManagedWorkoutTemplateEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title.Trim(),
            Description = request.Description,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            Order = request.Order,
            Status = "A",
            CreatedAt = DateTime.UtcNow
        };

        _context.SelfManagedWorkoutTemplates.Add(template);

        if (request.ExerciseTemplates != null)
        {
            foreach (var exercise in request.ExerciseTemplates)
            {
                var exerciseName = await ResolveExerciseNameAsync(exercise.ExerciseId, exercise.ExerciseName);
                if (string.IsNullOrWhiteSpace(exerciseName))
                    return ApiResponse.CreateFailure("ExerciseName é obrigatório quando ExerciseId não é informado.");

                _context.SelfManagedExerciseTemplates.Add(new SelfManagedExerciseTemplateEntity
                {
                    Id = Guid.NewGuid(),
                    WorkoutTemplateId = template.Id,
                    ExerciseId = exercise.ExerciseId,
                    ExerciseName = exerciseName,
                    Order = exercise.Order,
                    TargetSets = exercise.TargetSets,
                    TargetRepsMin = exercise.TargetRepsMin,
                    TargetRepsMax = exercise.TargetRepsMax,
                    SuggestedLoad = exercise.SuggestedLoad,
                    RestSeconds = exercise.RestSeconds,
                    Notes = exercise.Notes,
                    SetType = string.IsNullOrWhiteSpace(exercise.SetType) ? "Reps" : exercise.SetType,
                    WeightUnit = string.IsNullOrWhiteSpace(exercise.WeightUnit) ? "kg" : exercise.WeightUnit,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        await _context.SaveChangesAsync();
        return ApiResponse.CreateSuccess("Template criado com sucesso.", new { id = template.Id });
    }

    public async Task<ApiResponse> GetTemplateByIdAsync(Guid userId, Guid workoutId)
    {
        var template = await _context.SelfManagedWorkoutTemplates
            .Include(x => x.Exercises)
            .FirstOrDefaultAsync(x => x.Id == workoutId && x.UserId == userId && x.Status == "A");

        if (template == null)
            return ApiResponse.CreateFailure("Template não encontrado.");

        return ApiResponse.CreateSuccess("Template encontrado.", MapTemplate(template));
    }

    public async Task<ApiResponse> UpdateTemplateAsync(Guid userId, Guid workoutId, UpdateSelfManagedWorkoutTemplateRequest request)
    {
        var template = await _context.SelfManagedWorkoutTemplates
            .FirstOrDefaultAsync(x => x.Id == workoutId && x.UserId == userId && x.Status == "A");

        if (template == null)
            return ApiResponse.CreateFailure("Template não encontrado.");

        if (!string.IsNullOrWhiteSpace(request.Title))
            template.Title = request.Title.Trim();

        if (request.Description != null)
            template.Description = request.Description;

        if (request.EstimatedDurationMinutes.HasValue)
            template.EstimatedDurationMinutes = request.EstimatedDurationMinutes;

        if (request.Order.HasValue)
            template.Order = request.Order.Value;

        template.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse.CreateSuccess("Template atualizado com sucesso.");
    }

    public async Task<ApiResponse> DeleteTemplateAsync(Guid userId, Guid workoutId)
    {
        var template = await _context.SelfManagedWorkoutTemplates
            .FirstOrDefaultAsync(x => x.Id == workoutId && x.UserId == userId && x.Status == "A");

        if (template == null)
            return ApiResponse.CreateFailure("Template não encontrado.");

        template.Status = "I";
        template.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return ApiResponse.CreateSuccess("Template removido com sucesso.");
    }

    public async Task<ApiResponse> GetSessionsAsync(Guid userId, int page, int pageSize)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 20 : pageSize;

        var totalItems = await _context.SelfManagedWorkoutSessions
            .CountAsync(x => x.UserId == userId);

        var items = await _context.SelfManagedWorkoutSessions
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var response = new PaginatedSelfManagedWorkoutSessionsResponse
        {
            Items = items.Select(MapSession).ToList(),
            TotalItems = totalItems,
            CurrentPage = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling((double)totalItems / pageSize)
        };

        return ApiResponse.CreateSuccess("Sessões encontradas.", response);
    }

    public async Task<ApiResponse> CreateSessionAsync(Guid userId, CreateSelfManagedWorkoutSessionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return ApiResponse.CreateFailure("Título é obrigatório.");

        if (request.WorkoutTemplateId.HasValue)
        {
            var templateExists = await _context.SelfManagedWorkoutTemplates.AnyAsync(x =>
                x.Id == request.WorkoutTemplateId.Value && x.UserId == userId && x.Status == "A");

            if (!templateExists)
                return ApiResponse.CreateFailure("Template não encontrado.");
        }

        var session = new SelfManagedWorkoutSessionEntity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            WorkoutTemplateId = request.WorkoutTemplateId,
            Title = request.Title.Trim(),
            Status = "IP",
            StartedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _context.SelfManagedWorkoutSessions.Add(session);
        await _context.SaveChangesAsync();

        return ApiResponse.CreateSuccess("Sessão iniciada com sucesso.", new { sessionId = session.Id });
    }

    public async Task<ApiResponse> GetSessionByIdAsync(Guid userId, Guid sessionId)
    {
        var session = await _context.SelfManagedWorkoutSessions
            .FirstOrDefaultAsync(x => x.Id == sessionId && x.UserId == userId);

        if (session == null)
            return ApiResponse.CreateFailure("Sessão não encontrada.");

        return ApiResponse.CreateSuccess("Sessão encontrada.", MapSession(session));
    }

    public async Task<ApiResponse> FinishSessionAsync(Guid userId, Guid sessionId, FinishSelfManagedWorkoutSessionRequest request)
    {
        var session = await _context.SelfManagedWorkoutSessions
            .FirstOrDefaultAsync(x => x.Id == sessionId && x.UserId == userId);

        if (session == null)
            return ApiResponse.CreateFailure("Sessão não encontrada.");

        if (session.Status == "C")
            return ApiResponse.CreateFailure("Sessão já finalizada.");

        session.Status = "C";
        session.CompletedAt = DateTime.UtcNow;

        if (request.DurationMinutes.HasValue)
            session.DurationMinutes = request.DurationMinutes;

        if (request.TotalVolume.HasValue)
            session.TotalVolume = request.TotalVolume;

        if (request.Notes != null)
            session.Notes = request.Notes;

        await _context.SaveChangesAsync();

        return ApiResponse.CreateSuccess("Sessão finalizada com sucesso.", MapSession(session));
    }

    private async Task<string?> ResolveExerciseNameAsync(Guid? exerciseId, string? fallbackName)
    {
        if (exerciseId.HasValue)
        {
            var exercise = await _context.Exercises.FirstOrDefaultAsync(x => x.Id == exerciseId.Value);
            if (exercise != null)
                return exercise.Name;
        }

        return string.IsNullOrWhiteSpace(fallbackName) ? null : fallbackName.Trim();
    }

    private static SelfManagedWorkoutTemplateResponse MapTemplate(SelfManagedWorkoutTemplateEntity template)
    {
        return new SelfManagedWorkoutTemplateResponse
        {
            Id = template.Id,
            UserId = template.UserId,
            Title = template.Title,
            Description = template.Description,
            EstimatedDurationMinutes = template.EstimatedDurationMinutes,
            Order = template.Order,
            Status = template.Status,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt,
            ExerciseTemplates = template.Exercises
                .OrderBy(x => x.Order)
                .Select(x => new SelfManagedExerciseTemplateResponse
                {
                    Id = x.Id,
                    WorkoutTemplateId = x.WorkoutTemplateId,
                    ExerciseId = x.ExerciseId,
                    ExerciseName = x.ExerciseName,
                    Order = x.Order,
                    TargetSets = x.TargetSets,
                    TargetRepsMin = x.TargetRepsMin,
                    TargetRepsMax = x.TargetRepsMax,
                    SuggestedLoad = x.SuggestedLoad,
                    RestSeconds = x.RestSeconds,
                    Notes = x.Notes,
                    SetType = x.SetType,
                    WeightUnit = x.WeightUnit,
                    CreatedAt = x.CreatedAt
                }).ToList()
        };
    }

    private static SelfManagedWorkoutSessionResponse MapSession(SelfManagedWorkoutSessionEntity session)
    {
        return new SelfManagedWorkoutSessionResponse
        {
            Id = session.Id,
            UserId = session.UserId,
            WorkoutTemplateId = session.WorkoutTemplateId,
            Title = session.Title,
            Status = session.Status,
            StartedAt = session.StartedAt,
            CompletedAt = session.CompletedAt,
            DurationMinutes = session.DurationMinutes,
            TotalVolume = session.TotalVolume,
            Notes = session.Notes,
            CreatedAt = session.CreatedAt
        };
    }
}
