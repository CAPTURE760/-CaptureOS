<template>
  <div class="page">
    <h2 class="page-title">风险中心</h2>

    <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" item-responsive style="margin-bottom: 24px">
      <n-gi span="3 m:1">
        <n-card class="stat-card">
          <n-statistic label="风险等级">
            <span :style="{ color: riskColor, fontSize: '24px', fontWeight: 700 }">
              {{ riskStatus.level || '加载中...' }}
            </span>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi span="3 m:1">
        <n-card class="stat-card">
          <n-statistic label="停滞天数">
            <n-number-animation :from="0" :to="riskStatus.stagnationDays ?? 0" />
            <template #suffix>天</template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi span="3 m:1">
        <n-card class="stat-card">
          <n-statistic label="告警数">
            <n-number-animation :from="0" :to="alerts.length" />
          </n-statistic>
        </n-card>
      </n-gi>
    </n-grid>

    <n-card title="资产停滞详情" class="section-card" style="margin-bottom: 16px">
      <n-data-table
        :columns="alertColumns"
        :data="alerts"
        :loading="loading"
        :bordered="false"
        size="small"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import {
  NGrid, NGi, NCard, NStatistic, NNumberAnimation,
  NDataTable, NTag, useMessage,
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { riskApi } from '../api'

const message = useMessage()

const loading = ref(false)
const riskStatus = ref<any>({})
const alerts = ref<any[]>([])

const riskColor = computed(() => {
  const map: Record<string, string> = {
    '正常': '#18a058',
    '黄色': '#f0a020',
    '橙色': '#e88020',
    '红色': '#e94560',
  }
  return map[riskStatus.value.level] || '#8b949e'
})

const alertColumns: DataTableColumns<any> = [
  { title: '资产类型', key: 'assetType', width: 120 },
  { title: '天数', key: 'days', width: 80 },
  {
    title: '状态', key: 'status', width: 100,
    render(row) {
      const type = row.days > 14 ? 'error' : row.days > 7 ? 'warning' : 'success'
      const label = row.days > 14 ? '严重' : row.days > 7 ? '警告' : '正常'
      return h(NTag, { size: 'small', type: type as any, bordered: false }, { default: () => label })
    },
  },
  { title: '详情', key: 'detail', ellipsis: { tooltip: true } },
]

onMounted(async () => {
  loading.value = true
  try {
    const [statusRes, alertsRes] = await Promise.all([
      riskApi.status(),
      riskApi.alerts(),
    ])
    riskStatus.value = (statusRes as any) ?? {}
    alerts.value = (alertsRes as any) ?? []
  } catch (err: any) {
    message.error(err?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 20px;
}

.stat-card {
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.section-card {
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
