import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory('/TablaPeriodica/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue')
    },
    {
      path: '/table',
      name: 'table',
      component: () => import('@/pages/TablePage.vue')
    },
    {
      path: '/element/:id',
      name: 'element',
      component: () => import('@/pages/ElementPage.vue'),
      props: true
    },
    {
      path: '/learn',
      name: 'learn',
      component: () => import('@/pages/LearnPage.vue')
    },
    {
      path: '/games',
      name: 'games',
      component: () => import('@/pages/GamesPage.vue')
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('@/pages/ProgressPage.vue')
    },
    {
      path: '/lab',
      name: 'lab',
      component: () => import('@/pages/LabPage.vue')
    },
    {
      path: '/flashcards',
      name: 'flashcards',
      component: () => import('@/pages/FlashcardsPage.vue')
    },
    {
      path: '/compare',
      name: 'compare',
      component: () => import('@/pages/ComparePage.vue')
    },
    {
      path: '/guide',
      name: 'guide',
      component: () => import('@/pages/GuidePage.vue')
    }
  ]
})

export default router
