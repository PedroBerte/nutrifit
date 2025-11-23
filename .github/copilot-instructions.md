# NutriFit - AI Agent Instructions

## Architecture Overview

**Three-tier application**: .NET 8 backend + React PWA frontend + PostgreSQL + Redis + MinIO

- **Backend** (`backend/`): ASP.NET Core Web API with layered architecture
  - `Nutrifit.API`: Controllers, Program.cs (entry point), JWT auth, Swagger (always enabled)
  - `Nutrifit.Services`: Business logic, DTOs (no ViewModels), service interfaces
  - `Nutrifit.Repository`: EF Core context, entities, migrations, seeding
- **Frontend** (`frontend/`): React 19 + Vite + TypeScript + TailwindCSS v4 + PWA
- **Data**: PostgreSQL (main DB), Redis (magic link sessions), MinIO (S3-compatible image storage)
- **Infrastructure**: Docker Compose with health checks for all services, multi-stage Dockerfiles

## Critical Patterns

### Authentication Flow

- **Magic Link** (passwordless): User requests email → token stored in Redis as `ml:{SHA256(token)}` with TTL → JWT issued on validation
- Backend: `AuthenticationService.cs` handles token generation/validation
- Frontend: JWT stored in Redux Persist → auto-decoded via `decodeAndNormalizeJwt()` in `authSlice.ts`
- Custom JWT claims: `id`, `name`, `email`, `isAdmin`, `profile` (NOT standard claim names)
- All authenticated endpoints require `[Authorize]` attribute
- Token refresh: `axios` interceptor checks expiry (30s buffer), calls `/authentication/refresh` automatically

### Service Layer Architecture

- **Dependency Injection**: All services registered in `Program.cs` as `IServiceName` → `ServiceName` (scoped)
- **Repository Pattern**: Direct EF Core context usage in services (no separate repository classes)
- **DTO Mapping**: Uses Mapster package (no AutoMapper) for entity ↔ DTO conversion
- Controllers are thin wrappers - ALL business logic lives in `Nutrifit.Services/Services/`
- Service interfaces in `Nutrifit.Services/Services/Interfaces/`

### Frontend State Management

- **Redux Toolkit**: Auth state only (`authSlice.ts`) with `redux-persist` for localStorage
- **React Query** (`@tanstack/react-query`): Used for some API calls, but NOT consistently - many use direct axios
- **Axios instance**: `lib/axios.ts` exports `api` with request interceptor for JWT injection + auto-refresh
- **Routing**: `react-router-dom` v7 with nested routes under `<AppDefaultLayout>` (see `routes/AppRoutes.tsx`)
- **Forms**: `react-hook-form` + `zod` validation (v4) + shadcn/ui Radix components

### Image Storage (MinIO)

- **Backend**: `StorageService.cs` handles all S3 operations via Minio SDK
- Bucket created automatically on startup with public read policy
- Upload validation: max 5MB, allowed types: `image/jpeg|jpg|png|webp|gif`
- Public URLs returned as `http(s)://{endpoint}/{bucket}/{object}` (NOT presigned by default)
- Configuration in `appsettings.json` under `MinIO` section (endpoint, credentials, bucket name, SSL flag)
- Docker: MinIO service on ports 9000 (API) and 9001 (console)

### Push Notifications

- Web Push API with VAPID keys (configured in `appsettings.json` → Vapid section)
- Service Worker: Manual registration in `registerPush.ts` (NOT auto-injected by Vite PWA plugin)
- Backend: `PushService.cs` + `PushSubscriptionEntity` (snake_case table: `push_subscriptions`)
- Frontend must call registration after login to subscribe user

## Database Conventions

- **Migrations**: Located in `Nutrifit.Repository/Migrations/`, applied automatically on startup with retry logic (5 attempts, 3s delay)
- **Seeding**: Static data seeded via `DatabaseSeeder.Seed()` in `OnModelCreating()`:
  - Profiles: Student, Personal, Nutritionist (fixed GUIDs)
  - Exercise categories: Cardio, Strength, Flexibility, Functional
  - Muscle groups and muscles (comprehensive anatomy data)
- **DateTime handling**: Global convention in `ConfigureConventions()` → `timestamp without time zone` + custom converters (`UnspecifiedDateTimeConverter`, `NullableUnspecifiedDateTimeConverter`)
- **Naming**: Tables are PascalCase (e.g., `Users`, `CustomerProfessionalBonds`), EXCEPT `push_subscriptions` (snake_case)
- **Primary keys**: Always GUIDs with `ValueGeneratedOnAdd()`
- **Delete behavior**: `DeleteBehavior.Restrict` by default, cascading only for credentials/push subs

### Key Entity Relationships

- `UserEntity` has: addresses, profiles, bonds (as customer/professional/sender), credentials, feedbacks, routines
- `CustomerProfessionalBondEntity`: Many-to-many relationship with status tracking
- `RoutineEntity` → `WorkoutTemplateEntity` → `ExerciseTemplateEntity` (workout planning hierarchy)
- `WorkoutSessionEntity` → `ExerciseSessionEntity` → `SetSessionEntity` (workout execution tracking)
- Join tables: `ExercisePrimaryMuscleEntity`, `ExerciseSecondaryMuscleEntity`, `CustomerRoutineEntity`

