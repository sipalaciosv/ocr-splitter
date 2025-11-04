import { createRouter, createWebHistory } from 'vue-router'
import UploadView from '../views/UploadView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    
    {
      path: '/',
      name: 'upload',
      component: UploadView,
    },
    {
        path: '/grupo/:id',
        name: 'grupo',
        component: () => import('@/views/GroupView.vue')
      }
  ],
})

export default router
