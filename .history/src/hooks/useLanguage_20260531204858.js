import { useTranslation } from 'react-i18next'

export const useLanguage = () => {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  const currentLang = i18n.language

  const isRTL = currentLang === 'ar'

  return { t, changeLanguage, currentLang, isRTL }
}