// ===============================
// SERVICE WORKER FOR PUSH NOTIFICATIONS
// ===============================

self.addEventListener("install", () => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("Service Worker activated");
});

// 🔔 LISTEN FOR PUSH EVENTS
self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || "New update available",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/"
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "CollegeCart",
      options
    )
  );
});

// 👉 WHEN USER CLICKS NOTIFICATION
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
