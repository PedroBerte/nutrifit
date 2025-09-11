# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5051
EXPOSE 5051

# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copia só csproj p/ cache do restore
COPY backend/Nutrifit.API/Nutrifit.API.csproj backend/Nutrifit.API/
# Se houver projetos referenciados, adicione linhas extras:
# COPY backend/Nutrifit.Domain/Nutrifit.Domain.csproj backend/Nutrifit.Domain/
# COPY backend/Nutrifit.Infra/Nutrifit.Infra.csproj backend/Nutrifit.Infra/

RUN dotnet restore backend/Nutrifit.API/Nutrifit.API.csproj

# Agora copia o resto do código
COPY . .

# Build
WORKDIR /src/backend/Nutrifit.API
RUN dotnet build Nutrifit.API.csproj -c $BUILD_CONFIGURATION -o /app/build

# Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
WORKDIR /src/backend/Nutrifit.API
RUN dotnet publish Nutrifit.API.csproj -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Nutrifit.API.dll"]
