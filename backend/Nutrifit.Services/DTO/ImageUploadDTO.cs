namespace Nutrifit.Services.DTO;

public class ImageUploadRequestDTO
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
}

public class ImageUploadResponseDTO
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ObjectName { get; set; } = string.Empty;
}
