// 1. تفعيل السيرفس وركر فوراً بمجرد تحميله دون انتظار إغلاق المتصفح
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 2. السيطرة على الصفحات المفتوحة فوراً لجعله نشطاً (Active) بدون إعادة تحميل الصفحة
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 3. الاستماع للإشعارات القادمة من السيرفر (Push Events)
self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
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
  } catch (err) {
    console.error('Error parsing push data:', err);
  }
});

// 4. التعامل مع ضغطة المستخدم على الإشعار
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // إذا كان التطبيق مفتوحاً بالفعل في الخلفية، قم بالتركيز عليه
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // إذا لم يكن مفتوحاً، قم بفتحه في نافذة جديدة
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});