
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

if ('serviceWorker' in navigator) {

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-notifications.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW error:', err))
})
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)