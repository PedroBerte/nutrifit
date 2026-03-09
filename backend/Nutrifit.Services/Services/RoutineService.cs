using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Constants;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;
using System.Globalization;

namespace Nutrifit.Services.Services;

public class RoutineService : IRoutineService
{
    private readonly NutrifitContext _context;
    private readonly IPushService _pushService;

    public RoutineService(NutrifitContext context, IPushService pushService)
    {
        _context = context;
        _pushService = pushService;
    }

    public async Task<ApiResponse> CreateRoutineAsync(Guid personalId, CreateRoutineRequest request)
    {
        try
        {
            var personal = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == personalId);

            if (personal == null)
                return ApiResponse.CreateFailure("Personal não encontrado");


            var isPersonal = personal.ProfileId == Guid.Parse(ProfilesConstants.PERSONAL);
            var isSelfManaged = personal.ProfileId == Guid.Parse(ProfilesConstants.SELF_MANAGED);

            if (!isPersonal && !isSelfManaged)
                return ApiResponse.CreateFailure("Apenas Personal Trainers e usuários auto geridos podem criar rotinas");

            var routine = new RoutineEntity
            {
                Id = Guid.NewGuid(),
                PersonalId = personalId,
                Title = request.Title,
                Goal = request.Goal,
                Difficulty = request.Difficulty,
                Weeks = request.Weeks,
                Status = "A",
                CreatedAt = DateTime.UtcNow
            };

            _context.Routines.Add(routine);
            await _context.SaveChangesAsync();

            var response = new RoutineResponse
            {
                Id = routine.Id,
                PersonalId = routine.PersonalId,
                PersonalName = personal.Name,
                Title = routine.Title,
                Goal = routine.Goal,
                Difficulty = routine.Difficulty,
                Weeks = routine.Weeks,
                Status = routine.Status,
                CreatedAt = routine.CreatedAt,
                WorkoutCount = 0,
                AssignedCustomersCount = 0
            };

            return ApiResponse.CreateSuccess("Rotina criada com sucesso", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao criar rotina: {ex.Message}");
        }
    }

