# Prompt: Migrar backend Node.js → .NET (features faltantes)

## Contexto
O projeto NutriFit tem dois backends: um em .NET 8 (ASP.NET Core) e um em Node.js (Express + Prisma).
O frontend React foi desenvolvido apontando para o Node.js. Agora vamos **abandonar o Node.js e usar apenas o .NET**.

O .NET já tem a maioria das features. Este prompt descreve o que está **faltando ou diferente** e deve ser implementado.

---

## 1. ALINHAMENTO DE ROTAS (CRÍTICO)

O frontend usa os padrões de URL do Node. O .NET usa padrões diferentes. Adapte aos padroes .NET

| Frontend chama (Node pattern) | .NET atual | Ação |
|---|---|---|
| `POST /auth/magic-link/send` | `POST /authentication/sendAccessEmail` |arrumar |
| `POST /auth/magic-link/validate` | `POST /authentication/ValidateSession` |arrumar |
| `GET /users` | `GET /user` |arrumar |
| `POST /users` | `POST /user` |arrumar |
| `GET /users/:id` | `GET /user/:id` |arrumar |
| `PUT /users/:id` | `PUT /user/:id` |arrumar |
| `DELETE /users/:id` | `DELETE /user/:id` |arrumar |
| `GET /users/:id/feedbacks` | `GET /user/:id/feedbacks` |arrumar |
| `POST /users/geocode-addresses` | `POST /user/geocode-addresses` |arrumar |
| `GET /bonds` | `GET /bond` |arrumar |
| `POST /bonds` | `POST /bond` |arrumar |
| `GET /bonds/sent` | `GET /bond/sent` |arrumar |
| `GET /bonds/received` | `GET /bond/received` |arrumar |
| `GET /bonds/as-customer` | `GET /bond/as-customer` |arrumar |
| `GET /bonds/as-professional` | `GET /bond/as-professional` |arrumar |
| `GET /bonds/my-bonds` | `GET /bond/my-bonds` |arrumar |
| `GET /bonds/active-students` | `GET /bond/active-students` |arrumar |
| `GET /bonds/:id` | `GET /bond/:id` |arrumar |
| `PUT /bonds/:id` | `PUT /bond/:id` |arrumar |
| `DELETE /bonds/:id` | `DELETE /bond/:id` |arrumar |
| `GET /appointments` | `GET /appointment` |arrumar |
| `POST /appointments` | `POST /appointment` |arrumar |
| `PUT /appointments/:id` | `PUT /appointment/:id` |arrumar |
| `DELETE /appointments/:id` | `DELETE /appointment/:id` |arrumar |
| `GET /appointments/customer/pending` | `GET /appointment/customer/pending` |arrumar |
| `GET /appointments/customer/all` | `GET /appointment/customer/all` |arrumar |
| `GET /appointments/professional/all` | `GET /appointment/professional/all` |arrumar |
| `GET /exercises` | `GET /exercise` |arrumar |
| `POST /exercises` | `POST /exercise` |arrumar |
| `GET /exercises/search` | `GET /exercise/search` |arrumar |
| `GET /exercises/categories` | `GET /exercise/categories` |arrumar |
| `GET /exercises/muscle-groups` | `GET /exercise/muscle-groups` |arrumar |
| `GET /exercises/my-exercises` | `GET /exercise/my-exercises` |arrumar |
| `GET /exercises/:id` | `GET /exercise/:id` |arrumar |
| `PUT /exercises/:id` | `PUT /exercise/:id` |arrumar |
| `PATCH /exercises/:id/media` | `PATCH /exercise/:id/media` |arrumar |
| `DELETE /exercises/:id` | `DELETE /exercise/:id` |arrumar |
| `GET /routines` | `GET /routine` |arrumar |
| `POST /routines` | `POST /routine` |arrumar |
| `GET /routines/near-expiry` | `GET /routine/near-expiry` |arrumar |
| `GET /routines/my-routines` | `GET /routine/my-routines` |arrumar |
| `GET /routines/my-assigned-routines` | `GET /routine/my-assigned-routines` |arrumar |
| `GET /routines/customer/:id` | `GET /routine/customer/:id` |arrumar |
| `GET /routines/:id` | `GET /routine/:id` |arrumar |
| `PUT /routines/:id` | `PUT /routine/:id` |arrumar |
| `DELETE /routines/:id` | `DELETE /routine/:id` |arrumar |
| `POST /routines/assign` | `POST /routine/assign` |arrumar |
| `DELETE /routines/:id/customer/:cid` | `DELETE /routine/:id/customer/:cid` |arrumar |
| `PUT /routines/:id/customer/:cid/expiry` | `PUT /routine/:id/customer/:cid/expiry` |arrumar |
| `GET /workout-templates/routine/:id` | `GET /workouttemplate/routine/:id` |arrumar |
| `POST /workout-templates/routine/:id` | `POST /workouttemplate/routine/:id` |arrumar |
| `GET /workout-templates/:id` | `GET /workouttemplate/:id` |arrumar |
| `PUT /workout-templates/:id` | `PUT /workouttemplate/:id` |arrumar |
| `DELETE /workout-templates/:id` | `DELETE /workouttemplate/:id` |arrumar |
| `POST /workout-templates/:id/exercises` | `POST /workouttemplate/:id/exercises` |arrumar |
| `PUT /workout-templates/exercise/:id` | `PUT /workouttemplate/exercise/:id` |arrumar |
| `DELETE /workout-templates/exercise/:id` | `DELETE /workouttemplate/exercise/:id` |arrumar |
| `PUT /workout-templates/:id/reorder` | `PUT /workouttemplate/:id/reorder` |arrumar |
| `POST /workout-sessions/complete` | `POST /workoutsession/complete` |arrumar |
| `GET /workout-sessions/history` | `GET /workoutsession/history` |arrumar |
| `GET /workout-sessions/:id` | `GET /workoutsession/:id` |arrumar |
| `GET /workout-sessions/customer/:id` | `GET /workoutsession/customer/:id` |arrumar |
| `GET /workout-sessions/exercise/:id/previous` | `GET /workoutsession/exercise/:id/previous` |arrumar |
| `GET /workout-sessions/exercise/:id/history` | `GET /workoutsession/exercise/:id/history` |arrumar |
| `GET /favorites` | `GET /favorite` |arrumar |
| `POST /favorites` | `POST /favorite` |arrumar |
| `DELETE /favorites/:id` | `DELETE /favorite/:id` |arrumar |
| `GET /favorites/check/:id` | `GET /favorite/check/:id` |arrumar |
| `POST /feedbacks` | `POST /feedback` |arrumar |
| `GET /feedbacks` | `GET /feedback` |arrumar |

