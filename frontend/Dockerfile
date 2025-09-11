# ---------- Build (Vite) ----------
FROM node:20-alpine AS build
WORKDIR /app

# Instala deps baseado no lockfile
COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/yarn.lock* frontend/package-lock.json* ./
RUN corepack enable && \
    if [ -f pnpm-lock.yaml ]; then corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm i; fi

# Código do app
COPY frontend/ .

# Vite lê VITE_* em tempo de build (passaremos por build-arg)
ARG https://apinutrifit.mujapira.com
ENV VITE_API_URL=https://apinutrifit.mujapira.com

# Build
RUN if [ -f pnpm-lock.yaml ]; then pnpm build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi

# ---------- Runtime (Nginx servindo estático) ----------
FROM nginx:alpine
# Config SPA (fallback)
RUN rm -f /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Arquivos gerados por Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
