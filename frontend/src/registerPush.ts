function u8ToB64Url(u8: Uint8Array) {
  const b64 = btoa(String.fromCharCode(...u8));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlNormalize(s: string) {
  return s.trim().replace(/=+$/, "");
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function subToDto(sub: PushSubscription) {
  const p256dh = sub.getKey?.("p256dh");
  const auth = sub.getKey?.("auth");
  return {
    endpoint: sub.endpoint,
    expirationTime: (sub as any).expirationTime ?? null,
    keys: {
      p256dh: p256dh ? u8ToB64Url(new Uint8Array(p256dh)) : undefined,
      auth: auth ? u8ToB64Url(new Uint8Array(auth)) : undefined,
    },
  };
}

export async function ensurePushSubscription(
  apiBaseUrl: string,
  vapidPublicKey: string,
  authToken: string
) {
  console.log("[PUSH] 🚀 Iniciando ensurePushSubscription");
  console.log("[PUSH] API URL:", apiBaseUrl);
  console.log("[PUSH] VAPID Key:", vapidPublicKey);
  console.log("[PUSH] Auth Token:", authToken ? "presente" : "ausente");

  if (!("serviceWorker" in navigator)) {
    console.error("[PUSH] ❌ Service Worker não suportado neste navegador");
    throw new Error("SW não suportado.");
  }
  if (!("PushManager" in window)) {
    console.error("[PUSH] ❌ Push Manager não suportado neste navegador");
    throw new Error("Push não suportado.");
  }

  console.log("[PUSH] Registrando Service Worker em /sw.js...");
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
  console.log("[PUSH] Service Worker registrado:", registration.active?.state);

  const reg = await navigator.serviceWorker.ready;
  console.log("[PUSH] Service Worker pronto:", reg.active?.state);

  const perm = await Notification.requestPermission();
  console.log("[PUSH] Permissão de notificação:", perm);
  if (perm !== "granted") {
    console.error("[PUSH] ❌ Permissão de notificação negada pelo usuário");
    throw new Error("Permissão de notificação negada.");
  }

  const desired = b64UrlNormalize(vapidPublicKey);
  console.log("[PUSH] VAPID key normalizada:", desired);

  let sub = await reg.pushManager.getSubscription();
  console.log(
    "[PUSH] Subscription existente:",
    sub ? "✅ Encontrada" : "❌ Não encontrada"
  );

  if (sub) {
    const ask = (sub as any).options?.applicationServerKey as
      | ArrayBuffer
      | undefined;
    if (ask instanceof ArrayBuffer) {
      const usedKeyU8 = new Uint8Array(ask);
      const usedKey = u8ToB64Url(usedKeyU8);
      console.log(
        "[PUSH] Chave atual da subscription:",
        b64UrlNormalize(usedKey)
      );
      console.log("[PUSH] Chave desejada:", desired);
      if (b64UrlNormalize(usedKey) !== desired) {
        console.log(
          "[PUSH] Chaves diferentes, removendo subscription antiga..."
        );
        await sub.unsubscribe();
        sub = null;
      } else {
        console.log("[PUSH] ✅ Chaves compatíveis, reutilizando subscription");
      }
    } else {
      console.log("[PUSH] Subscription sem applicationServerKey, removendo...");
      await sub?.unsubscribe();
      sub = null;
    }
  }

  if (!sub) {
    console.log("[PUSH] Criando nova subscription...");
    const applicationServerKey = urlBase64ToUint8Array(desired);
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    console.log("[PUSH] ✅ Nova subscription criada");
  }

  const subscriptionDto = subToDto(sub);
  console.log("[PUSH] Enviando subscription para backend:", {
    endpoint: subscriptionDto.endpoint.substring(0, 50) + "...",
    hasKeys: !!(subscriptionDto.keys.p256dh && subscriptionDto.keys.auth),
  });

  const res = await fetch(`${apiBaseUrl}/push/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(subscriptionDto),
  });

  console.log("[PUSH] Response status:", res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[PUSH] ❌ Erro ao registrar no backend:", errorText);
    throw new Error(`Falha ao registrar push: ${res.status} - ${errorText}`);
  }

  console.log("[PUSH] ✅ Subscription registrada no backend com sucesso!");
  return sub;
}

export async function unsubscribePush(apiBaseUrl: string, authToken: string) {
  console.log("[PUSH] 🔴 Iniciando unsubscribePush");

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("[PUSH] Push não suportado, ignorando unsubscribe");
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();

    if (!sub) {
      console.log("[PUSH] Nenhuma subscription ativa para remover");
      return;
    }

    const endpoint = sub.endpoint;
    console.log(
      "[PUSH] Removendo subscription:",
      endpoint.substring(0, 50) + "..."
    );

    // Unsubscribe no backend primeiro
    try {
      const res = await fetch(`${apiBaseUrl}/push/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(endpoint),
      });

      if (res.ok) {
        console.log("[PUSH] ✅ Subscription removida do backend");
      } else {
        console.warn("[PUSH] ⚠️ Falha ao remover do backend:", res.status);
      }
    } catch (err) {
      console.warn("[PUSH] ⚠️ Erro ao chamar backend:", err);
    }

    // Unsubscribe local
    await sub.unsubscribe();
    console.log("[PUSH] ✅ Subscription removida localmente");
  } catch (err) {
    console.error("[PUSH] ❌ Erro ao fazer unsubscribe:", err);
  }
}
