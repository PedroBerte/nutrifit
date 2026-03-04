# NutriFit Backend Node (WIP)

Base inicial do novo backend em Node.js + TypeScript.

## Scripts

- `npm run dev`: sobe API em modo desenvolvimento
- `npm run build`: compila TypeScript para `dist`
- `npm run start`: executa build compilado
- `npm run test`: roda todos os testes
- `npm run test:unit`: roda apenas testes unitários
- `npm run test:integration`: roda apenas testes de integração

## Endpoints atuais

- `GET /health`
- `POST /auth/self-managed/register`
- `POST /auth/self-managed/login`
- `GET /users/me`
- `PUT /users/me`
- `GET /workouts/templates`
- `POST /workouts/templates`
- `GET /workouts/templates/:workoutId`
- `PUT /workouts/templates/:workoutId`
- `DELETE /workouts/templates/:workoutId`
- `GET /workouts/sessions`
- `POST /workouts/sessions`
- `GET /workouts/sessions/:sessionId`
- `POST /workouts/sessions/:sessionId/finish`
- `GET /goals/weekly`
- `PUT /goals/weekly`
- `GET /goals/weekly/progress`

## Próximos passos sugeridos

1. Implementar módulo de autenticação (magic link + JWT)
2. Conectar PostgreSQL e Redis
3. Migrar endpoint por endpoint do backend .NET atual
