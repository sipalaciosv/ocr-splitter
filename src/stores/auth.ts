import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  let inited = false

  function init() {
    if (inited) return
    inited = true
    onAuthStateChanged(auth, (u) => {
      user.value = u
      loading.value = false
    })
  }
  init()

  async function waitForInit() {
    if (!loading.value) return

    if (typeof (auth as any).authStateReady === 'function') {
      await (auth as any).authStateReady()
    } else {
      await new Promise<void>((resolve) => {
        const off = onAuthStateChanged(auth, () => {
          off()
          resolve()
        })
      })
    }
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }
  async function signUp(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password)
  }
  async function signOutApp() {
    await signOut(auth)
  }

  return { user, loading, waitForInit, signIn, signUp, signOutApp }
})
