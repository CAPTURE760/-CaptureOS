<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">时间流向</h2>

    <!-- 顶部表单 -->
    <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; margin-bottom: 20px">
      <h3 style="color: #e0e0e0; margin-bottom: 16px; font-size: 16px">{{ editId ? '编辑时间记录' : '记录今日时间' }}</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end">
        <div>
          <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 13px">日期时间</label>
          <input v-model="form.date" type="datetime-local" style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0" />
          <div v-if="errors.date" style="color: #e94560; font-size: 12px; margin-top: 4px">{{ errors.date }}</div>
        </div>
        <div>
          <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 13px">工作(h)</label>
          <input v-model.number="form.workHours" type="number" min="0" max="24" step="0.5" style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; width: 80px" />
        </div>
        <div>
          <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 13px">学习(h)</label>
          <input v-model.number="form.studyHours" type="number" min="0" max="24" step="0.5" style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; width: 80px" />
        </div>
        <div>
          <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 13px">项目(h)</label>
          <input v-model.number="form.projectHours" type="number" min="0" max="24" step="0.5" style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; width: 80px" />
        </div>
        <div>
          <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 13px">娱乐(h)</label>
          <input v-model.number="form.entertainmentHours" type="number" min="0" max="24" step="0.5" style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; width: 80px" />
        </div>
        <div>
          <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 13px">其他(h)</label>
          <input v-model.number="form.otherHours" type="number" min="0" max="24" step="0.5" style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; width: 80px" />
        </div>
        <button @click="handleSave" :disabled="saving" style="padding: 8px 20px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer; height: 36px">{{ saving ? '保存中...' : (editId ? '更新' : '保存') }}</button>
        <button v-if="editId" @click="cancelEdit" style="padding: 8px 20px; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #a0aec0; cursor: pointer; height: 36px">取消</button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px">
      <input v-model="search" @keyup.enter="loadData()" placeholder="按日期搜索..." style="flex: 1; padding: 8px 12px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0" />
      <button @click="loadData()" style="padding: 8px 16px; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #a0aec0; cursor: pointer">搜索</button>
      <span style="padding: 6px 12px; color: #a0aec0; font-size: 13px">共 {{ total }} 条</span>
    </div>

    <!-- 本周时间分配 -->
    <div v-if="weekTotal > 0" style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; margin-bottom: 20px">
      <h3 style="color: #e0e0e0; font-size: 16px; margin-bottom: 16px">本周时间分配 <span style="font-size: 13px; color: #8b949e; font-weight: 400">共 {{ weekTotal.toFixed(1) }}h</span></h3>
      <div style="display: flex; flex-direction: column; gap: 10px">
        <div v-for="item in weekBars" :key="item.key" style="display: flex; align-items: center; gap: 12px">
          <span style="width: 50px; text-align: right; color: #a0aec0; font-size: 13px">{{ item.label }}</span>
          <div style="flex: 1; height: 20px; background: rgba(255,255,255,0.04); border-radius: 4px; overflow: hidden">
            <div :style="{ width: item.pct + '%', height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.3s' }"></div>
          </div>
          <span style="width: 50px; color: #e0e0e0; font-size: 13px">{{ item.hours.toFixed(1) }}h</span>
          <span style="width: 40px; color: #8b949e; font-size: 12px">{{ item.pct.toFixed(0) }}%</span>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" style="text-align: center; padding: 40px; color: #a0aec0">
      <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #e94560; border-radius: 50%; animation: spin 0.8s linear infinite"></div>
      <div style="margin-top: 8px">加载中...</div>
    </div>
    <div v-else-if="!list.length" style="padding: 40px; text-align: center; color: #a0aec0">暂无数据</div>

    <!-- 表格 -->
    <div v-else class="table-wrapper" style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; overflow: hidden">
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr style="background: #1a1a2e">
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">日期时间</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">工作</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">学习</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">项目</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">娱乐</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">其他</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
            <td style="padding: 12px 16px; color: #e0e0e0">{{ formatDateTime(item.date) }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.workHours }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.studyHours }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.projectHours }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.entertainmentHours }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.otherHours }}</td>
            <td style="padding: 12px 16px">
              <button @click="fillForm(item)" style="background: none; border: none; color: #64b5f6; cursor: pointer; margin-right: 8px">编辑</button>
              <button @click="handleDelete(item.id)" style="background: none; border: none; color: #ff6b81; cursor: pointer">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px">
      <button @click="page > 1 && (page--, loadData())" :disabled="page <= 1" style="padding: 6px 12px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #a0aec0; cursor: pointer">上一页</button>
      <span style="padding: 6px 12px; color: #a0aec0">第 {{ page }} 页</span>
      <button @click="list.length === pageSize && (page++, loadData())" :disabled="list.length < pageSize" style="padding: 6px 12px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #a0aec0; cursor: pointer">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { timeRecordsApi } from '../api'
