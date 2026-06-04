self.addEventListener('push', function(event) {
    if (!event.data) return;
  
    const data = event.data.json();
  
    const options = {
      body: data.body,
      icon: data.icon || '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'فتح التطبيق' },
        { action: 'close', title: 'إغلاق' }
      ]
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
  
    if (event.action === 'close') return;
  
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  });