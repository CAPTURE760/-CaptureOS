<template>
  <div style="display: flex; height: 100vh">
    <!-- 侧边栏 -->
    <div style="width: 220px; background: #16213e; overflow-y: auto; flex-shrink: 0">
      <div style="padding: 20px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.06)">
        <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #e94560, #c0392b); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff">C</div>
        <span style="font-size: 18px; font-weight: 700; color: #e0e0e0">CaptureOS</span>
      </div>
      <div style="padding: 8px">
        <div v-for="item in menuItems" :key="item.path"
          @click="$router.push(item.path)"
          :style="{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', color: route.path === item.path ? '#e94560' : '#a0aec0', background: route.path === item.path ? 'rgba(233,69,96,0.15)' : 'transparent', marginBottom: '4px' }"
        >
          {{ item.label }}
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden">
      <!-- 顶栏 -->
      <div style="height: 60px; background: #1a1a2e; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; flex-shrink: 0">
        <span style="font-size: 16px; color: #a0aec0">CaptureOS</span>
        <span style="color: #a0aec0; cursor: pointer" @click="logout">{{ userStore.username || '用户' }} ▾</span>
      </div>
      <!-- 内容区 -->
      <div style="flex: 1; background: #0d1117; padding: 20px; overflow-y: auto">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menuItems = [
  { path: '/', label: '🏠 驾驶舱' },
  { path: '/daily', label: '📝 今日记录' },
  { path: '/work-cases', label: '📋 工作案例' },
  { path: '/fault-cases', label: '🔧 故障案例' },
  { path: '/labs', label: '🧪 实验室' },
  { path: '/knowledge', label: '🃏 知识卡片' },
  { path: '/projects', label: '📂 项目资产' },
  { path: '/time', label: '⏰ 时间流向' },
  { path: '/timeline', label: '📈 成长时间轴' },
  { path: '/risk', label: '⚠️ 风险中心' },
]

function logout() {
  userStore.logout()
}
</script>
