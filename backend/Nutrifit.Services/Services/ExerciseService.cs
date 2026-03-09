using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Response;
using System.Reactive;

namespace Nutrifit.Services.Services;

public class ExerciseService : IExerciseService
{
    private readonly NutrifitContext _context;

    public ExerciseService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse> GetAllExercisesAsync(int page = 1, int pageSize = 50, string? userId = null)
    {
        var skip = (page - 1) * pageSize;

        var userGuid = !string.IsNullOrEmpty(userId) ? Guid.Parse(userId) : (Guid?)null;

        var exercises = await _context.Exercises
            .Where(e => (e.Status == "A" || (e.Status == "P" && e.CreatedByUserId == userGuid))
                && (e.CreatedByUserId == null || e.CreatedByUserId == userGuid || e.IsPublished))
            .Include(e => e.Category)
            .Include(e => e.PrimaryMuscles)
                .ThenInclude(pm => pm.Muscle)
            .Include(e => e.SecondaryMuscles)
                .ThenInclude(sm => sm.Muscle)
            .OrderBy(e => e.Name)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        var response = exercises.Select(e => new ExerciseResponse
        {
            Id = e.Id,
            Name = e.Name,
            ImageUrl = e.ImageUrl,
            Instruction = e.Instruction,
            VideoUrl = e.VideoUrl,
            CreatedByUserId = e.CreatedByUserId,
            IsPublished = e.IsPublished,
            IsCustom = e.CreatedByUserId != null,
            Status = e.Status,
            IsPendingReview = e.Status == "P",
            ExerciseType = e.ExerciseType,
            CategoryName = e.Category.Name,
            PrimaryMuscles = e.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
            SecondaryMuscles = e.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList()
        }).ToList();

        return new ApiResponse
        {
            Success = true,
            Message = "Exercícios recuperados com sucesso",
            Data = response
        };
    }

    public async Task<ApiResponse> GetExerciseByIdAsync(Guid exerciseId)
    {
        var exercise = await _context.Exercises
            .Where(e => e.Id == exerciseId && e.Status == "A")
            .Include(e => e.Category)
            .Include(e => e.PrimaryMuscles)
                .ThenInclude(pm => pm.Muscle)
            .Include(e => e.SecondaryMuscles)
                .ThenInclude(sm => sm.Muscle)
            .Include(e => e.Steps.OrderBy(s => s.Order))
            .FirstOrDefaultAsync();

        if (exercise == null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Exercício não encontrado"
            };
        }

        var response = new ExerciseResponse
        {
            Id = exercise.Id,
            Name = exercise.Name,
            ImageUrl = exercise.ImageUrl,
            Instruction = exercise.Instruction,
            VideoUrl = exercise.VideoUrl,
            CreatedByUserId = exercise.CreatedByUserId,
            IsPublished = exercise.IsPublished,
            IsCustom = exercise.CreatedByUserId != null,
            CategoryName = exercise.Category.Name,
            ExerciseType = exercise.ExerciseType,
            PrimaryMuscles = exercise.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
            SecondaryMuscles = exercise.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList(),
            Steps = exercise.Steps.OrderBy(s => s.Order).Select(s => new ExerciseStepResponse
            {
                Id = s.Id,
                Name = s.Name,
                Order = s.Order,
                DurationSeconds = s.DurationSeconds,
                Notes = s.Notes
            }).ToList()
        };

