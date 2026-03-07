using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly NutrifitContext _context;
    private readonly IConfiguration _configuration;
    private readonly IAuthenticationService _authenticationService;

    public AdminController(
        NutrifitContext context,
        IConfiguration configuration,
        IAuthenticationService authenticationService)
    {
        _context = context;
        _configuration = configuration;
        _authenticationService = authenticationService;
    }

    [HttpPost("activate")]
    public async Task<IActionResult> ActivateAdmin([FromBody] ActivateAdminRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Code))
            return BadRequest("Código de ativação inválido.");

        if (!Guid.TryParse(request.Code, out var receivedCode))
            return BadRequest("O código deve ser um GUID válido.");

        var configuredCodeRaw = _configuration["Admin:ActivationCode"]
            ?? _configuration["Admin__ActivationCode"]
            ?? Environment.GetEnvironmentVariable("ADMIN_ACTIVATION_CODE");
        if (!Guid.TryParse(configuredCodeRaw, out var configuredCode))
            return StatusCode(500, "Código de ativação do admin não configurado corretamente.");

        if (receivedCode != configuredCode)
            return Unauthorized("Código inválido.");

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized("Usuário não autenticado.");

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId.Value);
        if (user is null)
            return NotFound("Usuário não encontrado.");

        if (!user.IsAdmin)
        {
            user.IsAdmin = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        var accessToken = await _authenticationService.IssueJwtForUserAsync(user.Id);

        return Ok(new
        {
            message = "Usuário promovido para admin com sucesso.",
            accessToken,
            tokenType = "Bearer",
            isAdmin = true
        });
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        var totalUsers = await _context.Users.CountAsync();
        var totalAdmins = await _context.Users.CountAsync(x => x.IsAdmin);
        var totalBonds = await _context.CustomerProfessionalBonds.CountAsync();
        var totalActiveBonds = await _context.CustomerProfessionalBonds.CountAsync(x => x.Status == "A");
        var totalPendingBonds = await _context.CustomerProfessionalBonds.CountAsync(x => x.Status == "P");
        var totalExercises = await _context.Exercises.CountAsync();
        var totalWorkoutTemplates = await _context.WorkoutTemplates.CountAsync();
        var totalRoutines = await _context.Routines.CountAsync();

        return Ok(new
        {
            totalUsers,
            totalAdmins,
            totalBonds,
            totalActiveBonds,
            totalPendingBonds,
            totalExercises,
            totalWorkoutTemplates,
            totalRoutines
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] bool? isAdmin = null)
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        var normalized = NormalizePagination(page, pageSize);

        var query = _context.Users
            .AsNoTracking()
            .Include(x => x.Profile)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(term) ||
                x.Email.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusNormalized = status.Trim().ToUpperInvariant();
            query = query.Where(x => x.Status == statusNormalized);
        }

        if (isAdmin.HasValue)
        {
            query = query.Where(x => x.IsAdmin == isAdmin.Value);
        }

        var totalCount = await query.CountAsync();

        var users = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((normalized.Page - 1) * normalized.PageSize)
            .Take(normalized.PageSize)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Email,
                x.PhoneNumber,
                x.Status,
                x.IsAdmin,
                x.CreatedAt,
                profile = x.Profile.Name
            })
            .ToListAsync();

        return Ok(ToPaginated(users, normalized.Page, normalized.PageSize, totalCount));
    }

    [HttpPatch("users/{userId:guid}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid userId, [FromBody] UpdateUserStatusRequest request)
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        if (request is null || string.IsNullOrWhiteSpace(request.Status))
            return BadRequest("Status inválido.");

        var normalizedStatus = request.Status.Trim().ToUpperInvariant();
        if (normalizedStatus is not ("A" or "I"))
            return BadRequest("Status de usuário deve ser 'A' ou 'I'.");

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null)
            return NotFound("Usuário não encontrado.");

        user.Status = normalizedStatus;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Status do usuário atualizado com sucesso." });
    }

    [HttpPatch("users/{userId:guid}/admin")]
    public async Task<IActionResult> UpdateUserAdmin(Guid userId, [FromBody] UpdateUserAdminRequest request)
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null)
            return NotFound("Usuário não encontrado.");

        user.IsAdmin = request.IsAdmin;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Permissão de admin atualizada com sucesso." });
    }

    [HttpGet("bonds")]
    public async Task<IActionResult> GetBonds(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        var normalized = NormalizePagination(page, pageSize);

        var query = _context.CustomerProfessionalBonds
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Professional)
            .Include(x => x.Sender)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusNormalized = status.Trim().ToUpperInvariant();
            query = query.Where(x => x.Status == statusNormalized);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Customer.Name.ToLower().Contains(term)
                || x.Customer.Email.ToLower().Contains(term)
                || x.Professional.Name.ToLower().Contains(term)
                || x.Professional.Email.ToLower().Contains(term)
                || x.Sender.Name.ToLower().Contains(term)
                || x.Sender.Email.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();

        var bonds = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((normalized.Page - 1) * normalized.PageSize)
            .Take(normalized.PageSize)
            .Select(x => new
            {
                x.Id,
                x.Status,
                x.CreatedAt,
                customer = new { x.CustomerId, x.Customer.Name, x.Customer.Email },
                professional = new { x.ProfessionalId, x.Professional.Name, x.Professional.Email },
                sender = new { x.SenderId, x.Sender.Name, x.Sender.Email }
            })
            .ToListAsync();

        return Ok(ToPaginated(bonds, normalized.Page, normalized.PageSize, totalCount));
    }

    [HttpPatch("bonds/{bondId:guid}/status")]
    public async Task<IActionResult> UpdateBondStatus(Guid bondId, [FromBody] UpdateBondStatusRequest request)
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        if (request is null || string.IsNullOrWhiteSpace(request.Status))
            return BadRequest("Status inválido.");

        var normalizedStatus = request.Status.Trim().ToUpperInvariant();
        if (normalizedStatus is not ("A" or "P" or "C" or "I"))
            return BadRequest("Status de vínculo deve ser 'A', 'P', 'C' ou 'I'.");

        var bond = await _context.CustomerProfessionalBonds.FirstOrDefaultAsync(x => x.Id == bondId);
        if (bond is null)
            return NotFound("Vínculo não encontrado.");

        bond.Status = normalizedStatus;
        bond.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Status do vínculo atualizado com sucesso." });
    }

    [HttpGet("exercises")]
    public async Task<IActionResult> GetExercises(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null,
        [FromQuery] bool? isPublished = null)
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        var normalized = NormalizePagination(page, pageSize);

        var query = _context.Exercises
            .AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.CreatedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Name.ToLower().Contains(term)
                || x.Category.Name.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusNormalized = status.Trim().ToUpperInvariant();
            query = query.Where(x => x.Status == statusNormalized);
        }

        if (isPublished.HasValue)
        {
            query = query.Where(x => x.IsPublished == isPublished.Value);
        }

        var totalCount = await query.CountAsync();

        var exercises = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((normalized.Page - 1) * normalized.PageSize)
            .Take(normalized.PageSize)
            .Select(x => new
            {
                x.Id,
                x.Name,
                category = x.Category.Name,
                x.IsPublished,
                x.Status,
                x.CreatedAt,
                createdBy = x.CreatedByUser != null ? x.CreatedByUser.Name : null
            })
            .ToListAsync();

        return Ok(ToPaginated(exercises, normalized.Page, normalized.PageSize, totalCount));
    }

    [HttpGet("workouts")]
    public async Task<IActionResult> GetWorkoutTemplates(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        var normalized = NormalizePagination(page, pageSize);

        var query = _context.WorkoutTemplates
            .AsNoTracking()
            .Include(x => x.Routine)
                .ThenInclude(r => r.Personal)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Title.ToLower().Contains(term)
                || x.Routine.Title.ToLower().Contains(term)
                || x.Routine.Personal.Name.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusNormalized = status.Trim().ToUpperInvariant();
            query = query.Where(x => x.Status == statusNormalized);
        }

        var totalCount = await query.CountAsync();

        var workouts = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((normalized.Page - 1) * normalized.PageSize)
            .Take(normalized.PageSize)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.Order,
                x.Status,
                x.CreatedAt,
                routineId = x.RoutineId,
                routine = x.Routine.Title,
                personal = x.Routine.Personal.Name
            })
            .ToListAsync();

        return Ok(ToPaginated(workouts, normalized.Page, normalized.PageSize, totalCount));
    }

    [HttpGet("routines")]
    public async Task<IActionResult> GetRoutines(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? status = null)
    {
        var guard = EnsureAdmin();
        if (guard is not null) return guard;

        var normalized = NormalizePagination(page, pageSize);

        var query = _context.Routines
            .AsNoTracking()
            .Include(x => x.Personal)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.Title.ToLower().Contains(term)
                || (x.Goal != null && x.Goal.ToLower().Contains(term))
                || x.Personal.Name.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            var statusNormalized = status.Trim().ToUpperInvariant();
            query = query.Where(x => x.Status == statusNormalized);
        }

        var totalCount = await query.CountAsync();

        var routines = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((normalized.Page - 1) * normalized.PageSize)
            .Take(normalized.PageSize)
            .Select(x => new
            {
                x.Id,
                x.Title,
                x.Goal,
                x.Difficulty,
                x.Weeks,
                x.Status,
                x.CreatedAt,
                personal = x.Personal.Name
            })
            .ToListAsync();

        return Ok(ToPaginated(routines, normalized.Page, normalized.PageSize, totalCount));
    }

    private static (int Page, int PageSize) NormalizePagination(int page, int pageSize)
    {
        var safePage = page < 1 ? 1 : page;
        var safePageSize = pageSize < 1 ? 20 : Math.Min(pageSize, 100);
        return (safePage, safePageSize);
    }

    private static object ToPaginated<T>(List<T> items, int page, int pageSize, int totalCount)
    {
        return new
        {
            items,
            pagination = new
            {
                currentPage = page,
                pageSize,
                totalPages = Math.Max(1, (int)Math.Ceiling(totalCount / (double)pageSize)),
                totalCount
            }
        };
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return null;

        return userId;
    }

    private IActionResult? EnsureAdmin()
    {
        var isAdminClaim = User.FindFirst("isAdmin")?.Value;
        var isAdmin = string.Equals(isAdminClaim, "true", StringComparison.OrdinalIgnoreCase);
        if (!isAdmin)
            return Forbid();

        return null;
    }
}
