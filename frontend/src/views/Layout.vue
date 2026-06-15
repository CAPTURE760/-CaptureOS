<template>
  <div style="display: flex; height: 100vh">
    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 99; display: none" class="mobile-overlay"></div>

    <!-- 侧边栏 -->
    <div :style="sidebarStyle" :class="{ open: sidebarOpen }" class="sidebar">
      <div style="padding: 20px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.06)">
        <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #e94560, #c0392b); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff">C</div>
        <span style="font-size: 18px; font-weight: 700; color: #e0e0e0">CaptureOS</span>
      </div>
      <div style="padding: 8px">
        <div v-for="item in menuItems" :key="item.path"
          @click="$router.push(item.path); sidebarOpen = false"
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
        <div style="display: flex; align-items: center; gap: 12px">
          <span style="font-size: 24px; cursor: pointer; display: none" class="hamburger" @click="sidebarOpen = !sidebarOpen">&#9776;</span>
          <!-- 全局搜索 -->
          <div style="position: relative">
            <input v-model="searchQuery" @input="onSearchInput" @focus="showResults = true" @keyup.enter="goToFirstResult"
              placeholder="全局搜索..."
              style="padding: 6px 12px; padding-left: 30px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; width: 240px; font-size: 13px" />
            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #8b949e; font-size: 13px">&#128269;</span>
            <!-- 搜索结果下拉 -->
            <div v-if="showResults && searchResults.length > 0"
              style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; max-height: 400px; overflow-y: auto; z-index: 200; box-shadow: 0 8px 24px rgba(0,0,0,0.4)">
              <div v-for="item in searchResults" :key="item.type + '-' + item.id"
                @click="goToResult(item)"
                style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; display: flex; align-items: center; gap: 10px"
                @mouseenter="$event.target.style.background = 'rgba(233,69,96,0.1)'"
                @mouseleave="$event.target.style.background = 'transparent'"
              >
                <span style="font-size: 16px">{{ typeIcon(item.type) }}</span>
                <div style="flex: 1; min-width: 0">
                  <div style="color: #e0e0e0; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ item.title }}</div>
                  <div style="color: #8b949e; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">{{ typeName(item.type) }} · {{ item.subtitle || '' }}</div>
                </div>
              </div>
            </div>
            <div v-else-if="showResults && searchQuery && !searching"
              style="position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; text-align: center; color: #8b949e; font-size: 13px; z-index: 200">
              未找到相关结果
            </div>
          </div>
        </div>
        <span style="color: #a0aec0; cursor: pointer" @click="logout">{{ userStore.username || '用户' }} &#9662;</span>
      </div>
      <!-- 内容区 -->
      <div style="flex: 1; background: #0d1117; padding: 20px; overflow-y: auto" @click="showResults = false">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { searchApi } from '../api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const sidebarOpen = ref(false)

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const showResults = ref(false)
const searching = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searching.value = true
  searchTimer = setTimeout(async () => {
    try {
      const res = await searchApi.search(searchQuery.value) as any
      const d = res.data ?? res
      searchResults.value = d.results ?? []
    } catch {
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

function goToResult(item: any) {
  showResults.value = false
  searchQuery.value = ''
  const routeMap: Record<string, string> = {
    work_case: '/work-cases',
    fault_case: '/fault-cases',
    knowledge: '/knowledge',
    project: '/projects',
    daily_log: '/daily',
    timeline: '/timeline',
  }
  router.push(routeMap[item.type] || '/')
}

function goToFirstResult() {
  if (searchResults.value.length > 0) {
    goToResult(searchResults.value[0])
  }
}

function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    work_case: '📋',
    fault_case: '🔧',
    knowledge: '🃏',
    project: '📂',
    daily_log: '📝',
    timeline: '📈',
  }
  return icons[type] || '📄'
}

function typeName(type: string): string {
  const names: Record<string, string> = {
    work_case: '工作案例',
    fault_case: '故障案例',
    knowledge: '知识卡片',
    project: '项目',
    daily_log: '今日记录',
    timeline: '时间轴',
  }
  return names[type] || type
}

const sidebarStyle = computed(() => ({
  width: '220px',
  background: '#16213e',
  overflowY: 'auto',
  flexShrink: '0',
  transition: 'transform 0.3s ease',
}))

const menuItems = [
  { path: '/', label: '🏠 驾驶舱' },
  { path: '/daily', label: '📝 今日记录' },
  { path: '/work-cases', label: '📋 工作案例' },
  { path: '/fault-cases', label: '🔧 故障案例' },
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

<style>
@media (max-width: 768px) {
  .sidebar {
    position: fixed !important;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .hamburger {
    display: inline-block !important;
  }
  .mobile-overlay {
    display: block !important;
  }
  .table-wrapper {
    overflow-x: auto;
  }
}
</style>
