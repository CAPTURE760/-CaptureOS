<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">风险中心</h2>

    <!-- 状态卡片 -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px">
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">风险等级</div>
        <div :style="{ color: riskColor, fontSize: '24px', fontWeight: 700 }">{{ riskStatus.level || '加载中...' }}</div>
      </div>
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">停滞天数</div>
        <div style="color: #e0e0e0; font-size: 24px; font-weight: 700">{{ riskStatus.stagnationDays ?? 0 }} 天</div>
      </div>
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">告警数</div>
        <div style="color: #e0e0e0; font-size: 24px; font-weight: 700">{{ alerts.length }}</div>
      </div>
    </div>

    <!-- 告警表格 -->
    <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; overflow: hidden">
      <div style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.06)">
        <span style="color: #e0e0e0; font-weight: 600; font-size: 15px">资产停滞详情</span>
      </div>
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr style="background: #1a1a2e">
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">资产类型</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">天数</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">状态</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">详情</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in alerts" :key="item.assetType" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.assetType }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.days }}</td>
            <td style="padding: 12px 16px">
              <span :style="{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', ...alertStatusStyle(item.days) }">{{ alertStatusLabel(item.days) }}</span>
            </td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.detail }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!alerts.length && !loading" style="padding: 40px; text-align: center; color: #a0aec0">暂无告警</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { riskApi } from '../api'

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

function alertStatusLabel(days: number): string {
  if (days > 14) return '严重'
  if (days > 7) return '警告'
  return '正常'
}

function alertStatusStyle(days: number) {
  if (days > 14) return { background: 'rgba(233,69,96,0.15)', color: '#e94560' }
  if (days > 7) return { background: 'rgba(240,160,32,0.15)', color: '#f0a020' }
  return { background: 'rgba(24,160,88,0.15)', color: '#18a058' }
}

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
    alert(err?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
})
</script>
