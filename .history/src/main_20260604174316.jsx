import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

// Register Service Worker
// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // قمنا بتغيير الاسم إلى sw.js لتوحيد المسارات، وتأكد أن الملف بهذا الاسم داخل مجلد public
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('SW registered successfully:', reg.scope);
      })
      .catch(err => console.log('SW registration error:', err));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)