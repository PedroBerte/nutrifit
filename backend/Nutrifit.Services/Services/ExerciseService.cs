using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services;

public class ExerciseService : IExerciseService
{
    private readonly NutrifitContext _context;

    public ExerciseService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse> GetAllExercisesAsync(int page = 1, int pageSize = 50)
    {
        try
        {
            var query = _context.Exercises
                .Include(e => e.Category)
                .Include(e => e.PrimaryMuscles)
                    .ThenInclude(pm => pm.Muscle)
                .Include(e => e.SecondaryMuscles)
                    .ThenInclude(sm => sm.Muscle)
                .Where(e => e.Status == "A")
                .OrderBy(e => e.Name);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var exercises = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = exercises.Select(e => new ExerciseResponse
            {
                Id = e.Id,
                Name = e.Name,
                Url = e.Url,
                Instruction = e.Instruction,
                CategoryName = e.Category?.Name ?? "",
                PrimaryMuscles = e.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
                SecondaryMuscles = e.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList()
            }).ToList();

            return ApiResponse.CreateSuccess("Exercícios encontrados", new
            {
                exercises = response,
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
            return ApiResponse.CreateFailure($"Erro ao buscar exercícios: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetExerciseByIdAsync(Guid exerciseId)
    {
        try
        {
            var exercise = await _context.Exercises
                .Include(e => e.Category)
                .Include(e => e.PrimaryMuscles)
                    .ThenInclude(pm => pm.Muscle)
                        .ThenInclude(m => m.MuscleGroup)
                .Include(e => e.SecondaryMuscles)
                    .ThenInclude(sm => sm.Muscle)
                        .ThenInclude(m => m.MuscleGroup)
                .FirstOrDefaultAsync(e => e.Id == exerciseId);

            if (exercise == null)
                return ApiResponse.CreateFailure("Exercício não encontrado");

            var response = new ExerciseResponse
            {
                Id = exercise.Id,
                Name = exercise.Name,
                Url = exercise.Url,
                Instruction = exercise.Instruction,
                CategoryName = exercise.Category?.Name ?? "",
                PrimaryMuscles = exercise.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
                SecondaryMuscles = exercise.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList()
            };

            return ApiResponse.CreateSuccess("Exercício encontrado", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar exercício: {ex.Message}");
        }
    }

    public async Task<ApiResponse> SearchExercisesAsync(string searchTerm, Guid? categoryId = null, int page = 1, int pageSize = 20)
    {
        try
        {
            var query = _context.Exercises
                .Include(e => e.Category)
                .Include(e => e.PrimaryMuscles)
                    .ThenInclude(pm => pm.Muscle)
                .Include(e => e.SecondaryMuscles)
                    .ThenInclude(sm => sm.Muscle)
                .Where(e => e.Status == "A");

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(e => 
                    e.Name.ToLower().Contains(searchTerm.ToLower()) ||
                    (e.Instruction != null && e.Instruction.ToLower().Contains(searchTerm.ToLower())));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var exercises = await query
                .OrderBy(e => e.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = exercises.Select(e => new ExerciseResponse
            {
                Id = e.Id,
                Name = e.Name,
                Url = e.Url,
                Instruction = e.Instruction,
                CategoryName = e.Category?.Name ?? "",
                PrimaryMuscles = e.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
                SecondaryMuscles = e.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList()
            }).ToList();

            return ApiResponse.CreateSuccess("Pesquisa realizada com sucesso", new
            {
                exercises = response,
                pagination = new
                {
                    currentPage = page,
                    pageSize,
                    totalPages,
                    totalCount
                },
                searchTerm,
                categoryId
            });
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao pesquisar exercícios: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetExerciseCategoriesAsync()
    {
        try
        {
            var categories = await _context.ExerciseCategories
                .Where(c => c.Status == "A")
                .OrderBy(c => c.Name)
                .ToListAsync();

            var response = categories.Select(c => new ExerciseCategoryResponse
            {
                Id = c.Id,
                Name = c.Name
            }).ToList();

            return ApiResponse.CreateSuccess("Categorias encontradas", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar categorias: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetMuscleGroupsAsync()
    {
        try
        {
            var muscleGroups = await _context.MuscleGroups
                .Include(mg => mg.Muscles.Where(m => m.Status == "A"))
                .Where(mg => mg.Status == "A")
                .OrderBy(mg => mg.Name)
                .ToListAsync();

            var response = muscleGroups.Select(mg => new MuscleGroupResponse
            {
                Id = mg.Id,
                Name = mg.Name,
                Muscles = mg.Muscles.Select(m => new MuscleResponse
                {
                    Id = m.Id,
                    Name = m.Name,
                    MuscleGroupName = mg.Name
                }).ToList()
            }).ToList();

            return ApiResponse.CreateSuccess("Grupos musculares encontrados", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar grupos musculares: {ex.Message}");
        }
    }

    public async Task<ApiResponse> GetExercisesByMuscleGroupAsync(Guid muscleGroupId)
    {
        try
        {
            // Buscar IDs dos músculos deste grupo
            var muscleIds = await _context.Muscles
                .Where(m => m.MuscleGroupId == muscleGroupId && m.Status == "A")
                .Select(m => m.Id)
                .ToListAsync();

            if (!muscleIds.Any())
                return ApiResponse.CreateSuccess("Nenhum músculo encontrado neste grupo", new List<ExerciseResponse>());

            // Buscar exercícios que trabalham estes músculos (primários ou secundários)
            var exercises = await _context.Exercises
                .Include(e => e.Category)
                .Include(e => e.PrimaryMuscles)
                    .ThenInclude(pm => pm.Muscle)
                .Include(e => e.SecondaryMuscles)
                    .ThenInclude(sm => sm.Muscle)
                .Where(e => e.Status == "A" && (
                    e.PrimaryMuscles.Any(pm => muscleIds.Contains(pm.MuscleId)) ||
                    e.SecondaryMuscles.Any(sm => muscleIds.Contains(sm.MuscleId))
                ))
                .OrderBy(e => e.Name)
                .ToListAsync();

            var response = exercises.Select(e => new ExerciseResponse
            {
                Id = e.Id,
                Name = e.Name,
                Url = e.Url,
                Instruction = e.Instruction,
                CategoryName = e.Category?.Name ?? "",
                PrimaryMuscles = e.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
                SecondaryMuscles = e.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList()
            }).ToList();

            return ApiResponse.CreateSuccess("Exercícios encontrados", response);
        }
        catch (Exception ex)
        {
            return ApiResponse.CreateFailure($"Erro ao buscar exercícios: {ex.Message}");
        }
    }
}
