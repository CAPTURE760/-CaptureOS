<template>
  <div class="risk-center">
    <div class="page-header">
      <h2>风险中心</h2>
    </div>

    <!-- 状态卡片 -->
    <div class="status-card" :class="statusClass">
      <div class="status-content">
        <div class="status-icon">
          <el-icon :size="64"><Monitor /></el-icon>
        </div>
        <div class="status-info">
          <h1>{{ status.emoji }} {{ status.level || '正常' }}</h1>
          <p class="status-desc">{{ status.message || '系统运行正常' }}</p>
        </div>
      </div>
    </div>

    <!-- 指标卡片 -->
    <div class="card-row card-row-2" style="margin-top: 20px">
      <div class="stat-card">
        <div class="stat-icon"><el-icon><AlarmClock /></el-icon></div>
        <div class="stat-value">{{ status.stagnation_days ?? '-' }}</div>
        <div class="stat-label">资产停滞天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><el-icon><Calendar /></el-icon></div>
        <div class="stat-value">{{ maxStagnation }}</div>
        <div class="stat-label">最长停滞天数</div>
      </div>
    </div>

    <!-- 风险级别说明 -->
    <el-card style="margin-top: 20px">
      <template #header><span>风险级别说明</span></template>
      <div class="risk-legend">
        <div class="legend-item">
          <span class="dot green"></span>
          <span class="legend-label">正常</span>
          <span class="legend-desc">0-2天内有过新增资产</span>
        </div>
        <div class="legend-item">
          <span class="dot yellow"></span>
          <span class="legend-label">黄色预警</span>
          <span class="legend-desc">3-6天未新增资产</span>
        </div>
        <div class="legend-item">
          <span class="dot orange"></span>
          <span class="legend-label">橙色预警</span>
          <span class="legend-desc">7-13天未新增资产</span>
        </div>
        <div class="legend-item">
          <span class="dot red"></span>
          <span class="legend-label">红色预警</span>
          <span class="legend-desc">超过14天未新增资产</span>
        </div>
      </div>
    </el-card>

    <!-- 各资产类别停滞详情 -->
    <el-card style="margin-top: 20px">
      <template #header><span>各资产类别停滞详情</span></template>
      <el-table :data="alertsList" stripe style="width: 100%">
        <el-table-column prop="asset_type" label="资产类型" width="120" />
        <el-table-column prop="stagnation_days" label="停滞天数" width="100">
          <template #default="{ row }">
            <span>{{ row.stagnation_days ?? '从未记录' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="last_activity" label="最近活动" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="riskTagType(row.risk?.color)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="建议" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.risk?.message || '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStatus, getAlerts } from '../api/risk'

const status = ref({})
const alertsData = ref({})
const maxStagnation = ref('-')

const alertsList = computed(() => alertsData.value.alerts || [])

const statusClass = computed(() => {
  const color = status.value.color || 'green'
  return `status-${color}`
})

const riskTagType = (color) => ({
  green: 'success', yellow: 'warning', orange: 'danger', red: 'danger'
}[color] || 'info')

const loadData = async () => {
  try {
    const [s, a] = await Promise.allSettled([getStatus(), getAlerts()])
    if (s.status === 'fulfilled') status.value = s.value?.data || {}
    if (a.status === 'fulfilled') {
      alertsData.value = a.value?.data || {}
      maxStagnation.value = alertsData.value.max_stagnation_days ?? '-'
    }
  } catch (e) { /* silent */ }
}

onMounted(loadData)
</script>

<style scoped>
.status-card {
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
}

.status-green {
  background: linear-gradient(135deg, #0f3460 0%, #1a472a 100%);
  border: 2px solid #26a69a;
}

.status-yellow {
  background: linear-gradient(135deg, #0f3460 0%, #4a3c0f 100%);
  border: 2px solid #f5a623;
}

.status-orange {
  background: linear-gradient(135deg, #0f3460 0%, #4a2c0f 100%);
  border: 2px solid #ff7043;
}

.status-red {
  background: linear-gradient(135deg, #0f3460 0%, #4a0f0f 100%);
  border: 2px solid #e94560;
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.status-icon {
  color: #a0aec0;
}

.status-info h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  color: #e0e0e0;
}

.status-desc {
  color: #a0aec0;
  font-size: 16px;
  margin-top: 8px;
}

.status-card.status-green .status-icon { color: #26a69a; }
.status-card.status-yellow .status-icon { color: #f5a623; }
.status-card.status-orange .status-icon { color: #ff7043; }
.status-card.status-red .status-icon { color: #e94560; }

.risk-legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.green { background-color: #26a69a; }
.dot.yellow { background-color: #f5a623; }
.dot.orange { background-color: #ff7043; }
.dot.red { background-color: #e94560; }

.legend-label {
  color: #e0e0e0;
  font-weight: 500;
  min-width: 80px;
}

.legend-desc {
  color: #a0aec0;
  font-size: 13px;
}
</style>
