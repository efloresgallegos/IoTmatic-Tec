// boot/i18n.js

import { createI18n } from 'vue-i18n'
import { messages } from 'src/i18n'

// Create i18n instance outside the boot function to make it accessible
export const i18n = createI18n({
  legacy: false,
  locale: 'es-MX',
  fallbackLocale: 'es-MX',
  globalInjection: true,
  messages,
})

export const changeLanguage = (lang) => {
  i18n.global.locale.value = lang
}

export default ({ app }) => {
  app.use(i18n)
}