import { beijingNow } from '../utils/time'

function formatDateTime(val: string) {
  if (!val) return ''
  const d = val.replace('T', ' ')
  if (d.length === 10) return d + ' 00:00'
  return d.slice(0, 16)
}

const loading = ref(false)
const saving = ref(false)
const editId = ref<number | null>(null)
const search = ref('')
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const errors = ref<Record<string, string>>({})

const form = ref({
  date: beijingNow(),
  workHours: 0,
  studyHours: 0,
  projectHours: 0,
  entertainmentHours: 0,
  otherHours: 0,
})

function validate(): boolean {
  errors.value = {}
  if (!form.value.date) errors.value.date = '请选择日期'
  return Object.keys(errors.value).length === 0
}

// 本周时间分配计算
const weekData = computed(() => {
  const now = new Date()
  const dayOfWeek = now.getDay() || 7 // 周日=7
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1)
  monday.setHours(0, 0, 0, 0)

  const totals = { work: 0, study: 0, project: 0, entertainment: 0, other: 0 }
  for (const item of list.value) {
    const d = new Date(item.date?.replace(' ', 'T') || item.date)
    if (d >= monday) {
      totals.work += item.workHours || 0
      totals.study += item.studyHours || 0
      totals.project += item.projectHours || 0
      totals.entertainment += item.entertainmentHours || 0
      totals.other += item.otherHours || 0
    }
  }
  return totals
})

const weekTotal = computed(() => {
  const w = weekData.value
  return w.work + w.study + w.project + w.entertainment + w.other
})

const weekBars = computed(() => {
  const w = weekData.value
  const total = weekTotal.value || 1
  const items = [
    { key: 'work', label: '工作', hours: w.work, color: '#e94560' },
    { key: 'study', label: '学习', hours: w.study, color: '#2080f0' },
    { key: 'project', label: '项目', hours: w.project, color: '#f0a020' },
    { key: 'entertainment', label: '娱乐', hours: w.entertainment, color: '#18a058' },
    { key: 'other', label: '其他', hours: w.other, color: '#8b949e' },
  ]
  return items.map(item => ({
    ...item,
    pct: (item.hours / total) * 100,
  }))
})

async function loadData() {
  loading.value = true
  try {
    const params: any = { skip: (page.value - 1) * pageSize, limit: pageSize }
    if (search.value) params.search = search.value
    const res = await timeRecordsApi.list(params) as any
    const d = res.data ?? res
    list.value = d.items ?? d ?? []
    total.value = d.total ?? 0
  } catch (err: any) {
    // 加载失败静默处理
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    if (editId.value) {
      await timeRecordsApi.update(editId.value, form.value)
    } else {
      await timeRecordsApi.create(form.value)
    }
    editId.value = null
    form.value = {
      date: beijingNow(),
      workHours: 0,
      studyHours: 0,
      projectHours: 0,
      entertainmentHours: 0,
      otherHours: 0,
    }
    errors.value = {}
    loadData()
  } catch (err: any) {
    alert('保存失败: ' + (err?.response?.data?.message || err?.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

function fillForm(item: any) {
  editId.value = item.id
  form.value = {
    date: item.date?.slice(0, 16) || beijingNow(),
    workHours: item.workHours || 0,
    studyHours: item.studyHours || 0,
    projectHours: item.projectHours || 0,
    entertainmentHours: item.entertainmentHours || 0,
    otherHours: item.otherHours || 0,
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editId.value = null
  form.value = {
    date: beijingNow(),
    workHours: 0,
    studyHours: 0,
    projectHours: 0,
    entertainmentHours: 0,
    otherHours: 0,
  }
}

async function handleDelete(id: number | string) {
  if (!confirm('⚠️ 确认删除此时间记录？\n\n删除后数据将被隐藏，如需恢复请联系管理员。')) return
  try {
    await timeRecordsApi.remove(id)
    loadData()
  } catch (err: any) {
    // 删除失败静默处理
  }
}

onMounted(() => loadData())
</script>
