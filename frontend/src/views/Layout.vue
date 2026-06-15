<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider
      bordered
      :width="220"
      :native-scrollbar="false"
      style="background-color: #16213e"
    >
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">C</div>
        <span class="sidebar-logo-text">CaptureOS</span>
      </div>
      <n-menu
        :value="activeMenu"
        :options="menuOptions"
        :default-expanded-keys="[]"
        @update:value="onMenuSelect"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered style="background-color: #1a1a2e; height: 60px">
        <div class="header-bar">
          <span class="header-title">CaptureOS</span>
          <n-dropdown :options="dropdownOptions" @select="onDropdownSelect">
            <n-button quaternary>
              <template #icon>
                <n-icon><PersonCircleOutline /></n-icon>
              </template>
              {{ userStore.username || '用户' }}
            </n-button>
          </n-dropdown>
        </div>
      </n-layout-header>

      <n-layout-content
        content-style="padding: 20px;"
        :native-scrollbar="false"
        style="background-color: #0d1117; height: calc(100vh - 60px)"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout, NLayoutSider, NLayoutHeader, NLayoutContent,
  NMenu, NButton, NDropdown, NIcon,
} from 'naive-ui'
import type { MenuOption, DropdownOption } from 'naive-ui'
import {
  BarChart,
  Create,
  Briefcase,
  Warning,
  Flask,
  Book,
  Folder,
  Time,
  TrendingUp,
  AlertCircle,
  PersonCircleOutline,
  LogOutOutline,
} from '@vicons/ionicons5'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  { label: '驾驶舱', key: '/', icon: renderIcon(BarChart) },
  { label: '今日记录', key: '/daily', icon: renderIcon(Create) },
  { label: '工作案例', key: '/work-cases', icon: renderIcon(Briefcase) },
  { label: '故障案例', key: '/fault-cases', icon: renderIcon(Warning) },
  { label: '实验室', key: '/labs', icon: renderIcon(Flask) },
  { label: '知识卡片', key: '/knowledge', icon: renderIcon(Book) },
  { label: '项目资产', key: '/projects', icon: renderIcon(Folder) },
  { label: '时间流向', key: '/time', icon: renderIcon(Time) },
  { label: '成长时间轴', key: '/timeline', icon: renderIcon(TrendingUp) },
  { label: '风险中心', key: '/risk', icon: renderIcon(AlertCircle) },
]

const activeMenu = computed(() => route.path)

function onMenuSelect(key: string) {
  router.push(key)
}

const dropdownOptions: DropdownOption[] = [
  { label: '退出登录', key: 'logout', icon: renderIcon(LogOutOutline) },
]

function onDropdownSelect(key: string) {
  if (key === 'logout') {
    userStore.logout()
  }
}
</script>

<style scoped>
.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 20px 16px;
  gap: 10px;
}

.sidebar-logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e94560, #c0392b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.sidebar-logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #e0e0e0;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
}
</style>
