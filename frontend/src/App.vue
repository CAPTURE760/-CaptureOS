<template>
  <div class="app-layout" v-if="route.path !== '/login'">
    <el-container class="layout-container">
      <el-aside width="220px" class="sidebar">
        <div class="logo-area">
          <img src="/favicon.svg" alt="logo" class="logo-icon" />
          <span class="logo-text">CaptureOS</span>
        </div>
        <el-menu
          :default-active="route.path"
          class="side-menu"
          background-color="#16213e"
          text-color="#a0aec0"
          active-text-color="#e94560"
          router
        >
          <el-menu-item index="/">
            <el-icon><DataAnalysis /></el-icon>
            <span>驾驶舱</span>
          </el-menu-item>
          <el-menu-item index="/daily">
            <el-icon><EditPen /></el-icon>
            <span>今日记录</span>
          </el-menu-item>
          <el-menu-item index="/work-cases">
            <el-icon><Briefcase /></el-icon>
            <span>工作案例</span>
          </el-menu-item>
          <el-menu-item index="/fault-cases">
            <el-icon><Warning /></el-icon>
            <span>故障案例</span>
          </el-menu-item>
          <el-menu-item index="/labs">
            <el-icon><Flask /></el-icon>
            <span>实验室</span>
          </el-menu-item>
          <el-menu-item index="/knowledge">
            <el-icon><Collection /></el-icon>
            <span>知识卡片</span>
          </el-menu-item>
          <el-menu-item index="/projects">
            <el-icon><Folder /></el-icon>
            <span>项目资产</span>
          </el-menu-item>
          <el-menu-item index="/time">
            <el-icon><Timer /></el-icon>
            <span>时间流向</span>
          </el-menu-item>
          <el-menu-item index="/timeline">
            <el-icon><TrendCharts /></el-icon>
            <span>成长时间轴</span>
          </el-menu-item>
          <el-menu-item index="/risk">
            <el-icon><Monitor /></el-icon>
            <span>风险中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="top-header">
          <div class="header-left">
            <span class="header-title">CaptureOS - 知识资产管理系统</span>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                <span>{{ userStore.username || '未登录' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
  <router-view v-else />
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from './stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  height: 100%;
}

.sidebar {
  background-color: #16213e;
  overflow-y: auto;
  border-right: 1px solid rgba(233, 69, 96, 0.2);
}

.logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo-icon {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #e94560;
  letter-spacing: 1px;
}

.side-menu {
  border-right: none;
}

.side-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 8px;
  border-radius: 8px;
}

.side-menu .el-menu-item:hover {
  background-color: rgba(233, 69, 96, 0.1) !important;
}

.side-menu .el-menu-item.is-active {
  background-color: rgba(233, 69, 96, 0.15) !important;
  color: #e94560 !important;
}

.top-header {
  background-color: #1a1a2e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
}

.header-title {
  font-size: 16px;
  color: #a0aec0;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a0aec0;
  cursor: pointer;
  font-size: 14px;
}

.user-info:hover {
  color: #e94560;
}

.main-content {
  background-color: #0d1117;
  padding: 20px;
  overflow-y: auto;
}
</style>
