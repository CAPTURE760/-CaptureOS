<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">时间流向</h2>

    <!-- 顶部表单 -->
    <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 20px; margin-bottom: 20px">
      <h3 style="color: #e0e0e0; margin-bottom: 16px; font-size: 16px">记录今日时间</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end">
        <div>
          <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 13px">日期</label>
          <input v-model="form.date" type="date" style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0" />
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
        <button @click="handleSave" :disabled="saving" style="padding: 8px 20px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer; height: 36px">{{ saving ? '保存中...' : '保存' }}</button>
      </div>
    </div>

    <!-- 表格 -->
    <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; overflow: hidden">
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr style="background: #1a1a2e">
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">日期</th>
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
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.date }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.workHours }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.studyHours }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.projectHours }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.entertainmentHours }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.otherHours }}</td>
            <td style="padding: 12px 16px">
              <button @click="handleDelete(item.id)" style="background: none; border: none; color: #ff6b81; cursor: pointer">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!list.length" style="padding: 40px; text-align: center; color: #a0aec0">暂无数据</div>
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
import { ref, onMounted } from 'vue'
import { timeRecordsApi } from '../api'

const loading = ref(false)
const saving = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20

const form = ref({
  date: new Date().toISOString().split('T')[0],
  workHours: 0,
  studyHours: 0,
  projectHours: 0,
  entertainmentHours: 0,
  otherHours: 0,
})

async function loadData() {
  loading.value = true
  try {
    const params: any = { skip: (page.value - 1) * pageSize, limit: pageSize }
    const res = await timeRecordsApi.list(params) as any
    const d = res.data ?? res
    list.value = d.items ?? d ?? []
    total.value = d.total ?? 0
  } catch (err: any) {
    alert(err?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!form.value.date) {
    alert('请选择日期')
    return
  }
  saving.value = true
  try {
    await timeRecordsApi.create(form.value)
    form.value = {
      date: new Date().toISOString().split('T')[0],
      workHours: 0,
      studyHours: 0,
      projectHours: 0,
      entertainmentHours: 0,
      otherHours: 0,
    }
    loadData()
  } catch (err: any) {
    alert(err?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number | string) {
  if (!confirm('确认删除？')) return
  try {
    await timeRecordsApi.remove(id)
    loadData()
  } catch (err: any) {
    alert(err?.data?.message || '删除失败')
  }
}

onMounted(() => loadData())
</script>
