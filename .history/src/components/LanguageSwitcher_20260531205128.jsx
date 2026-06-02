import { useLanguage } from '../hooks/useLanguage'

function LanguageSwitcher() {
  const { changeLanguage, currentLang } = useLanguage()

  const languages = [
    { code: 'de', label: 'DE', flag: '🇩🇪' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'ar', label: 'AR', flag: '🇸🇦' },
  ]

  return (
    <div className="flex items-center gap-1">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all"
          style={{
            background: currentLang === lang.code
              ? 'rgba(14,165,233,0.2)'
              : 'transparent',
            color: currentLang === lang.code
              ? '#60a5fa'
              : '#3a5070',
            border: currentLang === lang.code
              ? '0.5px solid rgba(14,165,233,0.3)'
              : '0.5px solid transparent',
          }}>
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher