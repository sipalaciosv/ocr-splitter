import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UploadView from '../views/UploadView.vue'
import LoginView from '../views/LoginView.vue'
import JoinGroupView from '../views/JoinGroupView.vue'
import { useAuthStore } from '@/stores/auth'
import { isMember } from '@/services/db'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },

    { path: '/app', name: 'upload', component: UploadView },

    { path: '/login', name: 'login', component: LoginView },
    { path: '/join/:id', name: 'join', component: JoinGroupView },
    {
      path: '/grupo/:id',
      name: 'grupo',
      component: () => import('@/views/GroupView.vue'),
      beforeEnter: async (to) => {
        const auth = useAuthStore()
        await auth.waitForInit()

        const id = String(to.params.id)
        if (!auth.user) {
          return { name: 'login', query: { redirect: to.fullPath } }
        }
        const ok = await isMember(id, auth.user.uid)
        if (!ok) return { name: 'join', params: { id } }
        return true
      }
    },
  ],
})

export default router
