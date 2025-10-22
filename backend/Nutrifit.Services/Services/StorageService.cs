using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services;

public class StorageService : IStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;
    private readonly ILogger<StorageService> _logger;
    private readonly bool _useSSL;
    private readonly string _endpoint;

    public StorageService(IConfiguration configuration, ILogger<StorageService> logger)
    {
        _logger = logger;
        _endpoint = configuration["MinIO:Endpoint"] ?? throw new ArgumentNullException("MinIO:Endpoint");
        var accessKey = configuration["MinIO:AccessKey"] ?? throw new ArgumentNullException("MinIO:AccessKey");
        var secretKey = configuration["MinIO:SecretKey"] ?? throw new ArgumentNullException("MinIO:SecretKey");
        _bucketName = configuration["MinIO:BucketName"] ?? throw new ArgumentNullException("MinIO:BucketName");
        _useSSL = bool.Parse(configuration["MinIO:UseSSL"] ?? "false");

        _minioClient = new MinioClient()
            .WithEndpoint(_endpoint)
            .WithCredentials(accessKey, secretKey)
            .WithSSL(_useSSL)
            .Build();

        EnsureBucketExistsAsync().GetAwaiter().GetResult();
    }

    private async Task EnsureBucketExistsAsync()
    {
        try
        {
            var beArgs = new BucketExistsArgs().WithBucket(_bucketName);
            bool found = await _minioClient.BucketExistsAsync(beArgs);

            if (!found)
            {
                var mbArgs = new MakeBucketArgs().WithBucket(_bucketName);
                await _minioClient.MakeBucketAsync(mbArgs);
                _logger.LogInformation("Bucket {BucketName} criado com sucesso", _bucketName);

                // Definir política pública para leitura das imagens
                var policy = $$"""
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": ["*"]},
                            "Action": ["s3:GetObject"],
                            "Resource": ["arn:aws:s3:::{{_bucketName}}/*"]
                        }
                    ]
                }
                """;

                var policyArgs = new SetPolicyArgs()
                    .WithBucket(_bucketName)
                    .WithPolicy(policy);

                await _minioClient.SetPolicyAsync(policyArgs);
                _logger.LogInformation("Política pública configurada para bucket {BucketName}", _bucketName);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar/criar bucket {BucketName}", _bucketName);
            throw;
        }
    }

    public async Task<ImageUploadResponseDTO> UploadImageAsync(
        Stream stream,
        string fileName,
        string contentType,
        string? folder = null,
        string? customFileName = null)
    {
        try
        {
            // Validar tipo de arquivo
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(contentType.ToLower()))
            {
                throw new ArgumentException($"Tipo de arquivo não permitido. Apenas {string.Join(", ", allowedTypes)} são aceitos.");
            }

            // Validar tamanho (máx 2MB)
            if (stream.Length > 2 * 1024 * 1024)
            {
                throw new ArgumentException("Arquivo muito grande. Tamanho máximo: 2MB");
            }

            // Gerar nome para o arquivo
            var extension = Path.GetExtension(fileName);
            var uniqueFileName = string.IsNullOrEmpty(customFileName)
                ? $"{Guid.NewGuid()}{extension}"
                : $"{customFileName}{extension}";

            var objectName = string.IsNullOrEmpty(folder)
                ? uniqueFileName
                : $"{folder}/{uniqueFileName}";

            // Reset stream position
            stream.Position = 0;

            // Fazer upload
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(stream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(putObjectArgs);

            // Construir URL pública
            var protocol = _useSSL ? "https" : "http";
            var publicUrl = $"{protocol}://{_endpoint}/{_bucketName}/{objectName}";

            _logger.LogInformation("Imagem {FileName} enviada com sucesso como {ObjectName}", fileName, objectName);

            return new ImageUploadResponseDTO
            {
                Url = publicUrl,
                FileName = fileName,
                ObjectName = objectName
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao fazer upload da imagem {FileName}", fileName);
            throw;
        }
    }

    public async Task DeleteImageAsync(string objectName)
    {
        try
        {
            var removeArgs = new RemoveObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName);

            await _minioClient.RemoveObjectAsync(removeArgs);
            _logger.LogInformation("Imagem {ObjectName} removida com sucesso", objectName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao remover imagem {ObjectName}", objectName);
            throw;
        }
    }

    public async Task<string> GetPresignedUrlAsync(string objectName, int expiryInSeconds = 3600)
    {
        try
        {
            var args = new PresignedGetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName)
                .WithExpiry(expiryInSeconds);

            var url = await _minioClient.PresignedGetObjectAsync(args);
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar URL pré-assinada para {ObjectName}", objectName);
            throw;
        }
    }

    public async Task<bool> ImageExistsAsync(string objectName)
    {
        try
        {
            var args = new StatObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectName);

            await _minioClient.StatObjectAsync(args);
            return true;
        }
        catch (Exception)
        {
            return false;
        }
    }
}
