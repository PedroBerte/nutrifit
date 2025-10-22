using Nutrifit.Services.DTO;

namespace Nutrifit.Services.Services.Interfaces;

public interface IStorageService
{
    /// <summary>
    /// Faz upload de uma imagem para o storage
    /// </summary>
    /// <param name="stream">Stream do arquivo</param>
    /// <param name="fileName">Nome original do arquivo</param>
    /// <param name="contentType">Tipo MIME do arquivo</param>
    /// <param name="folder">Pasta opcional para organizar as imagens (ex: "profiles", "posts")</param>
    /// <param name="customFileName">Nome customizado para o arquivo (sem extensão). Se não fornecido, gera um GUID aleatório</param>
    /// <returns>URL pública da imagem</returns>
    Task<ImageUploadResponseDTO> UploadImageAsync(Stream stream, string fileName, string contentType, string? folder = null, string? customFileName = null);

    /// <summary>
    /// Remove uma imagem do storage
    /// </summary>
    /// <param name="objectName">Nome do objeto no storage</param>
    Task DeleteImageAsync(string objectName);

    /// <summary>
    /// Obtém URL temporária de acesso a uma imagem privada
    /// </summary>
    /// <param name="objectName">Nome do objeto no storage</param>
    /// <param name="expiryInSeconds">Tempo de expiração em segundos</param>
    /// <returns>URL temporária</returns>
    Task<string> GetPresignedUrlAsync(string objectName, int expiryInSeconds = 3600);

    /// <summary>
    /// Verifica se uma imagem existe no storage
    /// </summary>
    /// <param name="objectName">Nome do objeto no storage</param>
    Task<bool> ImageExistsAsync(string objectName);
}
