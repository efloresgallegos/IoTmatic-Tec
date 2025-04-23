import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from '../stores/auth-store'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Guardia de navegación para proteger rutas
  Router.beforeEach((to, from, next) => {
    // Usar el store de autenticación importado al inicio del archivo
    const authStore = useAuthStore();
    
    // Verificar si la ruta requiere autenticación
    const authRequired = to.matched.some(record => record.meta.requiresAuth);
    
    // Verificar autenticación usando el store
    const isAuthenticated = authStore.checkAuth();

    // Redirigir al login si se requiere autenticación y el usuario no está logueado
    if (authRequired && !isAuthenticated) {
      return next('/login');
    }

    // Si está en login y ya está autenticado, redirigir al inicio
    if (to.path === '/login' && isAuthenticated) {
      return next('/');
    }

    next();
  });
  return Router
})
