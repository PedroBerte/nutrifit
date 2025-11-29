# 🚀 Deploy com Push Notifications - Passo a Passo

## ✅ O que foi corrigido no código:

1. **Fallback da chave VAPID** - Se a variável de ambiente falhar, usa a chave hardcoded
2. **Logs detalhados** - Agora você vê EXATAMENTE o que está acontecendo no console
3. **Melhor tratamento de erros** - Erros específicos para cada etapa
4. **Configuração do Vite PWA** - Garantir que o SW seja copiado corretamente

## 📋 Checklist de Deploy

### 1. Verificar variáveis de ambiente (`.env`)

```bash
# Certifique-se que estas variáveis estão no .env:
VAPID_PUBLIC_KEY=BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4
VAPID_PRIVATE_KEY=JFqcjjX1yHMCGU1Ab3MGg34qKSSqQlMWsC73fMjhL6w
FRONT_API_URL=https://apinutrifit.mujapira.com/api
```

### 2. Rebuild dos containers

```powershell
# No servidor/pasta do projeto
docker-compose down

# Rebuild sem cache para garantir que pega as variáveis
docker-compose build --no-cache

# Subir tudo
docker-compose up -d
```

### 3. Verificar se subiu corretamente

```powershell
# Ver status dos containers
docker-compose ps

# Ver logs do frontend (procurar por erros de build)
docker logs nutrifit_front

# Ver logs do backend (procurar por "Vapid")
docker logs nutrifit_api | Select-String -Pattern "Vapid"
```

### 4. Testar no navegador

Abra `https://nutrifit.mujapira.com` e:

1. **Abra o DevTools** (F12)
2. **Vá para a aba Console**
3. **Faça login**

Você DEVE ver estes logs na ordem:

```
[AUTH] API Base URL: https://apinutrifit.mujapira.com/api
[AUTH] VAPID Public Key: BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4
[AUTH] Token received: ✅
[PUSH] 🚀 Iniciando ensurePushSubscription
[PUSH] API URL: https://apinutrifit.mujapira.com/api
[PUSH] VAPID Key: BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4
[PUSH] Auth Token: presente
[PUSH] Registrando Service Worker em /sw.js...
[PUSH] Service Worker registrado: activated
[PUSH] Service Worker pronto: activated
[PUSH] Permissão de notificação: granted
[PUSH] VAPID key normalizada: BKKDHulrht7Cot9XoCqXZW8GOsnML2SmNvbIfiyH2iUpbSEUKEZiDJQCHMItcb91Q7DpmhpYYwDmb7cW4mBtjO4
[PUSH] Subscription existente: ❌ Não encontrada
[PUSH] Criando nova subscription...
[PUSH] ✅ Nova subscription criada
[PUSH] Enviando subscription para backend: {...}
[PUSH] Response status: 200
[PUSH] ✅ Subscription registrada no backend com sucesso!
[AUTH] Push subscription successful ✅
```

### 5. Verificar Service Worker

No DevTools:

1. **Aba Application**
2. **Service Workers** (menu esquerdo)
3. Deve aparecer: `https://nutrifit.mujapira.com/sw.js` com status **activated**

### 6. Testar notificação

**Opção A: Via código do navegador (console)**

```javascript
// Pegue seu user ID e token do localStorage/Redux
const userId = "SEU-USER-ID-AQUI";
const token = "SEU-JWT-TOKEN-AQUI";

// Enviar notificação de teste
fetch(`https://apinutrifit.mujapira.com/api/push/NotifyUser/${userId}`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    title: "🎉 Teste Push",
    body: "Se você está vendo isso, FUNCIONOU!",
    url: "/home"
  })
});
```

**Opção B: Via Postman/Insomnia**

```http
POST https://apinutrifit.mujapira.com/api/push/NotifyUser/{userId}
Authorization: Bearer {seu-token}
Content-Type: application/json

{
  "title": "Teste",
  "body": "Funciona!",
  "url": "/home"
}
```

## 🐛 Diagnóstico de Problemas

### Problema 1: "VAPID Key: undefined"

**Causa:** Variáveis de ambiente não chegaram no build do Docker

**Solução:**
```powershell
# Verificar se o .env existe e tem as variáveis
cat .env | Select-String -Pattern "VAPID"

# Rebuild forçado
docker-compose build --no-cache front
docker-compose up -d front
```

### Problema 2: "Service Worker não suportado"

**Causa:** Sem HTTPS ou navegador muito antigo

**Solução:**
- Certifique-se que está usando `https://` (não `http://`)
- Use Chrome, Firefox ou Edge moderno
- No localhost funciona sem HTTPS para testes

### Problema 3: "Permissão de notificação negada"

**Causa:** Usuário bloqueou notificações

**Solução no Chrome:**
1. Clique no **cadeado** ao lado da URL
2. Configurações do site
3. Notificações → **Permitir**
4. Recarregue a página

### Problema 4: "Response status: 401"

**Causa:** Token JWT inválido ou expirado

**Solução:**
- Faça logout e login novamente
- Verifique se o token está sendo enviado no header

### Problema 5: "Response status: 500"

**Causa:** Backend sem as chaves VAPID configuradas

**Solução:**
```powershell
# Verificar variáveis no container
docker exec nutrifit_api env | Select-String -Pattern "Vapid"

# Se estiver vazio, o .env não foi carregado
# Verifique o docker-compose.yml:
# environment:
#   Vapid__PublicKey: ${VAPID_PUBLIC_KEY}
#   Vapid__PrivateKey: ${VAPID_PRIVATE_KEY}
```

### Problema 6: "Service Worker não carrega"

**Causa:** Arquivo `sw.js` não foi copiado para `/dist`

**Solução:**
```powershell
# Entrar no container do frontend
docker exec -it nutrifit_front sh

# Verificar se o sw.js existe
ls -la /usr/share/nginx/html/sw.js

# Se não existir, problema no build do Vite
# Verifique se public/sw.js existe no código-fonte
```

## 📊 Verificação Pós-Deploy

### Checklist Final:

- [ ] Containers rodando (`docker-compose ps`)
- [ ] Frontend acessível em https://nutrifit.mujapira.com
- [ ] Backend acessível em https://apinutrifit.mujapira.com/api
- [ ] Service Worker em https://nutrifit.mujapira.com/sw.js (abre sem erro 404)
- [ ] Login funciona
- [ ] Console mostra `[PUSH] ✅ Subscription registrada no backend com sucesso!`
- [ ] DevTools → Application → Service Workers → sw.js ativo
- [ ] DevTools → Application → Push Messaging → subscription aparece
- [ ] Notificação de teste funciona

## 🎯 Próximos Passos

Depois de funcionar:

1. **Remover o hardcode da VAPID key** - Quando confirmar que as env vars funcionam
2. **Adicionar notificações em mais lugares** - Ver `BondService.cs` como exemplo
3. **Customizar ícone e badge** - Trocar `/vite.svg` por logo do NutriFit em `sw.js`
4. **Testar em múltiplos dispositivos** - Desktop + Mobile
5. **Implementar unsubscribe** - Quando usuário faz logout

## ⚡ Comandos Úteis

```powershell
# Ver logs em tempo real
docker logs -f nutrifit_front
docker logs -f nutrifit_api

# Restart apenas um serviço
docker-compose restart front
docker-compose restart api

# Limpar tudo e rebuildar do zero
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Ver variáveis de ambiente de um container
docker exec nutrifit_api env
docker exec nutrifit_front env
```

---

**✅ Se os logs mostrarem tudo verde, as notificações estão funcionando!**

Me avise se algum log aparecer vermelho/com erro que te ajudo a debugar.
