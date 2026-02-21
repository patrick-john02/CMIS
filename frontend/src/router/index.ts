// frontend/src/router/index.ts
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false }
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/inventory', 
    name: 'Inventory', 
    component: () => import('@/pages/Inventory.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/stockout', 
    name: 'StockOut', 
    component: () => import('@/pages/StockOut.vue'),
    meta: { requiresAuth: true }
  },
  // ADDED ACCOUNT ROUTE HERE
  { 
    path: '/account', 
    name: 'Account', 
    component: () => import('@/pages/Account.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHashHistory(), 
  routes,
})

router.beforeEach(async (to, _from) => {
  const { isAuthenticated, verifySession } = useAuth()

  if (to.meta.requiresAuth || to.name === 'Login') {
    await verifySession()
  }

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'Login' }
  } 
  
  if (to.name === 'Login' && isAuthenticated.value) {
    return { name: 'Dashboard' }
  }

  return true
})

export default router