<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">成长时间轴</h2>

    <!-- 操作栏 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px">
      <button @click="openDialog()" style="padding: 8px 16px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer">新增事件</button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; min-height: 200px; color: #a0aec0">加载中...</div>

    <!-- 空状态 -->
    <div v-else-if="!list.length" style="display: flex; justify-content: center; align-items: center; min-height: 200px; color: #a0aec0">暂无事件</div>

    <!-- 时间轴列表 -->
    <div v-else style="position: relative; padding-left: 24px">
      <div style="position: absolute; left: 8px; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.08)"></div>
      <div v-for="item in list" :key="item.id" style="position: relative; margin-bottom: 16px">
        <div :style="{ position: 'absolute', left: '-20px', top: '14px', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #161b22', zIndex: '1', background: dotColor(item.eventType) }"></div>
        <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px">
            <span style="font-size: 16px; font-weight: 600; color: #e0e0e0">{{ item.eventTitle }}</span>
            <div style="display: flex; align-items: center; gap: 8px">
              <span :style="{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', ...tagStyle(item.eventType) }">{{ item.eventType }}</span>
              <span style="font-size: 13px; color: #8b949e">{{ item.eventDate }}</span>
              <button @click="openDialog(item)" style="background: none; border: none; color: #e94560; cursor: pointer; font-size: 13px">编辑</button>
              <button @click="handleDelete(item.id)" style="background: none; border: none; color: #ff6b81; cursor: pointer; font-size: 13px">删除</button>
            </div>
          </div>
          <p style="font-size: 14px; color: #c0c0c0; line-height: 1.6; margin: 0">{{ item.description }}</p>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px">
      <button @click="page > 1 && (page--, loadData())" :disabled="page <= 1" style="padding: 6px 12px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #a0aec0; cursor: pointer">上一页</button>
      <span style="padding: 6px 12px; color: #a0aec0">第 {{ page }} 页</span>
      <button @click="list.length === pageSize && (page++, loadData())" :disabled="list.length < pageSize" style="padding: 6px 12px; background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #a0aec0; cursor: pointer">下一页</button>
    </div>

    <!-- 弹窗 -->
    <div v-if="showDialog" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000">
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; width: 540px; max-height: 80vh; overflow-y: auto">
        <h3 style="color: #e0e0e0; margin-bottom: 20px">{{ editId ? '编辑' : '新增' }} 事件</h3>
        <div style="display: flex; flex-direction: column; gap: 16px">
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">事件标题 *</label>
            <input v-model="form.eventTitle" placeholder="事件标题" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">事件日期 *</label>
            <input v-model="form.eventDate" type="date" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">事件类型 *</label>
            <select v-model="form.eventType" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box">
              <option value="">请选择</option>
              <option value="里程碑">里程碑</option>
              <option value="突破">突破</option>
              <option value="学习">学习</option>
              <option value="项目">项目</option>
              <option value="反思">反思</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">描述</label>
            <textarea v-model="form.description" placeholder="事件描述" rows="3" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px">
          <button @click="showDialog = false" style="padding: 8px 20px; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #a0aec0; cursor: pointer">取消</button>
          <button @click="handleSave" :disabled="saving" style="padding: 8px 20px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer">{{ saving ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { timelineApi } from '../api'

const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const editId = ref<number | string | null>(null)

const form = ref({
  eventTitle: '',
  eventDate: new Date().toISOString().split('T')[0],
  eventType: '',
  description: '',
})

const dotColorMap: Record<string, string> = {
  '里程碑': '#18a058',
  '突破': '#e94560',
  '学习': '#2080f0',
  '项目': '#f0a020',
  '反思': '#8b5cf6',
}

const tagColorMap: Record<string, { background: string; color: string }> = {
  '里程碑': { background: 'rgba(24,160,88,0.15)', color: '#18a058' },
  '突破': { background: 'rgba(233,69,96,0.15)', color: '#e94560' },
  '学习': { background: 'rgba(32,128,240,0.15)', color: '#2080f0' },
  '项目': { background: 'rgba(240,160,32,0.15)', color: '#f0a020' },
  '反思': { background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
}

function dotColor(type: string): string {
  return dotColorMap[type] || '#8b949e'
}

function tagStyle(type: string) {
  return tagColorMap[type] || { background: 'rgba(139,148,158,0.15)', color: '#8b949e' }
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { skip: (page.value - 1) * pageSize, limit: pageSize }
    const res = await timelineApi.list(params) as any
    list.value = res.items ?? res.data ?? res ?? []
    total.value = res.total ?? 0
  } catch (err: any) {
    alert(err?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openDialog(row?: any) {
  if (row) {
    editId.value = row.id
    form.value = {
      eventTitle: row.eventTitle ?? '',
      eventDate: row.eventDate ?? '',
      eventType: row.eventType ?? '',
      description: row.description ?? '',
    }
  } else {
    editId.value = null
    form.value = { eventTitle: '', eventDate: new Date().toISOString().split('T')[0], eventType: '', description: '' }
  }
  showDialog.value = true
}

async function handleSave() {
  if (!form.value.eventTitle.trim()) {
    alert('请输入事件标题')
    return
  }
  if (!form.value.eventDate) {
    alert('请选择日期')
    return
  }
  if (!form.value.eventType) {
    alert('请选择类型')
    return
  }
  saving.value = true
  try {
    if (editId.value) {
      await timelineApi.update(editId.value, form.value)
    } else {
      await timelineApi.create(form.value)
    }
    showDialog.value = false
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
    await timelineApi.remove(id)
    loadData()
  } catch (err: any) {
    alert(err?.data?.message || '删除失败')
  }
}

onMounted(() => loadData())
</script>
