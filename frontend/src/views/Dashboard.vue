<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">驾驶舱</h2>

    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen" item-responsive>
      <n-gi span="4 m:1">
        <n-card :style="cardStyle">
          <n-statistic label="资产总数">
            <n-number-animation :from="0" :to="stats.total ?? 0" />
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi span="4 m:1">
        <n-card :style="cardStyle">
          <n-statistic label="今日新增">
            <n-number-animation :from="0" :to="today.total ?? 0" />
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi span="4 m:1">
        <n-card :style="cardStyle">
          <n-statistic label="连续记录">
            <n-number-animation :from="0" :to="streak.streak ?? 0" />
            <template #suffix>天</template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi span="4 m:1">
        <n-card :style="cardStyle">
          <n-statistic label="距上次沉淀">
            <n-number-animation :from="0" :to="stagnation.stagnation_days ?? 0" />
            <template #suffix>天</template>
          </n-statistic>
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid :cols="2" :x-gap="16" style="margin-top: 16px">
      <n-gi>
        <n-card title="近12月趋势" :style="cardStyle">
          <n-data-table :columns="trendColumns" :data="monthlyTrend" :bordered="false" size="small" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="资产分类占比" :style="cardStyle">
          <n-data-table :columns="ratioColumns" :data="ratioRows" :bordered="false" size="small" />
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NGrid, NGi, NCard, NStatistic, NNumberAnimation, NDataTable } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { dashboardApi } from '../api'

const cardStyle = { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)' }

const stats = ref<any>({})
const today = ref<any>({})
const streak = ref<any>({})
const stagnation = ref<any>({})
const monthlyTrend = ref<any[]>([])
const categoryRatio = ref<any>({})

const trendColumns: DataTableColumns<any> = [
  { title: '月份', key: 'month', width: 100 },
  { title: '工作案例', key: 'work_cases' },
  { title: '故障案例', key: 'fault_cases' },
  { title: '实验室', key: 'labs' },
  { title: '知识卡片', key: 'knowledge_cards' },
  { title: '合计', key: 'total' },
]

const ratioColumns: DataTableColumns<any> = [
  { title: '类别', key: 'type' },
  { title: '数量', key: 'count' },
  { title: '占比', key: 'ratio' },
]

const ratioRows = computed(() => {
  const d = categoryRatio.value
  if (!d || !d.total) return []
  return [
    { type: '工作案例', count: d.work_cases?.count || 0, ratio: ((d.work_cases?.ratio || 0) * 100).toFixed(1) + '%' },
    { type: '故障案例', count: d.fault_cases?.count || 0, ratio: ((d.fault_cases?.ratio || 0) * 100).toFixed(1) + '%' },
    { type: '实验室', count: d.labs?.count || 0, ratio: ((d.labs?.ratio || 0) * 100).toFixed(1) + '%' },
    { type: '知识卡片', count: d.knowledge_cards?.count || 0, ratio: ((d.knowledge_cards?.ratio || 0) * 100).toFixed(1) + '%' },
    { type: '项目', count: d.projects?.count || 0, ratio: ((d.projects?.ratio || 0) * 100).toFixed(1) + '%' },
  ]
})

onMounted(async () => {
  const [s, t, st, sg, mt, cr] = await Promise.allSettled([
    dashboardApi.getStats(), dashboardApi.getToday(), dashboardApi.getStreak(),
    dashboardApi.getStagnation(), dashboardApi.getMonthlyTrend(), dashboardApi.getCategoryRatio(),
  ])
  if (s.status === 'fulfilled') stats.value = (s.value as any)?.data || {}
  if (t.status === 'fulfilled') today.value = (t.value as any)?.data || {}
  if (st.status === 'fulfilled') streak.value = (st.value as any)?.data || {}
  if (sg.status === 'fulfilled') stagnation.value = (sg.value as any)?.data || {}
  if (mt.status === 'fulfilled') monthlyTrend.value = (mt.value as any)?.data || []
  if (cr.status === 'fulfilled') categoryRatio.value = (cr.value as any)?.data || {}
})
</script>
