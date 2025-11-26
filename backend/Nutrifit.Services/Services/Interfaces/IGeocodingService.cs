namespace Nutrifit.Services.Services.Interfaces;

public interface IGeocodingService
{
    Task<(double? latitude, double? longitude)> GetCoordinatesAsync(string zipCode, string city, string? state, string country);
}
