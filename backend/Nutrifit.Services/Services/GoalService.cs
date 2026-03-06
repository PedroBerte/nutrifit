using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Services.Interfaces;
using Nutrifit.Services.ViewModel.Request;
using Nutrifit.Services.ViewModel.Response;

namespace Nutrifit.Services.Services;

public class GoalService : IGoalService
{
    private readonly NutrifitContext _context;

    public GoalService(NutrifitContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse> GetWeeklyGoalAsync(Guid userId)
    {
        var goal = await _context.WeeklyGoals.FirstOrDefaultAsync(x => x.UserId == userId);
        if (goal == null)
            return ApiResponse.CreateFailure("Meta semanal não encontrada.");

        var response = new WeeklyGoalResponse
        {
            Id = goal.Id,
            UserId = goal.UserId,
            GoalDays = goal.GoalDays,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt
        };

        return ApiResponse.CreateSuccess("Meta semanal encontrada.", response);
    }

    public async Task<ApiResponse> UpsertWeeklyGoalAsync(Guid userId, UpsertWeeklyGoalRequest request)
    {
        if (request.GoalDays < 1 || request.GoalDays > 7)
            return ApiResponse.CreateFailure("goalDays deve estar entre 1 e 7.");

        var goal = await _context.WeeklyGoals.FirstOrDefaultAsync(x => x.UserId == userId);
        if (goal == null)
        {
            goal = new WeeklyGoalEntity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                GoalDays = request.GoalDays,
                CreatedAt = DateTime.UtcNow
            };

            _context.WeeklyGoals.Add(goal);
        }
        else
        {
            goal.GoalDays = request.GoalDays;
            goal.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var response = new WeeklyGoalResponse
        {
            Id = goal.Id,
            UserId = goal.UserId,
            GoalDays = goal.GoalDays,
            CreatedAt = goal.CreatedAt,
            UpdatedAt = goal.UpdatedAt
        };

        return ApiResponse.CreateSuccess("Meta semanal salva com sucesso.", response);
    }

    public async Task<ApiResponse> GetWeeklyProgressAsync(Guid userId)
    {
        var goal = await _context.WeeklyGoals.FirstOrDefaultAsync(x => x.UserId == userId);
        if (goal == null)
            return ApiResponse.CreateFailure("Meta semanal não encontrada.");

        var now = DateTime.UtcNow;
        var dayOffset = ((int)now.DayOfWeek + 6) % 7;
        var weekStart = now.Date.AddDays(-dayOffset);
        var weekEnd = weekStart.AddDays(7);

        var proDates = await _context.WorkoutSessions
            .Where(x => x.CustomerId == userId
                && x.Status == "C"
                && x.CompletedAt.HasValue
                && x.CompletedAt.Value >= weekStart
                && x.CompletedAt.Value < weekEnd)
            .Select(x => x.CompletedAt!.Value.Date)
            .ToListAsync();

        var selfManagedDates = await _context.SelfManagedWorkoutSessions
            .Where(x => x.UserId == userId
                && x.Status == "C"
                && x.CompletedAt.HasValue
                && x.CompletedAt.Value >= weekStart
                && x.CompletedAt.Value < weekEnd)
            .Select(x => x.CompletedAt!.Value.Date)
            .ToListAsync();

        var trainedDates = proDates
            .Concat(selfManagedDates)
            .Distinct()
            .OrderBy(x => x)
            .ToList();

        var completedDays = trainedDates.Count;
        var percentage = goal.GoalDays > 0
            ? Math.Round((double)completedDays / goal.GoalDays * 100, 2)
            : 0;

        var response = new WeeklyGoalProgressResponse
        {
            GoalDays = goal.GoalDays,
            CompletedDays = completedDays,
            Percentage = percentage,
            TrainedDates = trainedDates.Select(x => x.ToString("yyyy-MM-dd")).ToList()
        };

        return ApiResponse.CreateSuccess("Progresso semanal calculado com sucesso.", response);
    }
}
