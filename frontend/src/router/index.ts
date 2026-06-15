import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: 'daily',
        name: 'DailyLog',
        component: () => import('../views/DailyLog.vue'),
      },
      {
        path: 'work-cases',
        name: 'WorkCases',
        component: () => import('../views/WorkCases.vue'),
      },
      {
        path: 'fault-cases',
        name: 'FaultCases',
        component: () => import('../views/FaultCases.vue'),
      },
      {
        path: 'labs',
        name: 'Labs',
        component: () => import('../views/Labs.vue'),
      },
      {
        path: 'knowledge',
        name: 'Knowledge',
        component: () => import('../views/Knowledge.vue'),
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('../views/Projects.vue'),
      },
      {
        path: 'time',
        name: 'TimeRecord',
        component: () => import('../views/TimeRecord.vue'),
      },
      {
        path: 'timeline',
        name: 'Timeline',
        component: () => import('../views/Timeline.vue'),
      },
      {
        path: 'risk',
        name: 'RiskCenter',
        component: () => import('../views/RiskCenter.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
