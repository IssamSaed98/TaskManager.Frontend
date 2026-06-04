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
  
 // تفعيل السيرفس وركر فوراً بمجرد تثبيته دون انتظار إغلاق المتصفح
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// بقية كودك القديم كما هو تماماً دون أي تغيير سفلي:
self.addEventListener('push', function(event) {
    if (!event.data) return;
    const data = event.data.json();
    // ... بقية الكود القديم