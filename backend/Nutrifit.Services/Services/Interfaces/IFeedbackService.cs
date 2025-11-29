using Nutrifit.Services.DTO;

namespace Nutrifit.Services.Services.Interfaces;

public interface IFeedbackService
{
    Task<FeedbackResponse> CreateFeedbackAsync(CreateFeedbackRequest request);
    Task<List<FeedbackResponse>> GetProfessionalFeedbacksAsync(Guid professionalId);
    Task<FeedbackResponse?> GetFeedbackByBondAsync(Guid customerId, Guid professionalId);
}
