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

    public RoutineService(NutrifitContext context)
    {
        _context = context;
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
                Weeks = request.Weeks,
                Difficulty = request.Difficulty,
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
                Weeks = routine.Weeks,
                Difficulty = routine.Difficulty,
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

            if (request.Weeks.HasValue)
                routine.Weeks = request.Weeks;

            if (!string.IsNullOrEmpty(request.Difficulty))
                routine.Difficulty = request.Difficulty;

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
                .FirstOrDefaultAsync(r => r.Id == routineId && r.PersonalId == personalId);

            if (routine == null)
                return ApiResponse.CreateFailure("Rotina não encontrada ou você não tem permissão para excluí-la");

            _context.Routines.Remove(routine);
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
                Weeks = routine.Weeks,
                Difficulty = routine.Difficulty,
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
                Weeks = r.Weeks,
                Difficulty = r.Difficulty,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                WorkoutCount = r.Workouts.Count,
                AssignedCustomersCount = r.CustomerRoutines.Count
            }).ToList();

            return ApiResponse.CreateSuccess("Rotinas encontradas", new
            {
                routines = response,
                pagination = new
                {
                    currentPage = page,
                    pageSize,
                    totalPages,
                    totalCount
                }
            });
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
                CreatedAt = DateTime.UtcNow
            };

            _context.CustomerRoutines.Add(customerRoutine);
            await _context.SaveChangesAsync();

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
                Weeks = cr.Routine.Weeks,
                Difficulty = cr.Routine.Difficulty,
                Status = cr.Routine.Status,
                CreatedAt = cr.Routine.CreatedAt,
                UpdatedAt = cr.Routine.UpdatedAt,
                WorkoutCount = cr.Routine.Workouts.Count,
                AssignedCustomersCount = 0
            }).ToList();

            return ApiResponse.CreateSuccess("Rotinas do cliente encontradas", new
            {
                routines = response,
                pagination = new
                {
                    currentPage = page,
                    pageSize,
                    totalPages,
                    totalCount
                }
            });
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar rotinas do cliente: {ex.Message}");
        }
    }
}
