import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'
import ca from './locales/ca.json'

const savedLocale = localStorage.getItem('locale')
const browserLang = navigator.language.startsWith('ca') ? 'ca' : navigator.language.startsWith('en') ? 'en' : 'es'

export default createI18n({
  legacy: false,
  locale: savedLocale || browserLang,
  fallbackLocale: 'es',
  messages: { es, en, ca }
})
