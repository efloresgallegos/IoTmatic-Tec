import { createApp } from 'vue' // Importar Vue
import App from './App.vue' // Importar el componente principal
import { createPinia } from 'pinia' // Importar Pinia

const app = createApp(App)

// Usar los plugins Pinia y Vue-i18n
app.use(createPinia())

// Montar la app
app.mount('#app')