    public async Task<ApiResponse> UpdateRoutineAsync(Guid routineId, Guid personalId, UpdateRoutineRequest request)
    {
        try
        {
            var routine = await _context.Routines
                .FirstOrDefaultAsync(r => r.Id == routineId && r.PersonalId == personalId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão para editá-la");

            if (!string.IsNullOrEmpty(request.Title))
                routine.Title = request.Title;

            if (request.Goal != null)
                routine.Goal = request.Goal;

            if (!string.IsNullOrEmpty(request.Difficulty))
                routine.Difficulty = request.Difficulty;

            if (request.Weeks.HasValue)
                routine.Weeks = request.Weeks;

            if (!string.IsNullOrEmpty(request.Status))
                routine.Status = request.Status;

            routine.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Rotina atualizada com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao atualizar rotina: {ex.Message}");
        }
    }

    public async Task<ApiResponse> DeleteRoutineAsync(Guid routineId, Guid personalId)
    {
        try
        {
            var routine = await _context.Routines
                .Include(r => r.Workouts)
                .Include(r => r.CustomerRoutines)
                .FirstOrDefaultAsync(r => r.Id == routineId && r.PersonalId == personalId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão para excluí-la");

            // Soft delete da rotina
            routine.Status = "I"; // I = Inativo
            routine.UpdatedAt = DateTime.UtcNow;

            // Soft delete das atribuições (CustomerRoutines)
            foreach (var customerRoutine in routine.CustomerRoutines)
            {
                customerRoutine.Status = "I";
                customerRoutine.UpdatedAt = DateTime.UtcNow;
            }

            // Soft delete dos workouts
            foreach (var workout in routine.Workouts)
            {
                workout.Status = "I";
                workout.UpdatedAt = DateTime.UtcNow;
            }

            // Buscar e fazer soft delete dos workout templates
            var workoutTemplates = await _context.WorkoutTemplates
                .Include(wt => wt.WorkoutSessions)
                .Where(wt => wt.RoutineId == routineId)
                .ToListAsync();

            foreach (var workoutTemplate in workoutTemplates)
            {
                workoutTemplate.Status = "I";
                workoutTemplate.UpdatedAt = DateTime.UtcNow;

                // Soft delete das sessões de treino
                foreach (var session in workoutTemplate.WorkoutSessions)
                {
                    session.Status = "CA"; // CA = Cancelado
                    session.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Rotina excluída com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao excluir rotina: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetRoutineByIdAsync(Guid routineId)
    {
        try
        {
            var routine = await _context.Routines
                .Include(r => r.Personal)
                .Include(r => r.Workouts.OrderBy(w => w.CreatedAt))
                    .ThenInclude(w => w.WorkoutSets.OrderBy(ws => ws.Order))
                        .ThenInclude(ws => ws.Exercise)
                .Include(r => r.CustomerRoutines)
                    .ThenInclude(cr => cr.Customer)
                .FirstOrDefaultAsync(r => r.Id == routineId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada");

            var response = new RoutineDetailResponse
            {
                Id = routine.Id,
                PersonalId = routine.PersonalId,
                PersonalName = routine.Personal.Name,
                PersonalImageUrl = routine.Personal.ImageUrl,
                Title = routine.Title,
                Goal = routine.Goal,
                Difficulty = routine.Difficulty,
                Weeks = routine.Weeks,
                Status = routine.Status,
                CreatedAt = routine.CreatedAt,
                UpdatedAt = routine.UpdatedAt,
                Workouts = routine.Workouts.Select(w => new WorkoutSummaryResponse
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
                }).ToList(),
                AssignedCustomers = routine.CustomerRoutines
                    .Where(cr => cr.Status == "A")
                    .Select(cr => new AssignedCustomerResponse
                    {
                        CustomerId = cr.CustomerId,
                        CustomerName = cr.Customer.Name,
                        CustomerImageUrl = cr.Customer.ImageUrl,
                        AssignedAt = cr.CreatedAt
                    }).ToList()
            };

            return ApiResponse.CreateSuccess("Rotina encontrada", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar rotina: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetRoutinesByPersonalAsync(Guid personalId, int page = 1, int pageSize = 10)
    {
        try
        {
            var query = _context.Routines
                .Include(r => r.Personal)
                .Include(r => r.Workouts)
                .Include(r => r.CustomerRoutines.Where(cr => cr.Status == "A"))
                .Where(r => r.PersonalId == personalId && r.Status == "A")
                .OrderByDescending(r => r.CreatedAt);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var routines = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = routines.Select(r => new RoutineResponse
            {
                Id = r.Id,
                PersonalId = r.PersonalId,
                PersonalName = r.Personal.Name,
                Title = r.Title,
                Goal = r.Goal,
                Difficulty = r.Difficulty,
                Weeks = r.Weeks,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                WorkoutCount = r.Workouts.Count,
                AssignedCustomersCount = r.CustomerRoutines.Count
            }).ToList();

            var paginatedResponse = PaginatedResponse<RoutineResponse>.Create(response, page, pageSize, totalCount);

            return ApiResponse.CreateSuccess("Rotinas encontradas", paginatedResponse);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar rotinas: {ex.Message}");
        }
    }

    public async Task<ApiResponse> AssignRoutineToCustomerAsync(Guid personalId, AssignRoutineToCustomerRequest request)
    {
        try
        {
            var routine = await _context.Routines
                .FirstOrDefaultAsync(r => r.Id == request.RoutineId && r.PersonalId == personalId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão");

            var customer = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.CustomerId);

            var personal = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == personalId);

            if (customer == null)
                return ApiResponse.CreateFailure("Cliente não encontrado");

            if (personal == null)
                return ApiResponse.CreateFailure("Usuário criador da rotina não encontrado");

            var isPersonal = personal.ProfileId == Guid.Parse(ProfilesConstants.PERSONAL);
            var isSelfManaged = personal.ProfileId == Guid.Parse(ProfilesConstants.SELF_MANAGED);

            if (!isPersonal && !isSelfManaged)
                return ApiResponse.CreateFailure("Apenas Personal Trainers e usuários auto geridos podem atribuir rotinas");

            if (isSelfManaged)
            {
                if (customer.ProfileId != Guid.Parse(ProfilesConstants.SELF_MANAGED))
                    return ApiResponse.CreateFailure("Compartilhamento de rotina por autogerido só é permitido para outros autogeridos");

                if (customer.Id == personalId)
                    return ApiResponse.CreateFailure("Não é necessário compartilhar a rotina com o próprio usuário");
            }
            else
            {
                var hasActiveBond = await _context.CustomerProfessionalBonds
                    .AnyAsync(b => b.ProfessionalId == personalId
                        && b.CustomerId == request.CustomerId
                        && b.Status == "A");

                if (!hasActiveBond)
                    return ApiResponse.CreateFailure("Cliente não possui vínculo ativo com o profissional");
            }

            var existingAssignment = await _context.CustomerRoutines
                .FirstOrDefaultAsync(cr => cr.RoutineId == request.RoutineId
                    && cr.CustomerId == request.CustomerId
                    && cr.Status == "A");

            if (existingAssignment != null)
                return ApiResponse.CreateFailure("Esta rotina já está atribuída a este cliente");

            var customerRoutine = new CustomerRoutineEntity
            {
                Id = Guid.NewGuid(),
                RoutineId = request.RoutineId,
                CustomerId = request.CustomerId,
                Status = "A",
                ExpiresAt = request.ExpiresAt,
                CreatedAt = DateTime.UtcNow
            };

            _context.CustomerRoutines.Add(customerRoutine);
            await _context.SaveChangesAsync();

            var pushMessage = new
            {
                title = "Nova rotina de treinos! 💪🏻",
                body = $"{personal?.Name ?? ""} atribuiu uma nova rotina para você!"
            };

            await _pushService.SendToUserAsync(customer.Id, pushMessage);
            return ApiResponse.CreateSuccess("Rotina atribuída ao cliente com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao atribuir rotina: {ex.Message}");
        }
    }

    public async Task<ApiResponse> UnassignRoutineFromCustomerAsync(Guid routineId, Guid customerId, Guid personalId)
    {
        try
        {
            var routine = await _context.Routines
                .FirstOrDefaultAsync(r => r.Id == routineId && r.PersonalId == personalId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão");

            var assignment = await _context.CustomerRoutines
                .FirstOrDefaultAsync(cr => cr.RoutineId == routineId
                    && cr.CustomerId == customerId
                    && cr.Status == "A");

            if (assignment == null)
                return ApiResponse.CreateFailure("Atribuição não encontrada");

            assignment.Status = "I";
            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Rotina removida do cliente com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao remover atribuição: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetCustomerRoutinesAsync(Guid customerId, int page = 1, int pageSize = 10)
    {
        try
        {
            var query = _context.CustomerRoutines
                .Include(cr => cr.Routine)
                    .ThenInclude(r => r.Personal)
                .Include(cr => cr.Routine)
                    .ThenInclude(r => r.Workouts)
                .Where(cr => cr.CustomerId == customerId && cr.Status == "A")
                .OrderByDescending(cr => cr.CreatedAt);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var assignments = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = assignments.Select(cr => new RoutineResponse
            {
                Id = cr.Routine.Id,
                PersonalId = cr.Routine.PersonalId,
                PersonalName = cr.Routine.Personal.Name,
                Title = cr.Routine.Title,
                Goal = cr.Routine.Goal,
                Difficulty = cr.Routine.Difficulty,
                Weeks = cr.Routine.Weeks,
                Status = cr.Routine.Status,
                CreatedAt = cr.Routine.CreatedAt,
                UpdatedAt = cr.Routine.UpdatedAt,
                WorkoutCount = cr.Routine.Workouts.Count,
                AssignedCustomersCount = 0
            }).ToList();

            var paginatedResponse = PaginatedResponse<RoutineResponse>.Create(response, page, pageSize, totalCount);

            return ApiResponse.CreateSuccess("Rotinas do cliente encontradas", paginatedResponse);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar rotinas do cliente: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetRoutineCustomersAsync(Guid routineId, Guid personalId)
    {
        try
        {
            // Verificar se a rotina existe e pertence ao personal
            var routine = await _context.Routines
                .Include(r => r.CustomerRoutines)
                    .ThenInclude(cr => cr.Customer)
                .FirstOrDefaultAsync(r => r.Id == routineId && r.PersonalId == personalId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão");

            // Buscar todos os alunos vinculados ao personal (bonds ativos)
            var bonds = await _context.CustomerProfessionalBonds
                .Include(b => b.Customer)
                .Where(b => b.ProfessionalId == personalId && b.Status == "A")
                .ToListAsync();

            // Alunos já atribuídos à rotina
            var assignedCustomerIds = routine.CustomerRoutines
                .Where(cr => cr.Status == "A")
                .Select(cr => cr.CustomerId)
                .ToHashSet();

            var assignedCustomers = routine.CustomerRoutines
                .Where(cr => cr.Status == "A")
                .Select(cr => new CustomerBasicInfo
                {
                    Id = cr.Customer.Id,
                    Name = cr.Customer.Name,
                    Email = cr.Customer.Email,
                    ImageUrl = cr.Customer.ImageUrl,
                    VideoUrl = cr.Customer.ImageUrl,
                    AssignedAt = cr.CreatedAt,
                    ExpiresAt = cr.ExpiresAt
                })
                .OrderBy(c => c.Name)
                .ToList();

            List<CustomerBasicInfo> availableCustomers;

            var routineOwner = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == personalId);

            if (routineOwner?.ProfileId == Guid.Parse(ProfilesConstants.SELF_MANAGED))
            {
                // Para autogeridos, permite compartilhar com outros autogeridos ativos.
                availableCustomers = await _context.Users
                    .Where(u => u.Status == "A"
                        && u.ProfileId == Guid.Parse(ProfilesConstants.SELF_MANAGED)
                        && u.Id != personalId
                        && !assignedCustomerIds.Contains(u.Id))
                    .OrderBy(u => u.Name)
                    .Select(u => new CustomerBasicInfo
                    {
                        Id = u.Id,
                        Name = u.Name,
                        Email = u.Email,
                        ImageUrl = u.ImageUrl,
                        VideoUrl = u.ImageUrl,
                        AssignedAt = null
                    })
                    .ToListAsync();
            }
            else
            {
                // Alunos disponíveis (vinculados mas não atribuídos à rotina)
                availableCustomers = bonds
                    .Where(b => !assignedCustomerIds.Contains(b.CustomerId))
                    .Select(b => new CustomerBasicInfo
                    {
                        Id = b.Customer.Id,
                        Name = b.Customer.Name,
                        Email = b.Customer.Email,
                        ImageUrl = b.Customer.ImageUrl,
                        VideoUrl = b.Customer.ImageUrl,
                        AssignedAt = null
                    })
                    .OrderBy(c => c.Name)
                    .ToList();
            }

            var response = new RoutineCustomersResponse
            {
                AssignedCustomers = assignedCustomers,
                AvailableCustomers = availableCustomers
            };

            return ApiResponse.CreateSuccess("Alunos carregados com sucesso", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar alunos da rotina: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetRoutinesNearExpiryAsync(Guid personalId, int daysThreshold = 7)
    {
        try
        {
            var now = DateTime.UtcNow;
            var thresholdDate = now.AddDays(daysThreshold);

            var expiringRoutines = await _context.CustomerRoutines
                .Include(cr => cr.Customer)
                .Include(cr => cr.Routine)
                .Where(cr => cr.Routine.PersonalId == personalId
                    && cr.Status == "A"
                    && cr.ExpiresAt != null
                    && cr.ExpiresAt <= thresholdDate
                    && cr.ExpiresAt >= now)
                .OrderBy(cr => cr.ExpiresAt)
                .Select(cr => new RoutineExpiryResponse
                {
                    CustomerId = cr.CustomerId,
                    CustomerName = cr.Customer.Name,
                    CustomerImageUrl = cr.Customer.ImageUrl,
                    RoutineId = cr.RoutineId,
                    RoutineTitle = cr.Routine.Title,
                    ExpiresAt = cr.ExpiresAt!.Value,
                    DaysUntilExpiry = (int)Math.Ceiling((cr.ExpiresAt!.Value - now).TotalDays)
                })
                .ToListAsync();

            return ApiResponse.CreateSuccess("Rotinas próximas da validade carregadas com sucesso", expiringRoutines);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar rotinas próximas da validade: {ex.Message}");
        }
    }

    public async Task<ApiResponse> UpdateCustomerRoutineExpiryAsync(Guid routineId, Guid customerId, Guid personalId, DateTime? expiresAt)
    {
        try
        {
            // Verificar se a rotina pertence ao personal
            var routine = await _context.Routines
                .FirstOrDefaultAsync(r => r.Id == routineId && r.PersonalId == personalId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão");

            // Buscar a atribuição
            var customerRoutine = await _context.CustomerRoutines
                .FirstOrDefaultAsync(cr => cr.RoutineId == routineId && cr.CustomerId == customerId && cr.Status == "A");

            if (customerRoutine == null)
                return ApiResponse.CreateFailure("Atribuição não encontrada");

            // Atualizar a data de vencimento
            customerRoutine.ExpiresAt = expiresAt;
            customerRoutine.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ApiResponse.CreateSuccess("Data de vencimento atualizada com sucesso");
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao atualizar data de vencimento: {ex.Message}");
        }
    }

    public async Task<ApiResponse> ImportRoutineAsync(Guid userId, ImportRoutineRequest request)
    {
        try
        {
            if (request?.Payload == null || request.Payload.Workouts == null || !request.Payload.Workouts.Any())
                return ApiResponse.CreateFailure("JSON inválido: workouts é obrigatório");

            var user = await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return ApiResponse.CreateFailure("Usuário não encontrado");

            var isPersonal = user.ProfileId == Guid.Parse(ProfilesConstants.PERSONAL);
            var isSelfManaged = user.ProfileId == Guid.Parse(ProfilesConstants.SELF_MANAGED);

            if (!isPersonal && !isSelfManaged)
                return ApiResponse.CreateFailure("Apenas Personal Trainers e usuários auto geridos podem importar rotinas");

            var activeCategories = await _context.ExerciseCategories
                .Where(c => c.Status == "A")
                .OrderBy(c => c.Name)
                .ToListAsync();

            if (!activeCategories.Any())
                return ApiResponse.CreateFailure("Nenhuma categoria de exercício ativa encontrada");

            var defaultCategory = activeCategories.FirstOrDefault(c => c.Name == "Força") ?? activeCategories.First();

            var routine = new RoutineEntity
            {
                Id = Guid.NewGuid(),
                PersonalId = userId,
                Title = string.IsNullOrWhiteSpace(request.RoutineTitle)
                    ? $"Rotina importada {DateTime.UtcNow.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture)}"
                    : request.RoutineTitle.Trim(),
                Goal = request.Goal,
                Difficulty = request.Difficulty,
                Weeks = request.Weeks,
                Status = "A",
                CreatedAt = DateTime.UtcNow
            };

            _context.Routines.Add(routine);

            var importedWorkouts = request.Payload.Workouts
                .OrderBy(w => w.Order)
                .ToList();

            var visibleExercises = await _context.Exercises
                .Where(e => (e.Status == "A" || e.Status == "P")
                    && (e.CreatedByUserId == null || e.CreatedByUserId == userId || e.IsPublished))
                .ToListAsync();

            var exercisesByName = visibleExercises
                .GroupBy(e => NormalizeName(e.Name))
                .ToDictionary(g => g.Key, g => g.First());

            var pendingExercises = new List<PendingExerciseImportResponse>();
            var importedExerciseCount = 0;

            foreach (var workoutPayload in importedWorkouts)
            {
                var workoutTemplate = new WorkoutTemplateEntity
                {
                    Id = Guid.NewGuid(),
                    RoutineId = routine.Id,
                    Title = string.IsNullOrWhiteSpace(workoutPayload.Title)
                        ? $"Treino {workoutPayload.Order}"
                        : workoutPayload.Title.Trim(),
                    Description = workoutPayload.Description,
                    EstimatedDurationMinutes = workoutPayload.EstimatedDurationMinutes,
                    Order = workoutPayload.Order,
                    Status = "A",
                    CreatedAt = DateTime.UtcNow
                };

                _context.WorkoutTemplates.Add(workoutTemplate);

                var exercises = workoutPayload.ExerciseTemplates
                    .OrderBy(e => e.Order)
                    .ToList();

                foreach (var exercisePayload in exercises)
                {
                    if (string.IsNullOrWhiteSpace(exercisePayload.ExerciseName))
                        continue;

                    var normalizedName = NormalizeName(exercisePayload.ExerciseName);
                    if (!exercisesByName.TryGetValue(normalizedName, out var exerciseEntity))
                    {
                        exerciseEntity = new ExerciseEntity
                        {
                            Id = Guid.NewGuid(),
                            CategoryId = defaultCategory.Id,
                            Name = exercisePayload.ExerciseName.Trim(),
                            ExerciseType = string.IsNullOrWhiteSpace(exercisePayload.ExerciseType) ? "Standard" : exercisePayload.ExerciseType,
                            Instruction = "Exercício importado automaticamente. Revisar nome, categoria e mídia antes de publicar.",
                            CreatedByUserId = userId,
                            IsPublished = false,
                            CreatedAt = DateTime.UtcNow,
                            Status = "P"
                        };

                        _context.Exercises.Add(exerciseEntity);
                        exercisesByName[normalizedName] = exerciseEntity;

                        pendingExercises.Add(new PendingExerciseImportResponse
                        {
                            ExerciseId = exerciseEntity.Id,
                            ExerciseName = exerciseEntity.Name,
                            WorkoutTitle = workoutTemplate.Title,
                            WorkoutOrder = workoutTemplate.Order,
                            ExerciseOrder = exercisePayload.Order
                        });
                    }
                    else if (!string.IsNullOrWhiteSpace(exercisePayload.ExerciseType)
                        && exerciseEntity.ExerciseType != exercisePayload.ExerciseType)
                    {
                        exerciseEntity.ExerciseType = exercisePayload.ExerciseType;
                    }

                    var setType = NormalizeSetType(exercisePayload.SetType);
                    var targetDuration = setType == "Time"
                        ? exercisePayload.TargetRepsMin ?? exercisePayload.TargetRepsMax
                        : null;

                    var exerciseTemplate = new ExerciseTemplateEntity
                    {
                        Id = Guid.NewGuid(),
                        WorkoutTemplateId = workoutTemplate.Id,
                        ExerciseId = exerciseEntity.Id,
                        Order = exercisePayload.Order,
                        TargetSets = exercisePayload.TargetSets,
                        TargetRepsMin = setType == "Time" ? null : exercisePayload.TargetRepsMin,
                        TargetRepsMax = setType == "Time" ? null : exercisePayload.TargetRepsMax,
                        TargetDurationSeconds = targetDuration,
                        SuggestedLoad = exercisePayload.SuggestedLoad,
                        RestSeconds = exercisePayload.RestSeconds,
                        Notes = exercisePayload.Notes,
                        SetType = setType,
                        WeightUnit = string.IsNullOrWhiteSpace(exercisePayload.WeightUnit)
                            ? "kg"
                            : exercisePayload.WeightUnit,
                        IsBisetWithPrevious = exercisePayload.IsBisetWithPrevious,
                        Status = "A",
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.ExerciseTemplates.Add(exerciseTemplate);
                    importedExerciseCount++;
                }
            }

            await _context.SaveChangesAsync();

            var assignedUsersCount = 0;
            var assignToUserIds = request.AssignToUserIds?.Distinct().ToList() ?? new List<Guid>();
            foreach (var assignUserId in assignToUserIds)
            {
                var assignResult = await AssignRoutineToCustomerAsync(userId, new AssignRoutineToCustomerRequest
                {
                    RoutineId = routine.Id,
                    CustomerId = assignUserId,
                    ExpiresAt = request.ExpiresAt
                });

                if (assignResult.Success)
                    assignedUsersCount++;
            }

            var response = new ImportRoutineResultResponse
            {
                RoutineId = routine.Id,
                RoutineTitle = routine.Title,
                ImportedWorkouts = importedWorkouts.Count,
                ImportedExercises = importedExerciseCount,
                AssignedUsersCount = assignedUsersCount,
                PendingExercises = pendingExercises
            };

            return ApiResponse.CreateSuccess("Rotina importada com sucesso", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao importar rotina: {ex.Message}");
        }
    }

    public async Task<ApiResponse> ExportRoutineAsync(Guid routineId, Guid userId)
    {
        try
        {
            var routine = await _context.Routines
                .Include(r => r.Workouts)
                .Include(r => r.CustomerRoutines)
                .Include(r => r.Personal)
                .FirstOrDefaultAsync(r => r.Id == routineId && r.Status == "A");

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada");

            var canExport = routine.PersonalId == userId || routine.CustomerRoutines.Any(cr => cr.CustomerId == userId && cr.Status == "A");
            if (!canExport)
                return ApiResponse.CreateFailure("Você não tem permissão para exportar essa rotina");

            var workoutTemplates = await _context.WorkoutTemplates
                .Where(wt => wt.RoutineId == routineId && wt.Status == "A")
                .Include(wt => wt.ExerciseTemplates.Where(et => et.Status == "A"))
                    .ThenInclude(et => et.Exercise)
                    .ThenInclude(e => e.Steps)
                .OrderBy(wt => wt.Order)
                .ToListAsync();

            var export = new RoutineExportResponse
            {
                SchemaVersion = "1.0",
                ExportedAt = DateTime.UtcNow,
                Workouts = workoutTemplates.Select(wt => new ExportedWorkoutResponse
                {
                    Title = wt.Title,
                    Description = wt.Description,
                    EstimatedDurationMinutes = wt.EstimatedDurationMinutes,
                    Order = wt.Order,
                    ExerciseTemplates = wt.ExerciseTemplates
                        .OrderBy(et => et.Order)
                        .Select(et => new ExportedExerciseResponse
                        {
                            ExerciseName = et.Exercise.Name,
                            ExerciseType = string.IsNullOrWhiteSpace(et.Exercise.ExerciseType) ? "Standard" : et.Exercise.ExerciseType,
                            Order = et.Order,
                            TargetSets = et.TargetSets,
                            TargetRepsMin = et.SetType == "Time" ? et.TargetDurationSeconds : et.TargetRepsMin,
                            TargetRepsMax = et.SetType == "Time" ? et.TargetDurationSeconds : et.TargetRepsMax,
                            SuggestedLoad = et.SuggestedLoad,
                            RestSeconds = et.RestSeconds,
                            SetType = et.SetType == "Time" ? "Duration" : et.SetType,
                            WeightUnit = et.WeightUnit,
                            Notes = et.Notes,
                            IsBisetWithPrevious = et.IsBisetWithPrevious,
                            Steps = et.Exercise.Steps
                                .OrderBy(s => s.Order)
                                .Select(s => new ExportedStepResponse
                                {
                                    Name = s.Name,
                                    Order = s.Order,
                                    DurationSeconds = s.DurationSeconds,
                                    Notes = s.Notes
                                }).ToList()
                        }).ToList()
                }).ToList()
            };

            return ApiResponse.CreateSuccess("Rotina exportada com sucesso", export);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao exportar rotina: {ex.Message}");
        }
    }

    private static string NormalizeName(string name)
    {
        return string.IsNullOrWhiteSpace(name)
            ? string.Empty
            : name.Trim().ToLowerInvariant();
    }

    private static string NormalizeSetType(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return "Reps";

        var normalized = input.Trim().ToLowerInvariant();
        return normalized switch
        {
            "duration" => "Time",
            "time" => "Time",
            "calories" => "Calories",
            "calorie" => "Calories",
            "amrap" => "Reps",
            _ => "Reps"
        };
    }
}
