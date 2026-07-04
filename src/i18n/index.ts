import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

const savedLocale = localStorage.getItem('locale')
const browserLang = navigator.language.startsWith('en') ? 'en' : 'es'

export default createI18n({
  legacy: false,
  locale: savedLocale || browserLang,
  fallbackLocale: 'es',
  messages: { es, en }
})
