// public/sw.js

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive push messages from the server
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, url, icon } = data;

    event.waitUntil(
      self.registration.showNotification(title || "myDoc", {
        body: body || "",
        icon: icon || "/icon-192.png",
        badge: "/icon-192.png",
        data: { url: url || "/dashboard" },
      })
    );
  } catch (err) {
    console.error("[sw] push parse error", err);
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // If the app is already open, focus it
      for (const client of allClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          await client.focus();
          if ("navigate" in client) client.navigate(url);
          return;
        }
      }

      // Otherwise, open a new window
      if (self.clients.openWindow) {
        await self.clients.openWindow(url);
      }
    })()
  );
});