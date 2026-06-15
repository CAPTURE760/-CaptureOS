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
          <h1>{{ status.label || '正常' }}</h1>
          <p class="status-desc">{{ status.description || '系统运行正常' }}</p>
        </div>
      </div>
    </div>

    <!-- 指标卡片 -->
    <div class="card-row card-row-2" style="margin-top: 20px">
      <div class="stat-card">
        <div class="stat-icon"><el-icon><AlarmClock /></el-icon></div>
        <div class="stat-value">{{ status.stagnation_days || 0 }}</div>
        <div class="stat-label">资产停滞天数</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><el-icon><Calendar /></el-icon></div>
        <div class="stat-value">{{ status.last_asset_date || '-' }}</div>
        <div class="stat-label">最近新增资产时间</div>
      </div>
    </div>

    <!-- 风险级别说明 -->
    <el-card style="margin-top: 20px">
      <template #header><span>风险级别说明</span></template>
      <div class="risk-legend">
        <div class="legend-item">
          <span class="dot green"></span>
          <span class="legend-label">正常</span>
          <span class="legend-desc">7天内有过新增资产</span>
        </div>
        <div class="legend-item">
          <span class="dot yellow"></span>
          <span class="legend-label">黄色预警</span>
          <span class="legend-desc">7-14天未新增资产</span>
        </div>
        <div class="legend-item">
          <span class="dot orange"></span>
          <span class="legend-label">橙色预警</span>
          <span class="legend-desc">14-30天未新增资产</span>
        </div>
        <div class="legend-item">
          <span class="dot red"></span>
          <span class="legend-label">红色预警</span>
          <span class="legend-desc">超过30天未新增资产</span>
        </div>
      </div>
    </el-card>

    <!-- 告警列表 -->
    <el-card style="margin-top: 20px">
      <template #header><span>最近告警</span></template>
      <el-table :data="alerts" stripe style="width: 100%">
        <el-table-column prop="created_at" label="时间" width="170" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="alertType(row.level)">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="告警内容" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getStatus, getAlerts } from '../api/risk'

const status = ref({})
const alerts = ref([])

const statusClass = computed(() => {
  const level = status.value.level || 'normal'
  const map = {
    normal: 'status-green',
    yellow: 'status-yellow',
    orange: 'status-orange',
    red: 'status-red'
  }
  return map[level] || 'status-green'
})

const alertType = (level) => ({
  '黄色': 'warning', '橙色': 'danger', '红色': 'danger', '正常': 'success'
}[level] || 'info')

const loadData = async () => {
  try {
    const [s, a] = await Promise.allSettled([getStatus(), getAlerts()])
    if (s.status === 'fulfilled') status.value = s.value
    if (a.status === 'fulfilled') alerts.value = a.value || []
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
  color: var(--text-primary);
}

.status-desc {
  color: var(--text-secondary);
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
  color: var(--text-primary);
  font-weight: 500;
  min-width: 80px;
}

.legend-desc {
  color: var(--text-muted);
  font-size: 13px;
}
</style>
