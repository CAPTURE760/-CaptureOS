<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>驾驶舱</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: rgba(233,69,96,0.15); color: #e94560">
            <el-icon :size="28"><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total || 0 }}</div>
            <div class="stat-label">资产总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: rgba(0,194,146,0.15); color: #00c292">
            <el-icon :size="28"><Plus /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ today.total || 0 }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: rgba(255,187,51,0.15); color: #ffbb33">
            <el-icon :size="28"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ streak.streak || 0 }} 天</div>
            <div class="stat-label">连续记录</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" :style="stagnationStyle">
            <el-icon :size="28"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stagnation.stagnation_days ?? '-' }} 天</div>
            <div class="stat-label">距上次沉淀</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>近 12 个月资产增长趋势</span>
          </template>
          <div class="chart-wrapper">
            <Line v-if="trendReady" :data="trendData" :options="lineOptions" />
            <el-empty v-else description="暂无数据" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>资产分类占比</span>
          </template>
          <div class="chart-wrapper">
            <Doughnut v-if="ratioReady" :data="ratioData" :options="doughnutOptions" />
            <el-empty v-else description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { getStats, getToday, getStreak, getStagnation, getMonthlyTrend, getCategoryRatio } from '../api/dashboard'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const stats = ref({})
const today = ref({})
const streak = ref({})
const stagnation = ref({})
const monthlyTrend = ref([])
const categoryRatio = ref({})

// 停滞天数颜色
const stagnationStyle = computed(() => {
  const days = stagnation.value.stagnation_days
  if (days == null) return { background: 'rgba(160,174,192,0.15)', color: '#a0aec0' }
  if (days <= 3) return { background: 'rgba(0,194,146,0.15)', color: '#00c292' }
  if (days <= 7) return { background: 'rgba(255,187,51,0.15)', color: '#ffbb33' }
  return { background: 'rgba(233,69,96,0.15)', color: '#e94560' }
})

// 趋势图数据
const trendReady = computed(() => monthlyTrend.value.length > 0)
const trendData = computed(() => ({
  labels: monthlyTrend.value.map(i => i.month),
  datasets: [
    {
      label: '工作案例',
      data: monthlyTrend.value.map(i => i.work_cases),
      borderColor: '#e94560',
      backgroundColor: 'rgba(233,69,96,0.1)',
      fill: true,
      tension: 0.4
    },
    {
      label: '故障案例',
      data: monthlyTrend.value.map(i => i.fault_cases),
      borderColor: '#00c292',
      backgroundColor: 'rgba(0,194,146,0.1)',
      fill: true,
      tension: 0.4
    },
    {
      label: '实验室',
      data: monthlyTrend.value.map(i => i.labs),
      borderColor: '#ffbb33',
      backgroundColor: 'rgba(255,187,51,0.1)',
      fill: true,
      tension: 0.4
    },
    {
      label: '知识卡片',
      data: monthlyTrend.value.map(i => i.knowledge_cards),
      borderColor: '#4fc3f7',
      backgroundColor: 'rgba(79,195,247,0.1)',
      fill: true,
      tension: 0.4
    }
  ]
}))

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#a0aec0' } }
  },
  scales: {
    x: { ticks: { color: '#a0aec0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#a0aec0', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
  }
}

// 饼图数据
const ratioReady = computed(() => {
  const d = categoryRatio.value
  return d && d.total > 0
})
const ratioData = computed(() => {
  const d = categoryRatio.value
  return {
    labels: ['工作案例', '故障案例', '实验室', '知识卡片', '项目资产'],
    datasets: [{
      data: [
        d.work_cases?.count || 0,
        d.fault_cases?.count || 0,
        d.labs?.count || 0,
        d.knowledge_cards?.count || 0,
        d.projects?.count || 0
      ],
      backgroundColor: ['#e94560', '#00c292', '#ffbb33', '#4fc3f7', '#ab47bc'],
      borderWidth: 0
    }]
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#a0aec0', padding: 16 }
    }
  }
}

onMounted(async () => {
  const [s, t, st, sg, mt, cr] = await Promise.allSettled([
    getStats(), getToday(), getStreak(), getStagnation(), getMonthlyTrend(), getCategoryRatio()
  ])
  if (s.status === 'fulfilled') stats.value = s.value?.data || {}
  if (t.status === 'fulfilled') today.value = t.value?.data || {}
  if (st.status === 'fulfilled') streak.value = st.value?.data || {}
  if (sg.status === 'fulfilled') stagnation.value = sg.value?.data || {}
  if (mt.status === 'fulfilled') monthlyTrend.value = mt.value?.data || []
  if (cr.status === 'fulfilled') categoryRatio.value = cr.value?.data || {}
})
</script>

<style scoped>
.dashboard {
  color: #e0e0e0;
}

.page-header h2 {
  margin: 0 0 20px 0;
  font-size: 22px;
  color: #e0e0e0;
}

.stat-cards .el-card {
  background-color: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 0;
}

.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #e0e0e0;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #a0aec0;
  margin-top: 4px;
}

.chart-card {
  background-color: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.chart-card :deep(.el-card__header) {
  color: #e0e0e0;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.chart-wrapper {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
