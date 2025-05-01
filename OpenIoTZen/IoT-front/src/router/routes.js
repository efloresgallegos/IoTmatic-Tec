const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue'), meta: { requiresAuth: true } },
      { path: 'devices', component: () => import('../pages/DevicesView.vue'), meta: { requiresAuth: true } },
      { path: 'modelGenerator', component: () => import('../pages/ModelCreatorView.vue'), meta: { requiresAuth: true } },
      { path: 'settings', component: () => import('../pages/SettingsView.vue'), meta: { requiresAuth: true } },
      { path: 'users', component: () => import('../pages/UserConfiguration.vue'), meta: { requiresAuth: true } },
      { path: 'about', component: () => import('../pages/AboutUs.vue'), meta: { requiresAuth: true } },
      { path: 'devices/:id', component: () => import('../pages/DeviceView.vue'), meta: { requiresAuth: true } },
      { path: '/alerts', component: () => import('../pages/AlertsAndFiltersView.vue'), meta: { requiresAuth: true } },
      { path: '/models', component: () => import('../pages/ModelsView.vue'), meta: { requiresAuth: true } },
      { path: '/filters', component: () => import('../pages/FilterManagementPage.vue'), meta: { requiresAuth: true } },
    ]
  },
  {
    path: '/login',
    component: () => import('../pages/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },

  // Always leave this as last one,
  // but you can also remove it

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes