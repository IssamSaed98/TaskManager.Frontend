import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'

function LanguageSwitcher() {
  const { changeLanguage, currentLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const languages = [
    { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'ar', label: 'AR', flag: '🇸🇦', name: 'العربية' },
  ]

  const current = languages.find(l => l.code === currentLang) || languages[0]

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
        style={{
          background: 'rgba(14,165,233,0.08)',
          border: '0.5px solid rgba(14,165,233,0.2)',
          color: '#60a5fa',
        }}>
        <span className="text-sm">{current.flag}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: '8px', opacity: 0.6 }}>{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div className="absolute z-50 rounded-xl overflow-hidden"
          style={{
            background: '#0a0f1a',
            border: '0.5px solid rgba(14,165,233,0.15)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
            minWidth: '130px',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => { changeLanguage(lang.code); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all"
              style={{
                background: currentLang === lang.code ? 'rgba(14,165,233,0.1)' : 'transparent',
                color: currentLang === lang.code ? '#60a5fa' : '#4a6080',
                borderBottom: '0.5px solid rgba(14,165,233,0.05)',
              }}>
              <span className="text-base">{lang.flag}</span>
              <div className="text-left">
                <div className="font-medium">{lang.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.5 }}>{lang.name}</div>
              </div>
              {currentLang === lang.code && (
                <span className="mr-auto" style={{ color: '#60a5fa' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher