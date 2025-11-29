# 🔍 Diagnóstico Web Push - NutriFit

## ❌ Problemas Identificados

### 1. **VAPID Key está configurada mas pode estar incorreta**
- `.env` tem: `BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4`
- **Precisa validar**: Essa chave foi gerada corretamente?

### 2. **Frontend pode não estar recebendo as variáveis de ambiente**
- `VITE_VAPID_PUBLIC_KEY` é passada via build-arg no Docker
- Se o frontend já foi buildado SEM essa variável, ela estará `undefined`

### 3. **Service Worker pode não estar registrado**
- `injectRegister: false` no vite.config.ts
- Não vi código que registra o SW manualmente após o login

### 4. **HTTPS é obrigatório para Service Workers**
- Service Workers só funcionam em `https://` ou `localhost`
- Em produção PRECISA ser HTTPS

## 🔧 Passo a Passo de Correção

### Teste 1: Verificar se as variáveis estão chegando no frontend

Abra o console do navegador em https://nutrifit.mujapira.com e rode:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('VAPID Key:', import.meta.env.VITE_VAPID_PUBLIC_KEY);
```

**Resultado esperado:**
```
API URL: https://apinutrifit.mujapira.com/api
VAPID Key: BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4
```

**Se aparecer `undefined`:** O problema é que o build do Docker não recebeu as variáveis.

### Teste 2: Verificar se o Service Worker está registrado

No console:

```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

**Resultado esperado:** Array com 1 registro apontando para `/sw.js`

**Se vazio:** O SW não foi registrado.

### Teste 3: Verificar se o backend tem as chaves VAPID

Cheque os logs do container da API:

```bash
docker logs nutrifit_api | grep -i vapid
```

Ou rode no container:

```bash
docker exec nutrifit_api env | grep VAPID
```

**Resultado esperado:**
```
Vapid__PublicKey=BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4
Vapid__PrivateKey=JFqcjjX1yHMCGU1Ab3MGg34qKSSqQlMWsC73fMjhL6w
```

### Teste 4: Verificar permissão de notificações

No console:

```javascript
console.log('Notification permission:', Notification.permission);
```

**Resultado esperado:** `"granted"` ou `"default"`

**Se `"denied"`:** Usuário bloqueou notificações. Precisa limpar configurações do site no navegador.

### Teste 5: Testar registro manual de push

Depois de fazer login, rode no console:

```javascript
const { ensurePushSubscription } = await import('/src/registerPush.ts');
await ensurePushSubscription(
  'https://apinutrifit.mujapira.com/api',
  'BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4',
  localStorage.getItem('token') // ou pegue do Redux
);
```

Verifique os logs no console.

## 🚀 Correções Necessárias

### Correção 1: Garantir que variáveis chegam no build

**Opção A: Rebuild com as variáveis**
```bash
docker-compose down
docker-compose build --no-cache front
docker-compose up -d
```

**Opção B: Hardcode temporário para testar**
Se rebuild não resolver, adicione temporariamente direto no código:

`frontend/src/services/api/auth.ts`:
```typescript
const apiBaseUrl = import.meta.env.VITE_API_URL || "https://apinutrifit.mujapira.com/api";
const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4";
```

### Correção 2: Registrar Service Worker explicitamente

O código atual NÃO registra o SW porque `injectRegister: false`.

**Solução:** Adicionar registro manual logo após login bem-sucedido.

### Correção 3: Validar chaves VAPID

Gere novas chaves para ter certeza:

```bash
npx web-push generate-vapid-keys
```

Atualize o `.env` com as novas chaves e faça rebuild.

## 📊 Checklist Final

- [ ] HTTPS habilitado em produção
- [ ] Variáveis de ambiente VITE_* definidas no build do Docker
- [ ] Service Worker acessível em `/sw.js`
- [ ] Service Worker registrado após login
- [ ] Chaves VAPID configuradas no backend
- [ ] Chaves VAPID (pública) configurada no frontend
- [ ] Permissão de notificações concedida pelo usuário
- [ ] Endpoint `/api/push/Subscribe` retorna 200

## 🧪 Como Testar Fim-a-Fim

1. Faça login em https://nutrifit.mujapira.com
2. Abra DevTools (F12) → guia Console
3. Verifique se aparece `[PUSH] subscribe status: 200`
4. Vá para Application → Service Workers → verifique se `/sw.js` está ativo
5. Vá para Application → Push Messaging → copie o endpoint
6. Teste envio manual via Postman/curl:

```bash
curl -X POST https://apinutrifit.mujapira.com/api/push/NotifyUser/{SEU_USER_ID} \
  -H "Authorization: Bearer {SEU_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teste",
    "body": "Push funcionando!",
    "url": "/home"
  }'
```

7. Você deve receber a notificação no navegador

## 🆘 Próximos Passos

Me avise qual teste falhou que te ajudo a corrigir especificamente!
