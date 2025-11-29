# nutrifit

## Configuração do Ambiente

```powershell
# PostgreSQL
docker run -d --name nutrifit-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nutrifitdb -p 5432:5432 -v pgdata:/var/lib/postgresql/data postgres:16-alpine

# Redis
docker run -d --name nutrifit-redis -p 6379:6379 -v redisdata:/data redis:7-alpine redis-server --appendonly yes
```

## Como Renomear/Alterar Campos de Entidades do EF Core

**⚠️ IMPORTANTE**: Quando alterar campos em entidades do banco de dados, siga TODOS estes passos para evitar erros:

### 1. Identificar Todas as Ocorrências

Use `grep_search` ou busca global para encontrar TODAS as referências ao campo antigo:

```powershell
# Backend (C#)
grep -r "NomeCampoAntigo" backend/

# Frontend (TypeScript)
grep -r "nomeCampoAntigo" frontend/src/
```

### 2. Atualizar Backend (ordem CRÍTICA)

#### a) Entidade Principal
```csharp
// backend/Nutrifit.Repository/Entities/MinhaEntity.cs
public string? NovoCampo { get; set; }  // Era: AntígoCampo
```

#### b) Configuração do DbContext
```csharp
// backend/Nutrifit.Repository/NutrifitContext.cs
modelBuilder.Entity<MinhaEntity>()
    .Property(x => x.NovoCampo).HasMaxLength(500);
```

#### c) DTOs e Requests
```csharp
// backend/Nutrifit.Services/DTO/*.cs
public string? NovoCampo { get; set; }

// backend/Nutrifit.Services/ViewModel/Request/*.cs
public string? NovoCampo { get; set; }
```

#### d) Responses
```csharp
// backend/Nutrifit.Services/ViewModel/Response/*.cs
public string? NovoCampo { get; set; }
```

#### e) Services (TODOS os mapeamentos)
```csharp
// backend/Nutrifit.Services/Services/*.cs
// Busque por TODOS os lugares que fazem:
// - antigoCampo = entidade.AntigoCampo
// - entidade.AntigoCampo = request.AntigoCampo
// - NovoCampo = entidade.NovoCampo  ✅

// Use PowerShell para substituição em massa:
(Get-Content 'caminho/arquivo.cs') -replace 'AntigoCampo', 'NovoCampo' | Set-Content 'caminho/arquivo.cs'
```

### 3. Atualizar Frontend

```typescript
// frontend/src/types/*.ts
export interface MinhaInterface {
  novoCampo?: string;  // Era: antigoCampo
}

// Busque em TODAS as páginas e componentes:
// - frontend/src/pages/*.tsx
// - frontend/src/components/*.tsx
```

### 4. Criar Migration

```powershell
# Navegar para o diretório correto
Set-Location C:\caminho\backend\Nutrifit.Repository

# Criar migration
dotnet ef migrations add RenameAntigoCampoToNovoCampo --startup-project ..\Nutrifit.API

# Se der erro de build:
dotnet build  # Ver erros detalhados
```

### 5. Checklist de Validação

- [ ] Entidade atualizada
- [ ] NutrifitContext configuração atualizada
- [ ] DTOs atualizados (DTO, CreateRequest, UpdateRequest)
- [ ] Responses atualizados
- [ ] Services atualizados (TODOS os mapeamentos)
- [ ] Controllers verificados
- [ ] Frontend types atualizados
- [ ] Frontend components/pages atualizados
- [ ] Migration criada com sucesso
- [ ] Build sem erros (`dotnet build`)

### 6. Problemas Comuns

**Erro: "não contém uma definição para X"**
- Faltou atualizar algum Service, DTO ou Response
- Use busca global para encontrar TODAS as ocorrências

**Erro: "null value in column X violates not-null constraint"**
- Campo não foi renomeado corretamente na migration
- Verifique se o DbContext foi atualizado ANTES da migration

**Build failed sem erros claros**
- Execute `dotnet build` no projeto específico
- Verifique ponto-e-vírgula extras em propriedades C# (NÃO use `;` em properties)

### 7. Exemplo Completo: ImageUrl → VideoUrl

```powershell
# 1. Buscar todas ocorrências
grep -r "ImageUrl" backend/Nutrifit.Services/
grep -r "imageUrl" frontend/src/types/

# 2. Atualizar entidade
# ExerciseEntity.cs: ImageUrl → VideoUrl

# 3. Atualizar DbContext
# NutrifitContext.cs: Property(x => x.VideoUrl)

# 4. Atualizar DTOs, Requests, Responses
# ExerciseDto.cs, CreateExerciseRequest, etc.

# 5. Atualizar Services (substituição em massa)
(Get-Content 'Services/ExerciseService.cs') -replace 'ImageUrl = e\.ImageUrl', 'VideoUrl = e.VideoUrl' | Set-Content 'Services/ExerciseService.cs'

# 6. Atualizar frontend
# types/exercise.ts: imageUrl → videoUrl

# 7. Criar migration
Set-Location backend\Nutrifit.Repository
dotnet ef migrations add RenameImageUrlToVideoUrl --startup-project ..\Nutrifit.API
```
