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

        public async Task<ApiResponse> StartWorkoutSessionAsync(Guid customerId, StartWorkoutSessionRequest request)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Iniciando treino para cliente {customerId}, template {request.WorkoutTemplateId}");
                
                var activeSession = await _context.WorkoutSessions
                    .FirstOrDefaultAsync(ws => ws.CustomerId == customerId && ws.Status == "IP");

                if (activeSession != null)
                {
                    Console.WriteLine($"[DEBUG] Cliente já tem sessão ativa: ID={activeSession.Id}, StartedAt={activeSession.StartedAt}");
                    return ApiResponse.CreateFailure("Você já tem um treino em andamento!");
                }

                Console.WriteLine($"[DEBUG] Nenhuma sessão ativa encontrada, criando nova sessão");

                var template = await _context.WorkoutTemplates
                    .Include(wt => wt.ExerciseTemplates)
                    .ThenInclude(et => et.Exercise)
                    .FirstOrDefaultAsync(wt => wt.Id == request.WorkoutTemplateId && wt.Status == "A");

                if (template == null)
                    return ApiResponse.CreateFailure("Template de treino não encontrado.");

                var session = new WorkoutSessionEntity
                {
                    Id = Guid.NewGuid(),
                    WorkoutTemplateId = request.WorkoutTemplateId,
                    CustomerId = customerId,
                    RoutineId = template.RoutineId,
                    StartedAt = DateTime.UtcNow,
                    Status = "IP",
                    TotalVolume = 0,
                    CreatedAt = DateTime.UtcNow
                };

                _context.WorkoutSessions.Add(session);

                // Cria todos os ExerciseSessions com status "NS" (Not Started)
                foreach (var exerciseTemplate in template.ExerciseTemplates.Where(et => et.Status == "A").OrderBy(et => et.Order))
                {
                    var exerciseSession = new ExerciseSessionEntity
                    {
                        Id = Guid.NewGuid(),
                        WorkoutSessionId = session.Id,
                        ExerciseTemplateId = exerciseTemplate.Id,
                        ExerciseId = exerciseTemplate.ExerciseId,
                        Order = exerciseTemplate.Order,
                        Status = "NS", // Not Started
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.ExerciseSessions.Add(exerciseSession);
                }

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Treino iniciado com sucesso!", session.Id);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao iniciar treino: {ex.Message}");
            }
        }

        public async Task<ApiResponse> CompleteWorkoutSessionAsync(Guid sessionId, Guid customerId, CompleteWorkoutSessionRequest request)
        {
            try
            {
                var session = await _context.WorkoutSessions
                    .FirstOrDefaultAsync(ws => ws.Id == sessionId && ws.CustomerId == customerId);

                if (session == null)
                    return ApiResponse.CreateFailure("Sessão não encontrada.");

                if (session.Status != "IP")
                    return ApiResponse.CreateFailure("Esta sessão já foi finalizada.");

                session.CompletedAt = DateTime.UtcNow;
                session.Status = "C";
                session.DurationMinutes = (int)(session.CompletedAt.Value - session.StartedAt).TotalMinutes;
                session.DifficultyRating = request.DifficultyRating;
                session.EnergyRating = request.EnergyRating;
                session.Notes = request.Notes;
                session.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Treino finalizado com sucesso!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao finalizar treino: {ex.Message}");
            }
        }

        public async Task<ApiResponse> CancelWorkoutSessionAsync(Guid sessionId, Guid customerId)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Tentando cancelar sessão: ID={sessionId}, Cliente={customerId}");
                
                var sessions = await _context.WorkoutSessions
                    .Where(ws => ws.Id == sessionId && ws.CustomerId == customerId)
                    .ToListAsync();

                Console.WriteLine($"[DEBUG] Encontradas {sessions.Count} sessões para cancelar");

                if (sessions == null || sessions.Count == 0)
                {
                    Console.WriteLine($"[DEBUG] Nenhuma sessão encontrada para cancelar");
                    return ApiResponse.CreateFailure("Sessão não encontrada.");
                }

                foreach (var session in sessions)
                {
                    Console.WriteLine($"[DEBUG] Cancelando sessão: ID={session.Id}, Status atual={session.Status}");
                    session.Status = "CA";
                    session.UpdatedAt = DateTime.UtcNow;
                    Console.WriteLine($"[DEBUG] Sessão atualizada: ID={session.Id}, Novo status={session.Status}");
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"[DEBUG] Salvou mudanças no banco - {sessions.Count} sessões canceladas");

                return ApiResponse.CreateSuccess("Treino cancelado.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DEBUG] Erro ao cancelar: {ex.Message}");
                return ApiResponse.CreateFailure($"Erro ao cancelar treino: {ex.Message}");
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
                    .Where(ws => ws.CustomerId == customerId)
                    .OrderByDescending(ws => ws.StartedAt)
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

        public async Task<ApiResponse> GetActiveWorkoutSessionAsync(Guid customerId)
        {
            try
            {
                // DEBUG: Contar quantas sessões ativas existem
                var allActiveSessions = await _context.WorkoutSessions
                    .Where(ws => ws.CustomerId == customerId && ws.Status == "IP")
                    .ToListAsync();
                
                Console.WriteLine($"[DEBUG] Cliente {customerId} tem {allActiveSessions.Count} sessões ativas (IP)");
                
                foreach (var activeSession in allActiveSessions)
                {
                    Console.WriteLine($"[DEBUG] Sessão ativa: ID={activeSession.Id}, StartedAt={activeSession.StartedAt}, Template={activeSession.WorkoutTemplateId}");
                }

                var session = await _context.WorkoutSessions
                    .Include(ws => ws.WorkoutTemplate)
                    .Include(ws => ws.ExerciseSessions).ThenInclude(es => es.Exercise)
                    .Include(ws => ws.ExerciseSessions).ThenInclude(es => es.SetSessions)
                    .Include(ws => ws.ExerciseSessions).ThenInclude(es => es.ExerciseTemplate)
                    .FirstOrDefaultAsync(ws => ws.CustomerId == customerId && ws.Status == "IP");

                if (session == null)
                    return ApiResponse.CreateSuccess("Nenhum treino ativo.", null);

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

                return ApiResponse.CreateSuccess("Treino ativo encontrado.", response);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao buscar treino ativo: {ex.Message}");
            }
        }

        public async Task<ApiResponse> StartExerciseSessionAsync(Guid sessionId, Guid customerId, StartExerciseSessionRequest request)
        {
            try
            {
                var session = await _context.WorkoutSessions
                    .Include(ws => ws.ExerciseSessions)
                    .FirstOrDefaultAsync(ws => ws.Id == sessionId && ws.CustomerId == customerId);

                if (session == null || session.Status != "IP")
                    return ApiResponse.CreateFailure("Sessão não encontrada ou não está em andamento.");

                // Primeiro, verifica se o ExerciseSession já existe
                var existingExerciseSession = session.ExerciseSessions
                    .FirstOrDefault(es => es.ExerciseTemplateId == request.ExerciseTemplateId);

                if (existingExerciseSession != null)
                {
                    // Se já existe, apenas atualiza o status para "IP" se ainda não foi iniciado
                    if (existingExerciseSession.Status == "NS")
                    {
                        existingExerciseSession.Status = "IP";
                        existingExerciseSession.StartedAt = DateTime.UtcNow;
                        existingExerciseSession.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                        return ApiResponse.CreateSuccess("Exercício iniciado!", existingExerciseSession.Id);
                    }
                    return ApiResponse.CreateSuccess("Exercício já foi iniciado.", existingExerciseSession.Id);
                }

                // Se não existe, cria um novo com status "IP"
                var exerciseTemplate = await _context.ExerciseTemplates
                    .FirstOrDefaultAsync(et => et.Id == request.ExerciseTemplateId && et.Status == "A");

                if (exerciseTemplate == null)
                    return ApiResponse.CreateFailure("Template de exercício não encontrado.");

                var exerciseSession = new ExerciseSessionEntity
                {
                    Id = Guid.NewGuid(),
                    WorkoutSessionId = sessionId,
                    ExerciseTemplateId = request.ExerciseTemplateId,
                    ExerciseId = exerciseTemplate.ExerciseId,
                    Order = exerciseTemplate.Order,
                    StartedAt = DateTime.UtcNow,
                    Status = "IP",
                    CreatedAt = DateTime.UtcNow
                };

                _context.ExerciseSessions.Add(exerciseSession);
                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Exercício iniciado!", exerciseSession.Id);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao iniciar exercício: {ex.Message}");
            }
        }

        public async Task<ApiResponse> CompleteExerciseSessionAsync(Guid exerciseSessionId, Guid customerId)
        {
            try
            {
                var exerciseSession = await _context.ExerciseSessions
                    .Include(es => es.WorkoutSession)
                    .FirstOrDefaultAsync(es => es.Id == exerciseSessionId);

                if (exerciseSession == null || exerciseSession.WorkoutSession.CustomerId != customerId)
                    return ApiResponse.CreateFailure("Exercício não encontrado.");

                exerciseSession.CompletedAt = DateTime.UtcNow;
                exerciseSession.Status = "C";
                exerciseSession.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Exercício finalizado!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao finalizar exercício: {ex.Message}");
            }
        }

        public async Task<ApiResponse> SkipExerciseSessionAsync(Guid exerciseSessionId, Guid customerId)
        {
            try
            {
                var exerciseSession = await _context.ExerciseSessions
                    .Include(es => es.WorkoutSession)
                    .FirstOrDefaultAsync(es => es.Id == exerciseSessionId);

                if (exerciseSession == null || exerciseSession.WorkoutSession.CustomerId != customerId)
                    return ApiResponse.CreateFailure("Exercício não encontrado.");

                exerciseSession.Status = "SK";
                exerciseSession.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Exercício pulado.");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao pular exercício: {ex.Message}");
            }
        }

        public async Task<ApiResponse> RegisterSetAsync(Guid exerciseSessionId, Guid customerId, RegisterSetSessionRequest request)
        {
            try
            {
                var exerciseSession = await _context.ExerciseSessions
                    .Include(es => es.WorkoutSession)
                    .FirstOrDefaultAsync(es => es.Id == exerciseSessionId);

                if (exerciseSession == null || exerciseSession.WorkoutSession.CustomerId != customerId)
                    return ApiResponse.CreateFailure("Exercício não encontrado.");

                var setSession = new SetSessionEntity
                {
                    Id = Guid.NewGuid(),
                    ExerciseSessionId = exerciseSessionId,
                    SetNumber = request.SetNumber,
                    Load = request.Load,
                    Reps = request.Reps,
                    RestSeconds = request.RestSeconds,
                    Completed = true,
                    Notes = request.Notes,
                    CreatedAt = DateTime.UtcNow
                };

                _context.SetSessions.Add(setSession);

                var workoutSession = exerciseSession.WorkoutSession;
                workoutSession.TotalVolume += request.Load * request.Reps;
                workoutSession.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Série registrada!", setSession.Id);
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao registrar série: {ex.Message}");
            }
        }

        public async Task<ApiResponse> UpdateSetAsync(Guid setId, Guid customerId, UpdateSetSessionRequest request)
        {
            try
            {
                var setSession = await _context.SetSessions
                    .Include(ss => ss.ExerciseSession).ThenInclude(es => es.WorkoutSession)
                    .FirstOrDefaultAsync(ss => ss.Id == setId);

                if (setSession == null || setSession.ExerciseSession.WorkoutSession.CustomerId != customerId)
                    return ApiResponse.CreateFailure("Série não encontrada.");

                var oldVolume = setSession.Load * setSession.Reps;

                if (request.Load.HasValue)
                    setSession.Load = request.Load.Value;

                if (request.Reps.HasValue)
                    setSession.Reps = request.Reps.Value;

                if (request.RestSeconds.HasValue)
                    setSession.RestSeconds = request.RestSeconds;

                if (request.Notes != null)
                    setSession.Notes = request.Notes;

                var newVolume = setSession.Load * setSession.Reps;
                var workoutSession = setSession.ExerciseSession.WorkoutSession;
                workoutSession.TotalVolume = workoutSession.TotalVolume - oldVolume + newVolume;
                workoutSession.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Série atualizada!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao atualizar série: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeleteSetAsync(Guid setId, Guid customerId)
        {
            try
            {
                var setSession = await _context.SetSessions
                    .Include(ss => ss.ExerciseSession).ThenInclude(es => es.WorkoutSession)
                    .FirstOrDefaultAsync(ss => ss.Id == setId);

                if (setSession == null || setSession.ExerciseSession.WorkoutSession.CustomerId != customerId)
                    return ApiResponse.CreateFailure("Série não encontrada.");

                var volume = setSession.Load * setSession.Reps;
                var workoutSession = setSession.ExerciseSession.WorkoutSession;
                workoutSession.TotalVolume -= volume;
                workoutSession.UpdatedAt = DateTime.UtcNow;

                _context.SetSessions.Remove(setSession);
                await _context.SaveChangesAsync();

                return ApiResponse.CreateSuccess("Série deletada!");
            }
            catch (Exception ex)
            {
                return ApiResponse.CreateFailure($"Erro ao deletar série: {ex.Message}");
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
    }
}
