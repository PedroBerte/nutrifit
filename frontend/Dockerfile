# ---------- Dev image para Vite ----------
FROM node:20-alpine

# Evita issues de libs nativas em algumas deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copia apenas os manifestos para cache mais eficiente
COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/yarn.lock* frontend/package-lock.json* ./

# Instala dependências
RUN npm install; 


# Copia o restante do código do front
COPY frontend/ .

# Vite precisa escutar fora do localhost no container
EXPOSE 5052

# Ambiente: o compose já injeta VITE_API_URL via 'environment'
# Vite injeta import.meta.env.* a partir das variáveis de ambiente VITE_*
ENV HOST=0.0.0.0

# Sobe o dev server com hot-reload
CMD sh -lc ' \
    if [ -f pnpm-lock.yaml ]; then pnpm dev --host 0.0.0.0; \
    elif [ -f yarn.lock ]; then yarn dev --host 0.0.0.0; \
    else npm run dev -- --host 0.0.0.0; \
    fi'
