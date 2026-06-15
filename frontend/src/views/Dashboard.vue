<template>
  <div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px">
      <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0">驾驶舱</h2>
      <div style="display: flex; gap: 8px">
        <button @click="handleExport" style="padding: 8px 16px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #a0aec0; cursor: pointer">&#128230; 导出数据</button>
        <label style="padding: 8px 16px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #a0aec0; cursor: pointer">&#128228; 导入数据
          <input type="file" accept=".json" @change="handleImport" style="display: none" />
        </label>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px">
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">资产总数</div>
        <div style="color: #e0e0e0; font-size: 28px; font-weight: 700">{{ stats.total ?? 0 }}</div>
      </div>
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <div style="color: #a0aec0; font-size: 14px; margin-bottom: 8px">今日新增</div>
        <div style="color: #e0e0e0; font-size: 28px; font-weight: 700">{{ todayTotal }}</div>
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

    <!-- 图表区域 -->
    <div class="charts-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px">
      <!-- 月度趋势折线图 -->
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <h3 style="color: #e0e0e0; font-size: 16px; margin-bottom: 16px">月度趋势</h3>
        <div v-if="monthlyData.length" style="position: relative">
          <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" style="width: 100%; height: auto">
            <!-- 网格线 -->
            <line v-for="i in 5" :key="'grid-'+i"
              :x1="paddingLeft" :y1="paddingTop + (i-1) * gridStep"
              :x2="chartWidth - paddingRight" :y2="paddingTop + (i-1) * gridStep"
              stroke="rgba(255,255,255,0.06)" stroke-width="1" />
            <!-- Y 轴标签 -->
            <text v-for="i in 5" :key="'ylabel-'+i"
              :x="paddingLeft - 8" :y="paddingTop + (i-1) * gridStep + 4"
              fill="#8b949e" font-size="11" text-anchor="end">{{ maxVal - (i-1) * yStep }}</text>
            <!-- 折线 -->
            <polyline v-for="(line, li) in trendLines" :key="'line-'+li"
              :points="line.points"
              fill="none" :stroke="line.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <!-- 数据点 -->
            <circle v-for="(dot, di) in trendDots" :key="'dot-'+di"
              :cx="dot.x" :cy="dot.y" r="3" :fill="dot.color" />
            <!-- X 轴标签 -->
            <text v-for="(label, li) in xLabels" :key="'xlabel-'+li"
              :x="label.x" :y="chartHeight - 4"
              fill="#8b949e" font-size="10" text-anchor="middle">{{ label.text }}</text>
          </svg>
          <!-- 图例 -->
          <div style="display: flex; gap: 16px; justify-content: center; margin-top: 8px">
            <span v-for="(item, i) in legendItems" :key="i" style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #a0aec0">
              <span :style="{ display: 'inline-block', width: '12px', height: '3px', background: item.color, borderRadius: '2px' }"></span>
              {{ item.label }}
            </span>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 40px; color: #8b949e">暂无数据</div>
      </div>

      <!-- 资产比例饼图 -->
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px">
        <h3 style="color: #e0e0e0; font-size: 16px; margin-bottom: 16px">资产分布</h3>
        <div v-if="ratioData.total > 0" style="display: flex; flex-direction: column; align-items: center; gap: 16px">
          <div :style="pieStyle" style="width: 140px; height: 140px; border-radius: 50%; position: relative">
            <div style="position: absolute; inset: 30px; background: #161b22; border-radius: 50%"></div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%">
            <div v-for="item in ratioItems" :key="item.key" style="display: flex; align-items: center; justify-content: space-between; font-size: 13px">
              <span style="display: flex; align-items: center; gap: 6px; color: #a0aec0">
                <span :style="{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: item.color }"></span>
                {{ item.label }}
              </span>
              <span style="color: #e0e0e0">{{ item.count }} <span style="color: #8b949e">({{ item.ratio }}%)</span></span>
            </div>
          </div>
        </div>
        <div v-else style="text-align: center; padding: 40px; color: #8b949e">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { dashboardApi } from '../api'

const stats = ref<any>({})
const today = ref<any>({})
const streak = ref<any>({})
const stagnation = ref<any>({})
const monthlyTrend = ref<any>({})
const categoryRatio = ref<any>({})

const todayTotal = computed(() => {
  const t = today.value
  if (!t || typeof t !== 'object') return 0
  return Object.values(t).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0)
})

// --- 月度趋势图 ---
const chartWidth = 500
const chartHeight = 200
const paddingTop = 20
const paddingBottom = 30
const paddingLeft = 40
const paddingRight = 20

const colors = ['#e94560', '#2080f0', '#f0a020', '#18a058']
const assetKeys = ['workCases', 'faultCases', 'knowledgeCards', 'projects']
const assetLabels = ['工作案例', '故障案例', '知识卡片', '项目']

const monthlyData = computed(() => {
  const trend = monthlyTrend.value
  if (!trend || typeof trend !== 'object') return []
  return Object.entries(trend).map(([month, vals]: [string, any]) => ({
    month: month.slice(5), // "MM"
    ...vals,
  }))
})