---

## 2. MAGIC LINK — AUTO-PROVISIONING (FALTANDO NO .NET)

No Node.js, quando o usuário envia um magic link para um e-mail desconhecido, o backend **cria automaticamente um usuário** com perfil Student. Isso permite que o frontend redirecione para o fluxo de primeiro acesso.

### Implementar em `AuthenticationService.cs` (ou `SendAccessEmail`):

```
Ao receber POST /auth/magic-link/send com { email }:
  1. Buscar usuário pelo email no banco
  2. Se NÃO existir:
     a. Criar usuário com:
        - name: parte do email antes do "@"
        - email: email normalizado (lowercase, trim)
        - profileId: ID do perfil "Student"
        - status: "A"
        - phoneNumber: ""
        - sex: ""
        - sem endereço (addressId = null)
     b. Usar o ID do usuário recém-criado para o magic link
  3. Se existir: usar o usuário existente normalmente
  4. Gerar token, armazenar no Redis com TTL de 15 minutos
  5. Enviar email com link
```

---

## 3. CLAIM `firstAccess` NO JWT (FALTANDO NO .NET)

Ao validar o magic link (`POST /auth/magic-link/validate`), o JWT retornado deve incluir a claim `firstAccess`.

```
firstAccess = true  quando o usuário NÃO tem endereço (addressId == null)
firstAccess = false quando o usuário JÁ tem endereço
```

O frontend usa essa claim para decidir se redireciona para `/first-access` (formulário de cadastro) ou para `/home`.

### Implementar em `AuthenticationService.cs`:

No método `ValidateSession` que gera o JWT, adicionar ao payload:
```csharp
claims.Add(new Claim("firstAccess", (user.AddressId == null).ToString().ToLower()));
```

---

## 4. MÓDULO SELF-MANAGED (INTEIRAMENTE AUSENTE NO .NET)

Este módulo permite que usuários com perfil `SELF_MANAGED` criem e gerenciem seus próprios treinos sem um personal trainer.

### 4.1 Entidades necessárias

Adicionar migrations EF Core para as seguintes entidades (se não existirem):