## Development Workflows

### Running Locally (Docker)

```powershell
docker-compose up --build
```

- API: `http://localhost:5051` (Swagger: `/swagger`)
- Frontend: `http://localhost:5052`
- PostgreSQL: Port 5433 (host) → 5432 (container)
- Redis: Port 6379 (internal network only)
- MinIO: Port 9000 (API), 9001 (console UI)

### Running Locally (Dev Mode)

```powershell
# Backend (requires local PostgreSQL on 5432 + Redis on 6379 + MinIO on 9000)
cd backend/Nutrifit.API
dotnet run  # API at http://localhost:5051

# Frontend
cd frontend
npm run dev  # Vite dev server at http://localhost:5173
```

### Database Migrations

```powershell
cd backend/Nutrifit.Repository
dotnet ef migrations add <MigrationName> --startup-project ../Nutrifit.API
dotnet ef database update --startup-project ../Nutrifit.API
```

### Environment Variables

- **Backend**: `appsettings.json` (dev) or `appsettings.Production.json` + Docker env vars (prod)
  - Connection strings: `Default` (PostgreSQL), `Redis`
  - JWT config: `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiresMinutes`
  - SMTP: `Smtp:Host|Port|User|AppPassword|FromName`
  - VAPID: `Vapid:Subject|PublicKey|PrivateKey`
  - MinIO: `MinIO:Endpoint|AccessKey|SecretKey|BucketName|UseSSL`
  - Serilog: `Serilog:WriteTo[0]:Args:connectionString|tableName`
- **Frontend**: Vite env vars (passed as Docker build args in production)
  - `VITE_API_URL`: Backend API base URL (default: `https://apinutrifit.mujapira.com/api`)
  - `VITE_VAPID_PUBLIC_KEY`: Web Push public key (must match backend)

## Code Style & Conventions

### Backend (.NET)

- **API style**: Traditional MVC controllers (NOT Minimal APIs)
- **Nullable reference types**: Enabled globally (`<Nullable>enable</Nullable>`)
- **Logging**: Serilog to PostgreSQL (`app_logs` table) + console sink in dev
- **CORS**: Hardcoded origins in `Program.cs` → `"front"` policy (localhost:5173/5052 + production domain)
- **Error handling**: Try-catch in controllers → `StatusCode(500, message)` or `BadRequest(message)`
- **API response**: Controllers return `Ok(data)`, `BadRequest(message)`, `NotFound()`, `StatusCode(500)`

### Frontend (React/TypeScript)

- **File organization**: Domain-grouped features
  - `pages/`: Route components (PascalCase)
  - `components/`: Reusable UI (PascalCase)
  - `services/api/`: API client functions (camelCase)
  - `types/`: TypeScript interfaces (camelCase files)
  - `lib/`: Utilities (camelCase)
- **Styling**: TailwindCSS v4 utility classes + CSS variables in `index.css` (theme tokens)
- **Path aliases**: `@/` → `src/` (configured in `vite.config.ts`)
- **Type safety**: Define interfaces for ALL API responses in `types/` folder
- **API calls**: Import `api` from `@/lib/axios`, NOT raw axios

## Integration Points

- **Email**: MailKit via Gmail SMTP (587) with app password (see `MailService.cs`)
- **Address lookup**: ViaCEP Brazilian postal code API (see `services/viacep.ts`)
- **Image uploads**: MinIO S3-compatible storage (see `StorageService.cs`, `services/api/storage.ts`)
- **Domain**: Production domain is `nutrifit.mujapira.com` (frontend) + `apinutrifit.mujapira.com` (backend)

## Common Pitfalls

1. **DateTime zones**: Backend uses `timestamp without time zone` + custom converters → always UTC internally
2. **JWT claims**: Custom claim names (`id`, `profile`, `isAdmin`) - NOT standard names like `sub`, `role`
3. **Service Worker**: Must be at `/sw.js` root path for full PWA scope - `public/sw.js` copied to dist root
4. **Docker context**: Build context is repo root in `docker-compose.yml`, NOT `backend/` or `frontend/` subdirs
5. **VAPID keys**: Must match EXACTLY between frontend (`VITE_VAPID_PUBLIC_KEY`) and backend (`Vapid:PublicKey`)
6. **Token refresh**: Axios interceptor handles automatically - DON'T manually refresh in components
7. **MinIO URLs**: Public bucket returns direct URLs, NOT presigned (presigned only via `GetPresignedUrlAsync()`)
8. **Migration startup**: App retries DB migration 5 times on startup - transient connection failures are handled

## Key Files Reference

- **API entry**: `backend/Nutrifit.API/Program.cs` (DI registration, middleware, CORS, JWT config)
- **DB context**: `backend/Nutrifit.Repository/NutrifitContext.cs` (entities, conventions, seeding)
- **Auth service**: `backend/Nutrifit.Services/Services/AuthenticationService.cs` (magic link, JWT generation)
- **Frontend routes**: `frontend/src/routes/AppRoutes.tsx` (all route definitions)
- **Redux auth**: `frontend/src/store/authSlice.ts` (auth state, JWT decode logic)
- **Axios config**: `frontend/src/lib/axios.ts` (JWT injection, auto-refresh interceptor)
- **Docker compose**: `docker-compose.yml` (all service definitions, health checks, networks)
