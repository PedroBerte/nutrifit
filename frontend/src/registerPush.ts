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
  if (!("serviceWorker" in navigator)) throw new Error("SW não suportado.");
  if (!("PushManager" in window)) throw new Error("Push não suportado.");

  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  const reg = await navigator.serviceWorker.ready;

  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Permissão de notificação negada.");

  const desired = b64UrlNormalize(vapidPublicKey);
  console.log("[PUSH] desired VAPID key:", desired);
  let sub = await reg.pushManager.getSubscription();

  if (sub) {
    const ask = (sub as any).options?.applicationServerKey as
      | ArrayBuffer
      | undefined;
    if (ask instanceof ArrayBuffer) {
      const usedKeyU8 = new Uint8Array(ask);
      const usedKey = u8ToB64Url(usedKeyU8);
      if (b64UrlNormalize(usedKey) !== desired) {
        await sub.unsubscribe();
        sub = null;
      }
    } else {
      await sub?.unsubscribe();
      sub = null;
    }
  }

  if (!sub) {
    const applicationServerKey = urlBase64ToUint8Array(desired);
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  const res = await fetch(`${apiBaseUrl}/push/Subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(subToDto(sub)),
  });

  console.log("[PUSH] subscribe status:", res.status);
  if (!res.ok) console.error("[PUSH] subscribe body:", await res.text());

  return sub;
}