**WeeklyGoalEntity** (tabela: `WeeklyGoals`):
```
Id (Guid, PK)
UserId (Guid, FK → Users)
GoalDays (int) — quantidade de dias por semana que o usuário quer treinar
CreatedAt (DateTime)
UpdatedAt (DateTime)
```

**SelfManagedWorkoutTemplateEntity** (tabela: `SelfManagedWorkoutTemplates`):
```
Id (Guid, PK)
UserId (Guid, FK → Users)
Title (string)
Description (string, nullable)
EstimatedDurationMinutes (int, nullable)
Order (int)
Status (string) — "A" ativo, "I" inativo
CreatedAt (DateTime)
UpdatedAt (DateTime)
Exercises → lista de SelfManagedExerciseTemplateEntity
```

**SelfManagedExerciseTemplateEntity** (tabela: `SelfManagedExerciseTemplates`):
```
Id (Guid, PK)
WorkoutTemplateId (Guid, FK → SelfManagedWorkoutTemplates)
ExerciseId (Guid, FK → Exercises, nullable) — null para exercícios livres
ExerciseName (string) — nome cached
Order (int)
TargetSets (int)
TargetRepsMin (int, nullable)
TargetRepsMax (int, nullable)
SuggestedLoad (decimal, nullable)
RestSeconds (int, nullable)
Notes (string, nullable)
SetType (string) — "Reps", "Time", "Distance"
WeightUnit (string) — "kg", "lbs"
CreatedAt (DateTime)
```

**SelfManagedWorkoutSessionEntity** (tabela: `SelfManagedWorkoutSessions`):
```
Id (Guid, PK)
UserId (Guid, FK → Users)
WorkoutTemplateId (Guid, FK → SelfManagedWorkoutTemplates, nullable)
Title (string) — nome do treino
Status (string) — "IP" (in progress), "C" (completed), "CA" (cancelled)
StartedAt (DateTime)
CompletedAt (DateTime, nullable)
DurationMinutes (int, nullable)
TotalVolume (decimal, nullable)
Notes (string, nullable)
CreatedAt (DateTime)
```

### 4.2 Endpoints a implementar

**Weekly Goals** — novo controller `GoalsController` ou adicionar em `SelfManagedController`:

```
GET  /goals/weekly
     → Retorna o WeeklyGoal do usuário autenticado
     → Response: { id, userId, goalDays, createdAt, updatedAt }
     → Se não existir, retornar 404

PUT  /goals/weekly
     → Body: { goalDays: number (1-7) }
     → Cria ou atualiza o WeeklyGoal do usuário
     → Response: WeeklyGoal criado/atualizado

GET  /goals/weekly/progress
     → Calcula quantos dias na semana atual (Seg-Dom) o usuário treinou
     → Conta WorkoutSessions com status "C" na semana atual
       (incluindo tanto SelfManagedWorkoutSessions quanto WorkoutSessionEntity)
     → Response: {
         goalDays: number,      // meta semanal
         completedDays: number, // dias treinados esta semana
         percentage: number,    // completedDays/goalDays * 100
         trainedDates: string[] // datas ISO dos dias treinados
       }
```

**Self-Managed Workout Templates** — controller `SelfManagedWorkoutController`:

```
GET  /workouts/templates
     → Lista todos os templates do usuário autenticado (status = "A")
     → Response: array de WorkoutTemplateResponse (mesmo formato do pro)

POST /workouts/templates
     → Body: { title, description?, estimatedDurationMinutes?, order, exerciseTemplates?: [...] }
     → Cria template para o usuário autenticado
     → Response: { id }

GET  /workouts/templates/:workoutId
     → Retorna template com exercícios
     → Apenas se pertencer ao usuário autenticado

PUT  /workouts/templates/:workoutId
     → Body: { title?, description?, estimatedDurationMinutes?, order? }
     → Atualiza template

DELETE /workouts/templates/:workoutId
       → Soft delete (status = "I")
```

**Self-Managed Workout Sessions** — adicionar em `SelfManagedWorkoutController`:

```
GET  /workouts/sessions
     → Lista sessões do usuário (paginado, page + pageSize query params)
     → Response: { items: [...], totalItems, currentPage, pageSize, totalPages }

POST /workouts/sessions
     → Body: { workoutTemplateId?: string, title: string }
     → Cria sessão com status "IP" (in progress), startedAt = now
     → Response: { sessionId }

GET  /workouts/sessions/:sessionId
     → Retorna detalhes da sessão
     → Apenas se pertencer ao usuário autenticado

POST /workouts/sessions/:sessionId/finish
     → Body: { totalVolume?, notes?, durationMinutes? }
     → Marca sessão como "C" (completed), completedAt = now
     → Response: sessão atualizada
```

