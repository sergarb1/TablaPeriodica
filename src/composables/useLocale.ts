import { useI18n } from 'vue-i18n'

export function useLocale() {
  const { locale } = useI18n()

  const setLocale = (lang: string) => {
    locale.value = lang
    localStorage.setItem('locale', lang)
    document.documentElement.lang = lang === 'ca' ? 'ca' : lang === 'es' ? 'es' : 'en'
  }

  return {
    currentLocale: locale,
    setLocale,
    isSpanish: () => locale.value === 'es',
    isEnglish: () => locale.value === 'en'
  }
}
