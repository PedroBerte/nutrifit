using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services
{
    public class WorkoutSessionService : IWorkoutSessionService
    {
        private readonly NutrifitContext _context;

        public WorkoutSessionService(NutrifitContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse> CompleteWorkoutSessionAsync(Guid customerId, CompleteWorkoutSessionRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                Console.WriteLine($"[DEBUG] Nenhuma sessão ativa encontrada, criando nova sessão");

                var template = await _context.WorkoutTemplates
                    .Include(wt => wt.ExerciseTemplates)
                    .ThenInclude(et => et.Exercise)
                    .FirstOrDefaultAsync(wt => wt.Id == request.WorkoutTemplateId && wt.Status == "A");

                if (template == null)
                    return ApiResponse.CreateFailure("Template de treino não encontrado.");

                // Criar WorkoutSession
                var session = new WorkoutSessionEntity
                {
                    Id = Guid.NewGuid(),
                    WorkoutTemplateId = request.WorkoutTemplateId,
                    CustomerId = customerId,
                    RoutineId = template.RoutineId,
                    StartedAt = request.StartedAt,
                    CompletedAt = request.CompletedAt,
                    Status = "C", // Completed
                    DurationMinutes = request.DurationMinutes,
                    TotalVolume = 0, // Será calculado
                    DifficultyRating = request.DifficultyRating,
                    EnergyRating = request.EnergyRating,
                    Notes = request.Notes,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.WorkoutSessions.Add(session);

                decimal totalVolume = 0;

                // Criar ExerciseSessions e SetSessions
                foreach (var exerciseData in request.ExerciseSessions)
                {
                    var exerciseSession = new ExerciseSessionEntity
                    {
                        Id = Guid.NewGuid(),
                        WorkoutSessionId = session.Id,
                        ExerciseTemplateId = exerciseData.ExerciseTemplateId,
                        ExerciseId = exerciseData.ExerciseId,
                        Order = exerciseData.Order,
                        StartedAt = exerciseData.StartedAt ?? DateTime.UtcNow,
                        CompletedAt = exerciseData.CompletedAt,
                        Status = exerciseData.Status,
                        Notes = exerciseData.Notes,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.ExerciseSessions.Add(exerciseSession);

                    // Criar SetSessions
                    foreach (var setData in exerciseData.Sets)
                    {
                        var setSession = new SetSessionEntity
                        {
                            Id = Guid.NewGuid(),
                            ExerciseSessionId = exerciseSession.Id,
                            SetNumber = setData.SetNumber,
                            Load = setData.Load,
                            Reps = setData.Reps,
                            RestSeconds = setData.RestSeconds,
                            Completed = setData.Completed,
                            Notes = setData.Notes,
                            CreatedAt = DateTime.UtcNow
                        };

                        _context.SetSessions.Add(setSession);

                        // Calcular volume
                        if (setData.Load.HasValue && setData.Reps.HasValue)
                        {
                            totalVolume += setData.Load.Value * setData.Reps.Value;
                        }
                    }
                }

                session.TotalVolume = totalVolume;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return ApiResponse.CreateSuccess("Treino finalizado com sucesso!", session.Id);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return ApiResponse.CreateFailure($"Erro ao finalizar treino: {ex.Message}");
            }
        }

        public async Task<ApiResponse> GetWorkoutSessionByIdAsync(Guid sessionId)
        {
            try
            {
                var session = await _context.WorkoutSessions
                    .Include(ws => ws.WorkoutTemplate)
                    .Include(ws => ws.ExerciseSessions).ThenInclude(es => es.Exercise)
                    .Include(ws => ws.ExerciseSessions).ThenInclude(es => es.SetSessions)
                    .Include(ws => ws.ExerciseSessions).ThenInclude(es => es.ExerciseTemplate)
                    .FirstOrDefaultAsync(ws => ws.Id == sessionId);

                if (session == null)
                    return ApiResponse.CreateFailure("Sessão não encontrada.");

                var response = new WorkoutSessionResponse
                {
                    Id = session.Id,
                    WorkoutTemplateId = session.WorkoutTemplateId,
                    WorkoutTemplateTitle = session.WorkoutTemplate.Title,
                    CustomerId = session.CustomerId,
                    RoutineId = session.RoutineId,
                    StartedAt = session.StartedAt,
                    CompletedAt = session.CompletedAt,
                    Status = session.Status,
                    DurationMinutes = session.DurationMinutes,
                    TotalVolume = session.TotalVolume,
                    DifficultyRating = session.DifficultyRating,
                    EnergyRating = session.EnergyRating,
                    Notes = session.Notes,
                    CreatedAt = session.CreatedAt,
                    ExerciseSessions = session.ExerciseSessions.OrderBy(es => es.Order).Select(es => new ExerciseSessionResponse
                    {
                        Id = es.Id,
                        WorkoutSessionId = es.WorkoutSessionId,
                        ExerciseTemplateId = es.ExerciseTemplateId,
                        ExerciseId = es.ExerciseId,
                        ExerciseName = es.Exercise.Name,
                        Order = es.Order,
                        StartedAt = es.StartedAt,
                        CompletedAt = es.CompletedAt,
                        Status = es.Status,
                        Notes = es.Notes,
                        TargetSets = es.ExerciseTemplate?.TargetSets,
                        TargetRepsMin = es.ExerciseTemplate?.TargetRepsMin,
                        TargetRepsMax = es.ExerciseTemplate?.TargetRepsMax,
                        SuggestedLoad = es.ExerciseTemplate?.SuggestedLoad,
                        SetSessions = es.SetSessions.OrderBy(ss => ss.SetNumber).Select(ss => new SetSessionResponse
                        {
                            Id = ss.Id,
                            ExerciseSessionId = ss.ExerciseSessionId,
                            SetNumber = ss.SetNumber,
                            Load = ss.Load,
                            Reps = ss.Reps,
                            RestSeconds = ss.RestSeconds,
                            Completed = ss.Completed,
                            Notes = ss.Notes
                        }).ToList()
                    }).ToList()
                };

                return ApiResponse.CreateSuccess("Sessão encontrada.", response);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao buscar sessão: {ex.Message}");
            }
        }

        public async Task<ApiResponse> GetCustomerWorkoutHistoryAsync(Guid customerId, int page = 1, int pageSize = 20)
        {
            try
            {
                var skip = (page - 1) * pageSize;

                var sessions = await _context.WorkoutSessions
                    .Include(ws => ws.WorkoutTemplate)
                    .Where(ws => ws.CustomerId == customerId && ws.Status == "C")
                    .OrderByDescending(ws => ws.CompletedAt)
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();

                var response = sessions.Select(session => new WorkoutSessionSummaryResponse
                {
                    Id = session.Id,
                    WorkoutTemplateTitle = session.WorkoutTemplate.Title,
                    StartedAt = session.StartedAt,
                    CompletedAt = session.CompletedAt,
                    Status = session.Status,
                    DurationMinutes = session.DurationMinutes,
                    TotalVolume = session.TotalVolume,
                    DifficultyRating = session.DifficultyRating
                }).ToList();

                return ApiResponse.CreateSuccess("Histórico encontrado.", response);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao buscar histórico: {ex.Message}");
            }
        }

        public async Task<ApiResponse> GetPreviousExerciseDataAsync(Guid exerciseId, Guid customerId)
        {
            try
            {
                // Busca a última sessão de treino completa onde o usuário executou este exercício
                var previousExerciseSession = await _context.ExerciseSessions
                    .Include(es => es.SetSessions)
                    .Include(es => es.WorkoutSession)
                    .Where(es => es.ExerciseId == exerciseId
                        && es.WorkoutSession.CustomerId == customerId
                        && es.WorkoutSession.Status == "C"
                        && es.Status == "C")
                    .OrderByDescending(es => es.WorkoutSession.CompletedAt)
                    .FirstOrDefaultAsync();

                if (previousExerciseSession == null)
                    return ApiResponse.CreateSuccess("Nenhum histórico encontrado", new List<object>());

                var previousSets = previousExerciseSession.SetSessions
                    .OrderBy(ss => ss.SetNumber)
                    .Select(ss => new
                    {
                        setNumber = ss.SetNumber,
                        load = ss.Load,
                        reps = ss.Reps,
                        date = previousExerciseSession.WorkoutSession.CompletedAt
                    })
                    .ToList();

                return ApiResponse.CreateSuccess("Dados anteriores encontrados", previousSets);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao buscar dados anteriores: {ex.Message}");
            }
        }

        public async Task<ApiResponse> GetExerciseHistoryAsync(Guid exerciseId, Guid customerId)
        {
            try
            {
                // Busca todas as sessões completadas deste exercício pelo usuário
                var exerciseSessions = await _context.ExerciseSessions
                    .Include(es => es.SetSessions)
                    .Include(es => es.WorkoutSession)
                    .Include(es => es.Exercise)
                    .Where(es => es.ExerciseId == exerciseId
                        && es.WorkoutSession.CustomerId == customerId
                        && es.WorkoutSession.Status == "C"
                        && es.Status == "C")
                    .OrderByDescending(es => es.WorkoutSession.CompletedAt)
                    .ToListAsync();

                if (!exerciseSessions.Any())
                {
                    return ApiResponse.CreateFailure("Nenhum histórico encontrado para este exercício");
                }

                var exercise = exerciseSessions.First().Exercise;

                // Calcula estatísticas gerais
                var allSets = exerciseSessions.SelectMany(es => es.SetSessions).ToList();
                var stats = new ExerciseStats
                {
                    TotalSessions = exerciseSessions.Count,
                    TotalSets = allSets.Count,
                    TotalReps = allSets.Sum(s => s.Reps ?? 0),
                    TotalVolume = allSets.Sum(s => (s.Load ?? 0) * (s.Reps ?? 0)),
                    MaxLoad = allSets.Max(s => s.Load ?? 0),
                    AverageLoad = allSets.Any(s => s.Load.HasValue)
                        ? allSets.Where(s => s.Load.HasValue).Average(s => s.Load!.Value)
                        : 0,
                    LastPerformed = exerciseSessions.First().WorkoutSession.CompletedAt,
                    FirstPerformed = exerciseSessions.Last().WorkoutSession.CompletedAt
                };

                // Mapeia sessões individuais
                var sessions = exerciseSessions.Select(es => new ExerciseSessionHistoryItem
                {
                    SessionId = es.WorkoutSession.Id,
                    PerformedAt = es.WorkoutSession.CompletedAt ?? DateTime.UtcNow,
                    WorkoutTemplateTitle = es.WorkoutSession.WorkoutTemplate?.Title ?? "Treino",
                    Sets = es.SetSessions.OrderBy(s => s.SetNumber).Select(s => new SetHistoryItem
                    {
                        SetNumber = s.SetNumber,
                        Load = s.Load,
                        Reps = s.Reps,
                        Volume = (s.Load ?? 0) * (s.Reps ?? 0)
                    }).ToList(),
                    SessionVolume = es.SetSessions.Sum(s => (s.Load ?? 0) * (s.Reps ?? 0)),
                    MaxLoad = es.SetSessions.Max(s => s.Load ?? 0),
                    AverageLoad = es.SetSessions.Any(s => s.Load.HasValue)
                        ? es.SetSessions.Where(s => s.Load.HasValue).Average(s => s.Load!.Value)
                        : 0,
                    TotalReps = es.SetSessions.Sum(s => s.Reps ?? 0)
                }).ToList();

                var response = new ExerciseHistoryResponse
                {
                    ExerciseId = exerciseId,
                    ExerciseName = exercise.Name,
                    ImageUrl = exercise.ImageUrl,
                    Stats = stats,
                    Sessions = sessions
                };

                return ApiResponse.CreateSuccess("Histórico do exercício encontrado", response);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao buscar histórico do exercício: {ex.Message}");
            }
        }
    }
}
