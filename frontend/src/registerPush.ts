function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function ensurePushSubscription(
  apiBaseUrl: string,
  vapidPublicKey: string,
  authToken: string
) {
  if (!("serviceWorker" in navigator)) throw new Error("SW não suportado.");
  if (!("PushManager" in window)) throw new Error("Push não suportado.");

  const reg = await navigator.serviceWorker.register("/sw.js"); // coloque seu SW em /public/sw.js
  await navigator.serviceWorker.ready;

  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Permissão de notificação negada.");

  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing; // já inscrito

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  // Envie pro backend (proteja com seu JWT)
  await fetch(`${apiBaseUrl}/api/push/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(sub),
  });

  return sub;
}