const maxVal = computed(() => {
  let m = 0
  for (const d of monthlyData.value) {
    for (const k of assetKeys) {
      if ((d[k] || 0) > m) m = d[k]
    }
  }
  return Math.max(m, 1)
})

const yStep = computed(() => Math.ceil(maxVal.value / 4))
const gridStep = computed(() => (chartHeight - paddingTop - paddingBottom) / 4)

const xStep = computed(() => {
  const n = monthlyData.value.length
  return n > 1 ? (chartWidth - paddingLeft - paddingRight) / (n - 1) : 0
})

const trendLines = computed(() => {
  return assetKeys.map((key, li) => {
    const points = monthlyData.value.map((d, i) => {
      const x = paddingLeft + i * xStep.value
      const y = paddingTop + (1 - (d[key] || 0) / maxVal.value) * (chartHeight - paddingTop - paddingBottom)
      return `${x},${y}`
    }).join(' ')
    return { points, color: colors[li] }
  })
})

const trendDots = computed(() => {
  const dots: any[] = []
  monthlyData.value.forEach((d, i) => {
    assetKeys.forEach((key, li) => {
      const x = paddingLeft + i * xStep.value
      const y = paddingTop + (1 - (d[key] || 0) / maxVal.value) * (chartHeight - paddingTop - paddingBottom)
      dots.push({ x, y, color: colors[li] })
    })
  })
  return dots
})

const xLabels = computed(() => {
  return monthlyData.value.map((d, i) => ({
    x: paddingLeft + i * xStep.value,
    text: d.month,
  }))
})

const legendItems = computed(() => {
  return assetKeys.map((key, i) => ({
    label: assetLabels[i],
    color: colors[i],
  }))
})

// --- 资产比例饼图 ---
const ratioData = computed(() => categoryRatio.value || { total: 0, ratio: {} })

const ratioItems = computed(() => {
  const r = ratioData.value.ratio || {}
  const itemColors = ['#e94560', '#2080f0', '#f0a020', '#18a058']
  return assetKeys.map((key, i) => ({
    key,
    label: assetLabels[i],
    count: r[key]?.count || 0,
    ratio: r[key]?.ratio || 0,
    color: itemColors[i],
  }))
})

const pieStyle = computed(() => {
  const items = ratioItems.value
  const segments: string[] = []
  let cumulative = 0
  for (const item of items) {
    if (item.ratio > 0) {
      segments.push(`${item.color} ${cumulative}% ${cumulative + item.ratio}%`)
      cumulative += item.ratio
    }
  }
  if (cumulative < 100) {
    segments.push(`#2d333b ${cumulative}% 100%`)
  }
  return {
    background: `conic-gradient(${segments.join(', ')})`,
  }
})

async function handleExport() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/v1/export/json', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `captureos-export-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    alert('导出失败')
  }
}

async function handleImport(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    const required = ['workCases','faultCases','knowledgeCards','projects','dailyLogs','timeRecords','timelineEvents']
    const missing = required.filter(k => !(k in data))
    if (missing.length) {
      alert(`文件格式错误，缺少字段: ${missing.join(', ')}`)
      return
    }

    const total = required.reduce((sum, k) => sum + (Array.isArray(data[k]) ? data[k].length : 0), 0)
    if (total === 0) {
      alert('文件中没有可导入的数据')
      return
    }

    if (!confirm(`确定要导入 ${total} 条数据吗？\n\n⚠️ 重复数据可能会被重复导入，请确保文件来源可靠。`)) {
      input.value = ''
      return
    }

    const token = localStorage.getItem('token')
    const res = await fetch('/api/v1/export/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    const result = await res.json()

    if (!res.ok) {
      alert(`导入失败: ${result.error || '未知错误'}`)
      return
    }

    const details = Object.entries(result.imported || {})
      .map(([k, v]) => `${k}: ${v} 条`)
      .join('\n')
    alert(`导入完成！\n\n${details || '已处理所有数据'}`)

    window.location.reload()
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      alert('文件格式错误，请选择有效的 JSON 文件')
    } else {
      alert('导入失败: ' + (e.message || '未知错误'))
    }
  } finally {
    input.value = ''
  }
}

onMounted(async () => {
  try {
    const [s, t, st, sg, mt, cr] = await Promise.allSettled([
      dashboardApi.getStats(), dashboardApi.getToday(),
      dashboardApi.getStreak(), dashboardApi.getStagnation(),
      dashboardApi.getMonthlyTrend(), dashboardApi.getCategoryRatio(),
    ])
    if (s.status === 'fulfilled') stats.value = (s.value as any)?.data || {}
    if (t.status === 'fulfilled') today.value = (t.value as any)?.data || {}
    if (st.status === 'fulfilled') streak.value = (st.value as any)?.data || {}
    if (sg.status === 'fulfilled') stagnation.value = (sg.value as any)?.data || {}
    if (mt.status === 'fulfilled') monthlyTrend.value = (mt.value as any)?.data || {}
    if (cr.status === 'fulfilled') categoryRatio.value = (cr.value as any)?.data || {}
  } catch (e) {
    // 忽略
  }
})
</script>

<style>
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .charts-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