---

## 5. PRO-SESSIONS — SESSÕES COM ACOMPANHAMENTO (PARCIALMENTE DIFERENTE)

O Node tem um fluxo de start → in-progress → finish para sessões de treinos profissionais.
O .NET tem apenas `POST /workoutsession/complete` (one-shot).

Adicionar ao `WorkoutSessionController`:

```
POST /workout-sessions/start
     → Body: { workoutTemplateId: string }
     → Cria WorkoutSessionEntity com status "IP", startedAt = now
     → Response: { sessionId }

POST /workout-sessions/:sessionId/finish
     → Body: mesmo formato do /complete (exercícios, sets, ratings, etc.)
     → Finaliza a sessão em andamento
     → Status = "C", completedAt = now
```

> O endpoint `/workout-sessions/complete` existente pode permanecer para compatibilidade retroativa.

---

## 6. ENDPOINT DE SAÚDE

Adicionar endpoint básico de health check:

```
GET /health
→ Response: { status: "ok", timestamp: ISO date }
→ Sem autenticação requerida
```

---

## 7. ATUALIZAÇÃO DE ENDEREÇO NO PUT /user/:id

Atualmente o `PUT /user/:id` não suporta atualização de endereço.
O fluxo de primeiro acesso no frontend cria o usuário via `POST /users` mas como o usuário já existe (auto-provisionado), precisa atualizar via PUT.

Atualizar `PUT /user/:id` para também aceitar e processar o objeto `address`:

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "profileId": "...",
  "phoneNumber": "11999999999",
  "sex": "male",
  "dateOfBirth": "1990-01-01",
  "address": {
    "addressLine": "Rua das Flores",
    "number": "123",
    "complement": "",
    "district": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001000",
    "country": "Brasil",
    "addressType": 1
  },
  "professionalCredential": { ... } // apenas para personal/nutricionista
}
```

Se `address` for fornecido:
- Se o usuário já tem endereço (`addressId != null`): fazer UPDATE do endereço existente
- Se não tem endereço: criar novo endereço e vincular ao usuário

Se `professionalCredential` for fornecido e o perfil for PERSONAL ou NUTRITIONIST:
- Criar ou atualizar a credencial profissional

---

## 8. FLUXO DE REGISTRO NO FRONTEND (REFERÊNCIA)

O fluxo de cadastro no frontend (`RegisterFormContext.tsx`) atualmente:
1. Chama `POST /users` para criar usuário
2. Chama `POST /auth/magic-link/validate` para obter JWT final

Com a migração para .NET onde o usuário já existe (auto-provisionado), o frontend precisará ser ajustado para:
1. Chamar `PUT /users/:id` (usando o ID do usuário autenticado) em vez de `POST /users`
2. `PUT /users/:id` deve aceitar address + professionalCredential no body
3. Depois chamar `POST /auth/magic-link/validate` normalmente para refresh do JWT

**Esta mudança no frontend deve ser feita junto com a implementação do .NET.**

---

## Resumo das prioridades

| # | Feature | Impacto |
|---|---|---|
| 1 | Alinhamento de rotas (aliases) | 🔴 Crítico — frontend não funciona sem isso |
| 2 | `firstAccess` claim no JWT | 🔴 Crítico — usuários ficam presos no cadastro |
| 3 | Auto-provisioning no magic link | 🔴 Crítico — fluxo de cadastro quebra |
| 4 | PUT /user/:id aceitar address + credential | 🔴 Crítico — conclusão do cadastro |
| 5 | Módulo Self-Managed completo | 🟠 Alta — funcionalidade core para usuários self-managed |
| 6 | Pro-sessions (start/finish) | 🟡 Média — o one-shot `complete` funciona hoje |
| 7 | Health endpoint | 🟢 Baixa |

---

## Referência: arquivos Node.js relevantes

- Auth/magic-link: `backend-node/src/modules/auth/magic-link.service.ts`
- Self-managed: `backend-node/src/modules/self-managed/`
- Pro-sessions: `backend-node/src/modules/pro-workout-sessions/`
- Workout sessions: `backend-node/src/modules/workout-sessions/`
