function u8ToB64Url(u8: Uint8Array) {
  const b64 = btoa(String.fromCharCode(...u8));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function subToDto(sub: PushSubscription) {
  const p256dh = sub.getKey ? sub.getKey("p256dh") : null;
  const auth = sub.getKey ? sub.getKey("auth") : null;

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

  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;

  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Permissão de notificação negada.");

  let sub = await reg.pushManager.getSubscription();

  if (!sub) {
    const appServerKey = (function urlBase64ToUint8Array(base64String: string) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i)
        outputArray[i] = rawData.charCodeAt(i);
      return outputArray;
    })(vapidPublicKey);

    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: appServerKey,
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
