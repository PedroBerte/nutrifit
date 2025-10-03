self.addEventListener("push", (event) => {
  let data = {};
  console.log("Push recebido:", event);
  try {
    if (event.data) data = event.data.json();
  } catch {
    /* payload pode ser string */
  }

  const title = data.title || "Nova notificação";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/badge.png",
    data: {
      url: data.url || "/", // para abrir ao clicar
      userId: data.userId || null, // opcional: tracking
    },
    actions: data.actions || [], // [{action:'open', title:'Abrir'}]
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
