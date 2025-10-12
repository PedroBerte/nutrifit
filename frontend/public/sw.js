// Importar as funcionalidades do Workbox injetadas pelo VitePWA
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";

// Precarregar e rotear todos os assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("[SW] install");
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  console.log("[SW] activate");
});

self.addEventListener("push", (event) => {
  let txt = "";
  try {
    txt = event?.data?.text?.() ?? "";
  } catch {}
  console.log("[SW] push recebido:", txt);

  let data = {};
  try {
    data = txt ? JSON.parse(txt) : {};
  } catch {
    data = { title: "Push", body: txt };
  }

  const title = data.title || "Ping";
  const options = {
    body: data.body || "(sem body)",
    data: { url: data.url || "/" },
    icon: "/vite.svg",
    badge: "/vite.svg",
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ("focus" in client) {
            if (
              client.url.includes(new URL(url, self.location.origin).pathname)
            )
              return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
