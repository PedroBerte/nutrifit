# NutriFit - AI Agent Instructions

## Architecture Overview

**Three-tier application**: .NET 8 backend + React PWA frontend + PostgreSQL + Redis

- **Backend** (`backend/`): ASP.NET Core Web API with layered architecture
  - `Nutrifit.API`: Controllers, Program.cs (entry point), JWT auth, Swagger
  - `Nutrifit.Services`: Business logic, DTOs, ViewModels, service interfaces
  - `Nutrifit.Repository`: EF Core context, entities, migrations
- **Frontend** (`frontend/`): React 19 + Vite + TypeScript + TailwindCSS v4 + PWA
- **Data**: PostgreSQL (main DB), Redis (magic link sessions), Serilog logs to DB
- **Infrastructure**: Docker Compose with health checks, multi-stage Dockerfiles

## Critical Patterns

### Authentication Flow

- **Magic Link** (passwordless): User requests email → token stored in Redis → JWT issued on validation
- Token stored as `ml:{SHA256(token)}` in Redis with TTL (see `AuthenticationService.cs`)
- Frontend stores JWT in Redux Persist → auto-decoded on login (see `authSlice.ts`)
- All authenticated endpoints require `[Authorize]` attribute and JWT bearer token

### Service Layer Architecture

- **Dependency Injection**: Services registered in `Program.cs` as `IServiceName` → `ServiceName`
- **Repository Pattern**: Direct EF Core usage in services (no separate repository classes)
- **DTO Mapping**: Manual mapping (no AutoMapper) - uses Mapster package
- Controllers are thin - business logic lives in `Nutrifit.Services/Services/`

### Frontend State Management

- **Redux Toolkit**: Auth state (`authSlice.ts`) with persistence via `redux-persist`
- **React Query**: API calls (not everywhere - some use direct axios)
- **Routing**: `react-router-dom` v7 with nested routes (see `routes/AppRoutes.tsx`)
- **Forms**: `react-hook-form` + `zod` validation + shadcn/ui components

### Push Notifications

- Web Push API with VAPID keys (configured in `appsettings.json`)
- Service Worker registration in `registerPush.ts` with key rotation logic
- Backend: `PushService.cs` + `PushSubscriptionEntity` tracks subscriptions per user

## Database Conventions

- **Migrations**: Located in `Nutrifit.Repository/Migrations/`, run automatically on startup
- **Seeding**: Static profiles (Student, Personal, Nutritionist) seeded via `DatabaseSeeder.cs`
- **DateTime handling**: Always `timestamp without time zone` + custom converters (`UnspecifiedDateTimeConverter`)
- **Naming**: Tables are PascalCase (e.g., `Users`, `CustomerProfessionalBonds`), except `push_subscriptions`

### Entity Relationships

- `UserEntity`: Has profiles, bonds (as customer/professional/sender), credentials, feedbacks
- Foreign keys use `DeleteBehavior.Restrict` by default except cascading deletes for credentials/push subs
- GUIDs for all primary keys with `ValueGeneratedOnAdd()`

## Development Workflows

### Running Locally (Docker)

```powershell
docker-compose up --build
```

- API: `http://localhost:5051` (Swagger always enabled)
- Frontend: `http://localhost:5052`
- PostgreSQL: Port 5433 (mapped from 5432)
- Redis: Exposed only to internal network

### Running Locally (Dev Mode)

```powershell
# Backend
cd backend/Nutrifit.API
dotnet run

# Frontend
cd frontend
npm run dev  # Vite dev server on :5173
```

### Database Migrations

```powershell
cd backend/Nutrifit.Repository
dotnet ef migrations add <MigrationName> --startup-project ../Nutrifit.API
dotnet ef database update --startup-project ../Nutrifit.API
```

### Environment Variables

- **Backend**: Configured via `appsettings.json` (dev) or Docker env vars (prod)
  - Connection strings for PostgreSQL and Redis
  - JWT signing key, VAPID keys, SMTP credentials
- **Frontend**: Vite env vars (`VITE_API_URL`, `VITE_VAPID_PUBLIC_KEY`) passed as Docker build args

## Code Style & Conventions

### Backend (.NET)

- **Minimal APIs**: No - uses traditional MVC controllers
- **Nullable reference types**: Enabled (`<Nullable>enable</Nullable>`)
- **Logging**: Serilog to PostgreSQL (`app_logs` table) + console in dev
- **CORS**: Configured in `Program.cs` for specific origins (localhost + production domain)
- **Error handling**: Try-catch in controllers, return `StatusCode(500)` with message

### Frontend (React/TypeScript)

- **File organization**: Features grouped by domain (pages, components, services, types)
- **Component naming**: PascalCase files for components, camelCase for utilities
- **Styling**: TailwindCSS v4 utility classes + CSS variables for theme tokens
- **Path aliases**: `@/` maps to `src/` (configured in `vite.config.ts`)
- **Type safety**: Interfaces for all API responses (see `types/` folder)

## Integration Points

- **Email**: MailKit via Gmail SMTP (credentials in config)
- **Address lookup**: ViaCEP API integration (see `services/viacep.ts`)
- **API base URL**: Injected via `VITE_API_URL` (frontend) or `X-App-BaseUrl` header (backend)

## Common Pitfalls

1. **DateTime zones**: Always use UTC in backend, convert in UnspecifiedDateTimeConverter
2. **JWT claims**: Custom claims (`id`, `profile`, `isAdmin`) - not standard claim names
3. **Service Worker**: Must be at `/sw.js` root path for full PWA scope
4. **Docker context**: Build context is repo root, not `backend/` or `frontend/`
5. **VAPID keys**: Must match between frontend and backend for push to work

## Key Files Reference

- API entry: `backend/Nutrifit.API/Program.cs`
- DB context: `backend/Nutrifit.Repository/NutrifitContext.cs`
- Frontend routes: `frontend/src/routes/AppRoutes.tsx`
- Auth logic: `backend/Nutrifit.Services/Services/AuthenticationService.cs`
- Redux store: `frontend/src/store/authSlice.ts`
