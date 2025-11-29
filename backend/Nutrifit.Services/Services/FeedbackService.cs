using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class FeedbackService : IFeedbackService
{
    private readonly NutrifitContext _context;
    private readonly IPushService _pushService;

    public FeedbackService(NutrifitContext context, IPushService pushService)
    {
        _context = context;
        _pushService = pushService;
    }

    public async Task<FeedbackResponse> CreateFeedbackAsync(CreateFeedbackRequest request)
    {
        // Check if feedback already exists
        var existingFeedback = await _context.CustomerFeedbacks
            .FirstOrDefaultAsync(f => f.CustomerId == request.CustomerId && f.ProfessionalId == request.ProfessionalId);

        CustomerFeedbackEntity feedback;

        if (existingFeedback != null)
        {
            // Update existing feedback
            existingFeedback.Rate = request.Rate;
            existingFeedback.Testimony = request.Testimony;
            existingFeedback.UpdatedAt = DateTime.UtcNow;
            existingFeedback.Status = "A";
            feedback = existingFeedback;
        }
        else
        {
            // Create new feedback
            feedback = new CustomerFeedbackEntity
            {
                Id = Guid.NewGuid(),
                ProfessionalId = request.ProfessionalId,
                CustomerId = request.CustomerId,
                Rate = request.Rate,
                Testimony = request.Testimony,
                Type = 1, // Customer to Professional
                Status = "A",
                CreatedAt = DateTime.UtcNow
            };

            _context.CustomerFeedbacks.Add(feedback);
        }

        await _context.SaveChangesAsync();

        // Load navigation properties
        await _context.Entry(feedback)
            .Reference(f => f.Professional)
            .LoadAsync();

        await _context.Entry(feedback)
            .Reference(f => f.Customer)
            .LoadAsync();

        // Send push notification to professional
        try
        {
            var customer = await _context.Users.FindAsync(request.CustomerId);
            var stars = new string('⭐', request.Rate);
            
            await _pushService.SendToUserAsync(
                request.ProfessionalId,
                new
                {
                    title = "Nova Avaliação Recebida!",
                    body = $"{customer?.Name} avaliou você com {stars}",
                    data = new
                    {
                        type = "feedback",
                        feedbackId = feedback.Id.ToString()
                    }
                }
            );
        }
        catch (Exception ex)
        {
            // Log error but don't fail the request
            Console.WriteLine($"Failed to send push notification: {ex.Message}");
        }

        return new FeedbackResponse
        {
            Id = feedback.Id,
            ProfessionalId = feedback.ProfessionalId,
            CustomerId = feedback.CustomerId,
            ProfessionalName = feedback.Professional.Name,
            CustomerName = feedback.Customer.Name,
            ProfessionalImageUrl = feedback.Professional.ImageUrl,
            CustomerImageUrl = feedback.Customer.ImageUrl,
            Rate = feedback.Rate,
            Testimony = feedback.Testimony,
            Status = feedback.Status,
            CreatedAt = feedback.CreatedAt,
            UpdatedAt = feedback.UpdatedAt
        };
    }

    public async Task<List<FeedbackResponse>> GetProfessionalFeedbacksAsync(Guid professionalId)
    {
        var feedbacks = await _context.CustomerFeedbacks
            .Include(f => f.Professional)
            .Include(f => f.Customer)
            .Where(f => f.ProfessionalId == professionalId && f.Status == "A")
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        return feedbacks.Select(f => new FeedbackResponse
        {
            Id = f.Id,
            ProfessionalId = f.ProfessionalId,
            CustomerId = f.CustomerId,
            ProfessionalName = f.Professional.Name,
            CustomerName = f.Customer.Name,
            ProfessionalImageUrl = f.Professional.ImageUrl,
            CustomerImageUrl = f.Customer.ImageUrl,
            Rate = f.Rate,
            Testimony = f.Testimony,
            Status = f.Status,
            CreatedAt = f.CreatedAt,
            UpdatedAt = f.UpdatedAt
        }).ToList();
    }

    public async Task<FeedbackResponse?> GetFeedbackByBondAsync(Guid customerId, Guid professionalId)
    {
        var feedback = await _context.CustomerFeedbacks
            .Include(f => f.Professional)
            .Include(f => f.Customer)
            .FirstOrDefaultAsync(f => f.CustomerId == customerId && f.ProfessionalId == professionalId);

        if (feedback == null)
            return null;

        return new FeedbackResponse
        {
            Id = feedback.Id,
            ProfessionalId = feedback.ProfessionalId,
            CustomerId = feedback.CustomerId,
            ProfessionalName = feedback.Professional.Name,
            CustomerName = feedback.Customer.Name,
            ProfessionalImageUrl = feedback.Professional.ImageUrl,
            CustomerImageUrl = feedback.Customer.ImageUrl,
            Rate = feedback.Rate,
            Testimony = feedback.Testimony,
            Status = feedback.Status,
            CreatedAt = feedback.CreatedAt,
            UpdatedAt = feedback.UpdatedAt
        };
    }
}
