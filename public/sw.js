// DSA Tracker Service Worker — handles push notifications

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "DSA Tracker", body: event.data.text() };
  }

  const options = {
    body: data.body ?? "Time to solve a problem!",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.tag ?? "dsa-reminder",
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
    data: {
      url: data.url ?? "/dashboard",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "DSA Tracker", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
