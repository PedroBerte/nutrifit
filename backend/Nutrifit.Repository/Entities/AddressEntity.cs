namespace Nutrifit.Repository.Entities;

public class AddressEntity
{
    public Guid Id { get; set; }
    public string AddressLine { get; set; } = null!;
    public string? Number { get; set; }
    public string City { get; set; } = null!;
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string Country { get; set; } = null!;
    public int AddressType { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }
}
