using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

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

            if (personal.Profile.Name != "Personal")
                return ApiResponse.CreateFailure("Apenas Personal Trainers podem criar rotinas");

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
                .FirstOrDefaultAsync(u => u.Id == personalId);

            if (customer == null)
                return ApiResponse.CreateFailure("Cliente não encontrado");

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
                    AssignedAt = cr.CreatedAt,
                    ExpiresAt = cr.ExpiresAt
                })
                .OrderBy(c => c.Name)
                .ToList();

            // Alunos disponíveis (vinculados mas não atribuídos à rotina)
            var availableCustomers = bonds
                .Where(b => !assignedCustomerIds.Contains(b.CustomerId))
                .Select(b => new CustomerBasicInfo
                {
                    Id = b.Customer.Id,
                    Name = b.Customer.Name,
                    Email = b.Customer.Email,
                    ImageUrl = b.Customer.ImageUrl,
                    AssignedAt = null
                })
                .OrderBy(c => c.Name)
                .ToList();

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
}
