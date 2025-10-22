# MinIO Storage Integration

Este documento explica como a integração com MinIO funciona no NutriFit.

## Visão Geral

MinIO é um servidor de armazenamento de objetos compatível com S3. Usamos para armazenar imagens de perfil e outras mídias do aplicativo.

## Arquitetura

### Backend

- **Service**: `StorageService` (`Nutrifit.Services/Services/StorageService.cs`)

  - Interface: `IStorageService`
  - Gerencia upload, exclusão e acesso a imagens
  - Validação de tipo e tamanho de arquivo
  - Geração de nomes únicos para evitar conflitos

- **Controller**: `StorageController` (`Nutrifit.API/Controllers/StorageController.cs`)
  - `POST /api/storage/upload`: Upload de imagem
  - `DELETE /api/storage/{objectName}`: Remove imagem
  - `GET /api/storage/presigned-url/{objectName}`: URL temporária

### Frontend

- **Service**: `storage.ts` (`frontend/src/services/api/storage.ts`)

  - Funções para comunicação com API de storage
  - TypeScript com tipagem completa

- **Component**: `PhotoUploader` (`frontend/src/components/photoUploader.tsx`)
  - Componente reutilizável para upload
  - Preview local imediato
  - Estados de loading e erro
  - Validação no cliente

## Configuração

### Desenvolvimento Local

1. **Iniciar MinIO standalone**:

```powershell
docker run -d --name minio `
  -p 9000:9000 -p 9001:9001 `
  -v ./data:/data `
  -e "MINIO_ROOT_USER=admin" `
  -e "MINIO_ROOT_PASSWORD=admin123" `
  quay.io/minio/minio server /data --console-address ":9001"
```

2. **Acessar console**: http://localhost:9001

   - User: `admin`
   - Password: `admin123`

3. **Configurar appsettings.json**:

```json
{
  "MinIO": {
    "Endpoint": "localhost:9000",
    "AccessKey": "admin",
    "SecretKey": "admin123",
    "BucketName": "nutrifit-images",
    "UseSSL": false
  }
}
```

### Docker Compose

O MinIO já está configurado no `docker-compose.yml`:

```yaml
minio:
  image: quay.io/minio/minio
  container_name: nutrifit_minio
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: admin
    MINIO_ROOT_PASSWORD: admin123
  ports:
    - "9000:9000" # API
    - "9001:9001" # Console
  volumes:
    - miniodata_nutrifit:/data
```

Basta rodar:

```powershell
docker-compose up -d
```

## Uso no Código

### Fluxo de Upload no Cadastro

O upload de imagem no fluxo de registro é feito **apenas no submit final** para evitar uploads desnecessários:

```tsx
// 1. PhotoUploader apenas seleciona e mostra preview
<PhotoUploader
  onFileSelect={(file) => {
    // Armazena arquivo no contexto
    setImageFile(file);
    // Mostra preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      form.setValue("image", reader.result as string);
    };
    reader.readAsDataURL(file);
  }}
/>;

// 2. Upload acontece apenas no handleSubmitAll
const handleSubmitAll = async () => {
  let imageUrl = "";

  if (selectedImageFile) {
    const uploadResponse = await uploadImage(selectedImageFile, "profiles");
    imageUrl = uploadResponse.url;
  }

  // Cria usuário com imageUrl
  const newUser: UserType = {
    // ...outros campos
    imageUrl: imageUrl || null,
  };
};
```

### Backend - Upload Genérico

```csharp
public class MyController : ControllerBase
{
    private readonly IStorageService _storageService;

    public MyController(IStorageService storageService)
    {
        _storageService = storageService;
    }

    [HttpPost("upload-post-image")]
    public async Task<IActionResult> UploadPostImage(IFormFile file, [FromQuery] string? customFileName = null)
    {
        using var stream = file.OpenReadStream();
        var result = await _storageService.UploadImageAsync(
            stream,
            file.FileName,
            file.ContentType,
            folder: "posts",
            customFileName: customFileName // Opcional: nome customizado
        );

        return Ok(new { imageUrl = result.Url });
    }
}
```

### Frontend - Upload com Nome Customizado

```````typescript
import { uploadImage } from "@/services/api/storage";

// Gera nome aleatório (GUID)
await uploadImage(file, "profiles");
// Resultado: profiles/uuid-random.jpg

// Usa nome customizado (ex: GUID do usuário)
await uploadImage(file, "profiles", userId);
// Resultado: profiles/{userId}.jpg

// Usa nome customizado para posts
await uploadImage(file, "posts", postId);
// Resultado: posts/{postId}.jpg
``````tsx
import PhotoUploader from "@/components/photoUploader";
import type { ImageUploadResponse } from "@/services/api/storage";

function MyComponent() {
  const [imageUrl, setImageUrl] = useState<string>("");

  return (
    <PhotoUploader
      folder="profiles"
      initialImageUrl={imageUrl}
      onUpload={(response: ImageUploadResponse) => {
        setImageUrl(response.url);
        // Salvar response.url no banco de dados
      }}
    />
  );
}
```````

### Frontend - Upload Direto (sem componente)

```typescript
import { uploadImage } from "@/services/api/storage";

async function handleFileUpload(file: File, entityId: string) {
  try {
    const response = await uploadImage(file, "posts", entityId);
    console.log("Image URL:", response.url);
    console.log("Object Name:", response.objectName);
    // objectName: posts/{entityId}.ext
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
```

## Validações

### Backend

- **Tipos permitidos**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Tamanho máximo**: 2MB
- **Verificação de content-type**

### Frontend

- Mesmas validações antes do upload
- Feedback visual imediato
- Estados de loading e erro

## Organização de Arquivos

Recomendado usar pastas (folders) para organizar:

- `profiles/` - Fotos de perfil
- `posts/` - Imagens de posts
- `documents/` - Documentos (credenciais)

```typescript
await uploadImage(file, "profiles"); // profiles/uuid.jpg
await uploadImage(file, "posts"); // posts/uuid.jpg
```

## URLs Públicas

Por padrão, o bucket é configurado com política pública para leitura:

```
http://localhost:9000/nutrifit-images/profiles/abc123.jpg
```

Em produção, configure um domínio customizado ou CloudFront.

## Segurança

### Desenvolvimento

- Credenciais simples (admin/admin123)
- SSL desabilitado

### Produção

- **Sempre use SSL** (`UseSSL: true`)
- Credenciais fortes
- Considere bucket privado + presigned URLs para conteúdo sensível
- Configure CORS adequado

## Troubleshooting

### Erro: "Bucket não encontrado"

O bucket é criado automaticamente no primeiro acesso. Se não funcionar:

1. Acesse console MinIO (http://localhost:9001)
2. Crie bucket manualmente: `nutrifit-images`
3. Configure política pública (no console)

### Erro: "Conexão recusada"

Verifique se MinIO está rodando:

```powershell
docker ps | findstr minio
```

### Imagens não carregam no frontend

Verifique CORS do MinIO ou política do bucket.

## Extensões Futuras

- [ ] Suporte para vídeos
- [ ] Redimensionamento automático de imagens
- [ ] Compressão de imagens
- [ ] CDN para servir conteúdo estático
- [ ] Backup automático para S3
