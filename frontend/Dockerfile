# ---------- Build (Vite) ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/yarn.lock* frontend/package-lock.json* ./
RUN corepack enable && \
    if [ -f pnpm-lock.yaml ]; then corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm i; fi

COPY frontend/ .

# ✅ CORREÇÃO AQUI: receba a URL da API como build-arg e exporte
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_VAPID_PUBLIC_KEY
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY

# se o seu package.json roda `tsc -b && vite build` e isso travar,
# temporariamente troque p/ só `vite build` no package.json
RUN if [ -f pnpm-lock.yaml ]; then pnpm build; \
    elif [ -f yarn.lock ]; then yarn build; \
    else npm run build; fi

# ---------- Runtime (Nginx servindo estático) ----------
FROM nginx:alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]