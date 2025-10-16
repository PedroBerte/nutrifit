using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
    private readonly IStorageService _storageService;
    private readonly ILogger<StorageController> _logger;

    public StorageController(IStorageService storageService, ILogger<StorageController> logger)
    {
        _storageService = storageService;
        _logger = logger;
    }

    /// <summary>
    /// Faz upload de uma imagem
    /// </summary>
    /// <param name="file">Arquivo de imagem</param>
    /// <param name="folder">Pasta opcional para organizar (ex: "profiles", "posts")</param>
    /// <param name="customFileName">Nome customizado para o arquivo (sem extensão). Se não fornecido, gera um GUID aleatório</param>
    /// <returns>URL da imagem</returns>
    [HttpPost("upload")]
    [Authorize]
    [RequestSizeLimit(2 * 1024 * 1024)] // 2MB
    public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string? folder = null, [FromQuery] string? customFileName = null)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Nenhum arquivo foi enviado" });
            }

            // Validar extensão do arquivo
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    message = $"Extensão de arquivo não permitida. Use: {string.Join(", ", allowedExtensions)}"
                });
            }

            using var stream = file.OpenReadStream();
            var result = await _storageService.UploadImageAsync(
                stream,
                file.FileName,
                file.ContentType,
                folder,
                customFileName
            );

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Erro de validação no upload: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer upload de imagem");
            return StatusCode(500, new { message = "Erro ao fazer upload da imagem" });
        }
    }

    /// <summary>
    /// Remove uma imagem do storage
    /// </summary>
    /// <param name="objectName">Nome do objeto no storage</param>
    [HttpDelete("{objectName}")]
    [Authorize]
    public async Task<IActionResult> DeleteImage(string objectName)
    {
        try
        {
            // Decodificar o objectName caso venha com encoding de URL
            objectName = Uri.UnescapeDataString(objectName);

            var exists = await _storageService.ImageExistsAsync(objectName);
            if (!exists)
            {
                return NotFound(new { message = "Imagem não encontrada" });
            }

            await _storageService.DeleteImageAsync(objectName);
            return Ok(new { message = "Imagem removida com sucesso" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao remover imagem {ObjectName}", objectName);
            return StatusCode(500, new { message = "Erro ao remover imagem" });
        }
    }

    /// <summary>
    /// Obtém URL temporária para acesso a uma imagem
    /// </summary>
    /// <param name="objectName">Nome do objeto no storage</param>
    /// <param name="expiryInSeconds">Tempo de expiração em segundos (padrão: 3600)</param>
    [HttpGet("presigned-url/{objectName}")]
    [Authorize]
    public async Task<IActionResult> GetPresignedUrl(string objectName, [FromQuery] int expiryInSeconds = 3600)
    {
        try
        {
            objectName = Uri.UnescapeDataString(objectName);

            var exists = await _storageService.ImageExistsAsync(objectName);
            if (!exists)
            {
                return NotFound(new { message = "Imagem não encontrada" });
            }

            var url = await _storageService.GetPresignedUrlAsync(objectName, expiryInSeconds);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar URL pré-assinada para {ObjectName}", objectName);
            return StatusCode(500, new { message = "Erro ao gerar URL" });
        }
    }
}
