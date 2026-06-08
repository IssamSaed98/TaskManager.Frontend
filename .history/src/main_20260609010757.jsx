import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

// تسجيل Service Worker مع حذف القديم أولاً
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // احذف كل الـ Service Workers القديمة
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        const scriptURL = registration.active?.scriptURL || ''
        if (!scriptURL.includes('sw-notifications.js')) {
          await registration.unregister()
          console.log('🗑 Removed old SW:', scriptURL)
        }
      }

      // سجّل الـ Service Worker الجديد
      const reg = await navigator.serviceWorker.register('/sw-notifications.js', { scope: '/' })
      console.log('✅ SW registered:', reg.scope)
    } catch (err) {
      console.error('❌ SW error:', err)
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)