        return new ApiResponse
        {
            Success = true,
            Message = "Exercício encontrado",
            Data = response
        };
    }

    public async Task<ApiResponse> SearchExercisesAsync(string searchTerm, Guid? categoryId = null, int page = 1, int pageSize = 20, string? userId = null)
    {
        var skip = (page - 1) * pageSize;

        var userGuid = !string.IsNullOrEmpty(userId) ? Guid.Parse(userId) : (Guid?)null;

        var query = _context.Exercises
            .Where(e => (e.Status == "A" || (e.Status == "P" && e.CreatedByUserId == userGuid))
                && (e.CreatedByUserId == null || e.CreatedByUserId == userGuid || e.IsPublished))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(e => e.Name.ToLower().Contains(searchTerm.ToLower()));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(e => e.CategoryId == categoryId.Value);
        }

        var exercises = await query
            .Include(e => e.Category)
            .Include(e => e.PrimaryMuscles)
                .ThenInclude(pm => pm.Muscle)
            .Include(e => e.SecondaryMuscles)
                .ThenInclude(sm => sm.Muscle)
            .OrderBy(e => e.Name)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        var response = exercises.Select(e => new ExerciseResponse
        {
            Id = e.Id,
            Name = e.Name,
            ImageUrl = e.ImageUrl,
            Instruction = e.Instruction,
            VideoUrl = e.VideoUrl,
            CreatedByUserId = e.CreatedByUserId,
            IsPublished = e.IsPublished,
            IsCustom = e.CreatedByUserId != null,
            Status = e.Status,
            IsPendingReview = e.Status == "P",            ExerciseType = e.ExerciseType,            CategoryName = e.Category.Name,
            PrimaryMuscles = e.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
            SecondaryMuscles = e.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList()
        }).ToList();

        return new ApiResponse
        {
            Success = true,
            Message = "Exercícios encontrados",
            Data = response
        };
    }

    public async Task<ApiResponse> GetExerciseCategoriesAsync()
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

        return new ApiResponse
        {
            Success = true,
            Message = "Categorias recuperadas com sucesso",
            Data = response
        };
    }

    public async Task<ApiResponse> GetMuscleGroupsAsync()
    {
        var muscleGroups = await _context.MuscleGroups
            .Where(mg => mg.Status == "A")
            .Include(mg => mg.Muscles.Where(m => m.Status == "A"))
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

        return new ApiResponse
        {
            Success = true,
            Message = "Grupos musculares recuperados com sucesso",
            Data = response
        };
    }

    public async Task<ApiResponse> GetExercisesByMuscleGroupAsync(Guid muscleGroupId)
    {
        var muscleIds = await _context.Muscles
            .Where(m => m.MuscleGroupId == muscleGroupId && m.Status == "A")
            .Select(m => m.Id)
            .ToListAsync();

        var exercises = await _context.Exercises
            .Where(e => e.Status == "A" &&
                   (e.CreatedByUserId == null || e.IsPublished) &&
                   (e.PrimaryMuscles.Any(pm => muscleIds.Contains(pm.MuscleId)) ||
                    e.SecondaryMuscles.Any(sm => muscleIds.Contains(sm.MuscleId))))
            .Include(e => e.Category)
            .Include(e => e.PrimaryMuscles)
                .ThenInclude(pm => pm.Muscle)
            .Include(e => e.SecondaryMuscles)
                .ThenInclude(sm => sm.Muscle)
            .OrderBy(e => e.Name)
            .ToListAsync();

        var response = exercises.Select(e => new ExerciseResponse
        {
            Id = e.Id,
            Name = e.Name,
            ImageUrl = e.ImageUrl,
            Instruction = e.Instruction,
            VideoUrl = e.VideoUrl,
            CreatedByUserId = e.CreatedByUserId,
            IsPublished = e.IsPublished,
            IsCustom = e.CreatedByUserId != null,
            ExerciseType = e.ExerciseType,
            CategoryName = e.Category.Name,
            PrimaryMuscles = e.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
            SecondaryMuscles = e.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList()
        }).ToList();

        return new ApiResponse
        {
            Success = true,
            Message = "Exercícios encontrados",
            Data = response
        };
    }

    public async Task<ApiResponse> CreateExerciseAsync(CreateExerciseRequest request, Guid userId)
    {
        // Validar categoria
        var categoryExists = await _context.ExerciseCategories
            .AnyAsync(c => c.Id == request.CategoryId && c.Status == "A");

        if (!categoryExists)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Categoria inválida"
            };
        }

        // Validar músculos primários
        if (request.PrimaryMuscleIds.Any())
        {
            var primaryMusclesExist = await _context.Muscles
                .CountAsync(m => request.PrimaryMuscleIds.Contains(m.Id) && m.Status == "A");

            if (primaryMusclesExist != request.PrimaryMuscleIds.Count)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = "Um ou mais músculos primários são inválidos"
                };
            }
        }

        // Validar músculos secundários
        if (request.SecondaryMuscleIds.Any())
        {
            var secondaryMusclesExist = await _context.Muscles
                .CountAsync(m => request.SecondaryMuscleIds.Contains(m.Id) && m.Status == "A");

            if (secondaryMusclesExist != request.SecondaryMuscleIds.Count)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = "Um ou mais músculos secundários são inválidos"
                };
            }
        }

        var exercise = new ExerciseEntity
        {
            Id = Guid.NewGuid(),
            CategoryId = request.CategoryId,
            Name = request.Name,
            Instruction = request.Instruction,
            ImageUrl = request.ImageUrl,
            VideoUrl = request.VideoUrl,
            CreatedByUserId = userId,
            IsPublished = request.IsPublished,
            ExerciseType = request.ExerciseType ?? "Standard",
            CreatedAt = DateTime.UtcNow,
            Status = "A"
        };

        _context.Exercises.Add(exercise);

        // Adicionar músculos primários
        foreach (var muscleId in request.PrimaryMuscleIds)
        {
            _context.ExercisePrimaryMuscles.Add(new ExercisePrimaryMuscleEntity
            {
                ExerciseId = exercise.Id,
                MuscleId = muscleId
            });
        }

        // Adicionar músculos secundários
        foreach (var muscleId in request.SecondaryMuscleIds)
        {
            _context.ExerciseSecondaryMuscles.Add(new ExerciseSecondaryMuscleEntity
            {
                ExerciseId = exercise.Id,
                MuscleId = muscleId
            });
        }

        await _context.SaveChangesAsync();

        return new ApiResponse
        {
            Success = true,
            Message = "Exercício criado com sucesso",
            Data = new { ExerciseId = exercise.Id }
        };
    }

    public async Task<ApiResponse> UpdateExerciseAsync(Guid exerciseId, UpdateExerciseRequest request, Guid userId)
    {
        var exercise = await _context.Exercises
            .Include(e => e.PrimaryMuscles)
            .Include(e => e.SecondaryMuscles)
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (e.Status == "A" || e.Status == "P"));

        if (exercise == null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Exercício não encontrado"
            };
        }

        // Verificar se o usuário é o criador
        if (exercise.CreatedByUserId != userId)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Você não tem permissão para editar este exercício"
            };
        }

        // Validar categoria
        var categoryExists = await _context.ExerciseCategories
            .AnyAsync(c => c.Id == request.CategoryId && c.Status == "A");

        if (!categoryExists)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Categoria inválida"
            };
        }

        // Validar músculos primários
        if (request.PrimaryMuscleIds.Any())
        {
            var primaryMusclesExist = await _context.Muscles
                .CountAsync(m => request.PrimaryMuscleIds.Contains(m.Id) && m.Status == "A");

            if (primaryMusclesExist != request.PrimaryMuscleIds.Count)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = "Um ou mais músculos primários são inválidos"
                };
            }
        }

        // Validar músculos secundários
        if (request.SecondaryMuscleIds.Any())
        {
            var secondaryMusclesExist = await _context.Muscles
                .CountAsync(m => request.SecondaryMuscleIds.Contains(m.Id) && m.Status == "A");

            if (secondaryMusclesExist != request.SecondaryMuscleIds.Count)
            {
                return new ApiResponse
                {
                    Success = false,
                    Message = "Um ou mais músculos secundários são inválidos"
                };
            }
        }

        // Atualizar exercício
        exercise.CategoryId = request.CategoryId;
        exercise.Name = request.Name;
        exercise.Instruction = request.Instruction;
        exercise.ImageUrl = request.ImageUrl;
        exercise.VideoUrl = request.VideoUrl;
        exercise.IsPublished = request.IsPublished;
        exercise.ExerciseType = request.ExerciseType ?? "Standard";
        if (exercise.Status == "P")
            exercise.Status = "A";
        exercise.UpdatedAt = DateTime.UtcNow;

        // Remover músculos antigos
        _context.ExercisePrimaryMuscles.RemoveRange(exercise.PrimaryMuscles);
        _context.ExerciseSecondaryMuscles.RemoveRange(exercise.SecondaryMuscles);

        // Adicionar novos músculos primários
        foreach (var muscleId in request.PrimaryMuscleIds)
        {
            _context.ExercisePrimaryMuscles.Add(new ExercisePrimaryMuscleEntity
            {
                ExerciseId = exercise.Id,
                MuscleId = muscleId
            });
        }

        // Adicionar novos músculos secundários
        foreach (var muscleId in request.SecondaryMuscleIds)
        {
            _context.ExerciseSecondaryMuscles.Add(new ExerciseSecondaryMuscleEntity
            {
                ExerciseId = exercise.Id,
                MuscleId = muscleId
            });
        }

        await _context.SaveChangesAsync();

        return new ApiResponse
        {
            Success = true,
            Message = "Exercício atualizado com sucesso"
        };
    }

    public async Task<ApiResponse> DeleteExerciseAsync(Guid exerciseId, Guid userId)
    {
        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (e.Status == "A" || e.Status == "P"));

        if (exercise == null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Exercício não encontrado"
            };
        }

        // Verificar se o usuário é o criador
        if (exercise.CreatedByUserId != userId)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Você não tem permissão para deletar este exercício"
            };
        }

        // Soft delete
        exercise.Status = "I";
        exercise.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ApiResponse
        {
            Success = true,
            Message = "Exercício deletado com sucesso"
        };
    }

    public async Task<ApiResponse> UpdateExerciseMediaAsync(Guid exerciseId, UpdateExerciseMediaRequest request)
    {
        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (e.Status == "A" || e.Status == "P"));

        if (exercise == null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = "Exercício não encontrado"
            };
        }

        // Atualizar apenas os campos de mídia
        if (request.ImageUrl != null)
            exercise.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl;
        
        if (request.VideoUrl != null)
            exercise.VideoUrl = string.IsNullOrWhiteSpace(request.VideoUrl) ? null : request.VideoUrl;

        if (request.ExerciseType != null)
            exercise.ExerciseType = request.ExerciseType;

        if (exercise.Status == "P")
            exercise.Status = "A";

        exercise.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ApiResponse
        {
            Success = true,
            Message = "Mídia do exercício atualizada com sucesso"
        };
    }

    public async Task<ApiResponse> GetUserExercisesAsync(Guid userId, int page = 1, int pageSize = 50)
    {
        var skip = (page - 1) * pageSize;

        var exercises = await _context.Exercises
            .Where(e => (e.Status == "A" || e.Status == "P") && e.CreatedByUserId == userId)
            .Include(e => e.Category)
            .Include(e => e.PrimaryMuscles)
                .ThenInclude(pm => pm.Muscle)
            .Include(e => e.SecondaryMuscles)
                .ThenInclude(sm => sm.Muscle)
            .OrderBy(e => e.Name)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        var response = exercises.Select(e => new ExerciseResponse
        {
            Id = e.Id,
            Name = e.Name,
            ImageUrl = e.ImageUrl,
            Instruction = e.Instruction,
            VideoUrl = e.VideoUrl,
            CreatedByUserId = e.CreatedByUserId,
            IsPublished = e.IsPublished,
            IsCustom = true,
            Status = e.Status,
            IsPendingReview = e.Status == "P",
            ExerciseType = e.ExerciseType,
            CategoryName = e.Category.Name,
            PrimaryMuscles = e.PrimaryMuscles.Select(pm => pm.Muscle.Name).ToList(),
            SecondaryMuscles = e.SecondaryMuscles.Select(sm => sm.Muscle.Name).ToList()
        }).ToList();

        return new ApiResponse
        {
            Success = true,
            Message = "Exercícios do usuário recuperados com sucesso",
            Data = response
        };
    }

    public async Task<ApiResponse> GetExerciseStepsAsync(Guid exerciseId)
    {
        var exerciseExists = await _context.Exercises
            .AnyAsync(e => e.Id == exerciseId && e.Status == "A");

        if (!exerciseExists)
            return new ApiResponse { Success = false, Message = "Exercício não encontrado" };

        var steps = await _context.ExerciseSteps
            .Where(s => s.ExerciseId == exerciseId)
            .OrderBy(s => s.Order)
            .Select(s => new ExerciseStepResponse
            {
                Id = s.Id,
                Name = s.Name,
                Order = s.Order,
                DurationSeconds = s.DurationSeconds,
                Notes = s.Notes
            })
            .ToListAsync();

        return new ApiResponse { Success = true, Message = "Steps recuperados com sucesso", Data = steps };
    }

    public async Task<ApiResponse> AddExerciseStepAsync(Guid exerciseId, CreateExerciseStepRequest request, Guid userId)
    {
        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (e.Status == "A" || e.Status == "P"));

        if (exercise == null)
            return new ApiResponse { Success = false, Message = "Exercício não encontrado" };

        if (exercise.CreatedByUserId != userId)
            return new ApiResponse { Success = false, Message = "Você não tem permissão para editar este exercício" };

        var step = new ExerciseStepEntity
        {
            Id = Guid.NewGuid(),
            ExerciseId = exerciseId,
            Name = request.Name,
            Order = request.Order,
            DurationSeconds = request.DurationSeconds,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.ExerciseSteps.Add(step);
        await _context.SaveChangesAsync();

        return new ApiResponse
        {
            Success = true,
            Message = "Step adicionado com sucesso",
            Data = new ExerciseStepResponse
            {
                Id = step.Id,
                Name = step.Name,
                Order = step.Order,
                DurationSeconds = step.DurationSeconds,
                Notes = step.Notes
            }
        };
    }

    public async Task<ApiResponse> UpdateExerciseStepAsync(Guid exerciseId, Guid stepId, UpdateExerciseStepRequest request, Guid userId)
    {
        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (e.Status == "A" || e.Status == "P"));

        if (exercise == null)
            return new ApiResponse { Success = false, Message = "Exercício não encontrado" };

        if (exercise.CreatedByUserId != userId)
            return new ApiResponse { Success = false, Message = "Você não tem permissão para editar este exercício" };

        var step = await _context.ExerciseSteps
            .FirstOrDefaultAsync(s => s.Id == stepId && s.ExerciseId == exerciseId);

        if (step == null)
            return new ApiResponse { Success = false, Message = "Step não encontrado" };

        step.Name = request.Name;
        step.Order = request.Order;
        step.DurationSeconds = request.DurationSeconds;
        step.Notes = request.Notes;
        step.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ApiResponse { Success = true, Message = "Step atualizado com sucesso" };
    }

    public async Task<ApiResponse> DeleteExerciseStepAsync(Guid exerciseId, Guid stepId, Guid userId)
    {
        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (e.Status == "A" || e.Status == "P"));

        if (exercise == null)
            return new ApiResponse { Success = false, Message = "Exercício não encontrado" };

        if (exercise.CreatedByUserId != userId)
            return new ApiResponse { Success = false, Message = "Você não tem permissão para editar este exercício" };

        var step = await _context.ExerciseSteps
            .FirstOrDefaultAsync(s => s.Id == stepId && s.ExerciseId == exerciseId);

        if (step == null)
            return new ApiResponse { Success = false, Message = "Step não encontrado" };

        _context.ExerciseSteps.Remove(step);
        await _context.SaveChangesAsync();

        return new ApiResponse { Success = true, Message = "Step removido com sucesso" };
    }

    public async Task<ApiResponse> ReplaceExerciseStepsAsync(Guid exerciseId, ReplaceExerciseStepsRequest request, Guid userId)
    {
        var exercise = await _context.Exercises
            .FirstOrDefaultAsync(e => e.Id == exerciseId && (e.Status == "A" || e.Status == "P"));

        if (exercise == null)
            return new ApiResponse { Success = false, Message = "Exercício não encontrado" };

        if (exercise.CreatedByUserId != userId)
            return new ApiResponse { Success = false, Message = "Você não tem permissão para editar este exercício" };

        var existing = await _context.ExerciseSteps
            .Where(s => s.ExerciseId == exerciseId)
            .ToListAsync();

        _context.ExerciseSteps.RemoveRange(existing);

        var newSteps = request.Steps.Select((s, i) => new ExerciseStepEntity
        {
            Id = Guid.NewGuid(),
            ExerciseId = exerciseId,
            Name = s.Name,
            Order = s.Order > 0 ? s.Order : i + 1,
            DurationSeconds = s.DurationSeconds,
            Notes = s.Notes,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        _context.ExerciseSteps.AddRange(newSteps);
        await _context.SaveChangesAsync();

        var response = newSteps.OrderBy(s => s.Order).Select(s => new ExerciseStepResponse
        {
            Id = s.Id,
            Name = s.Name,
            Order = s.Order,
            DurationSeconds = s.DurationSeconds,
            Notes = s.Notes
        }).ToList();

        return new ApiResponse { Success = true, Message = "Steps substituídos com sucesso", Data = response };
    }
}
