using Nutrifit.Services.Services.Interfaces;
using System.Text.Json;

namespace Nutrifit.Services.Services;

public class GeocodingService : IGeocodingService
{
    private readonly HttpClient _httpClient;
    private static readonly SemaphoreSlim _rateLimiter = new(1, 1);
    private static DateTime _lastRequestTime = DateTime.MinValue;

    public GeocodingService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("Nominatim");
    }

    public async Task<(double? latitude, double? longitude)> GetCoordinatesAsync(
        string zipCode, 
        string city, 
        string? state, 
        string country)
    {
        try
        {
            // Rate limiting: 1 request per second
            await _rateLimiter.WaitAsync();
            try
            {
                var elapsed = DateTime.UtcNow - _lastRequestTime;
                if (elapsed.TotalSeconds < 1)
                {
                    await Task.Delay(TimeSpan.FromSeconds(1) - elapsed);
                }
                _lastRequestTime = DateTime.UtcNow;
            }
            finally
            {
                _rateLimiter.Release();
            }

            // Construir query para Nominatim
            var query = $"{zipCode}, {city}";
            if (!string.IsNullOrEmpty(state))
                query += $", {state}";
            query += $", {country}";

            var url = $"https://nominatim.openstreetmap.org/search?format=json&q={Uri.EscapeDataString(query)}&limit=1";

            var response = await _httpClient.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
                return (null, null);

            var content = await response.Content.ReadAsStringAsync();
            var results = JsonSerializer.Deserialize<List<NominatimResponse>>(content);

            if (results == null || results.Count == 0)
                return (null, null);

            var result = results[0];
            
            if (double.TryParse(result.lat, out var latitude) && 
                double.TryParse(result.lon, out var longitude))
            {
                return (latitude, longitude);
            }

            return (null, null);
        }
        catch (Exception ex)
        {
            // Log error but don't throw - geocoding failure shouldn't block address creation
            Console.WriteLine($"Geocoding error: {ex.Message}");
            return (null, null);
        }
    }

    private class NominatimResponse
    {
        public string lat { get; set; } = string.Empty;
        public string lon { get; set; } = string.Empty;
    }
}
