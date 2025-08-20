namespace Nutrifit.Repository.Entities;

public class Address
{
    public Guid Id { get; set; }
    public string AddressLine { get; set; } = null!;
    public string? Number { get; set; }
    public string City { get; set; } = null!;
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string Country { get; set; } = null!;
    public int AddressType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; }
}
