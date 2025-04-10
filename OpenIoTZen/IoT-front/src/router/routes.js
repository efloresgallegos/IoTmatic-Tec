const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue') },
      { path: 'devices', component: () => import('../pages/DevicesView.vue') },
      { path: 'modelGenerator', component: () => import('../pages/ModelCreatorView.vue') },
      { path: 'settings', component: () => import('../pages/UserConfiguration.vue') },
      { path: 'about', component: () => import('../pages/AboutUs.vue') },
      { path: 'devices/:id', component: () => import('../pages/DeviceView.vue') },
      { path: '/alerts', component: () => import('../pages/AlertsAndFiltersView.vue') },
      { path: '/models', component: () => import('../pages/ModelsView.vue') },
    ]
  },
  {
    path: '/login',
    component: () => import('../pages/auth/LoginView.vue')
  },

  // Always leave this as last one,
  // but you can also remove it

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes