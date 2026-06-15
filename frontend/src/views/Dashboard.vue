<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">驾驶舱</h2>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px">
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">资产总数</div>
        <div style="color: #e0e0e0; font-size: 28px; font-weight: 700">{{ stats.total ?? 0 }}</div>
      </div>
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">今日新增</div>
        <div style="color: #e0e0e0; font-size: 28px; font-weight: 700">{{ today.total ?? 0 }}</div>
      </div>
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">连续记录</div>
        <div style="color: #e0e0e0; font-size: 28px; font-weight: 700">{{ streak.streak ?? 0 }} 天</div>
      </div>
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">距上次沉淀</div>
        <div style="color: #e0e0e0; font-size: 28px; font-weight: 700">{{ stagnation.stagnation_days ?? 0 }} 天</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dashboardApi } from '../api'

const stats = ref<any>({})
const today = ref<any>({})
const streak = ref<any>({})
const stagnation = ref<any>({})

onMounted(async () => {
  try {
    const [s, t, st, sg] = await Promise.allSettled([
      dashboardApi.getStats(), dashboardApi.getToday(),
      dashboardApi.getStreak(), dashboardApi.getStagnation(),
    ])
    if (s.status === 'fulfilled') stats.value = (s.value as any)?.data || {}
    if (t.status === 'fulfilled') today.value = (t.value as any)?.data || {}
    if (st.status === 'fulfilled') streak.value = (st.value as any)?.data || {}
    if (sg.status === 'fulfilled') stagnation.value = (sg.value as any)?.data || {}
  } catch (e) {
    // 忽略
  }
})
</script>
