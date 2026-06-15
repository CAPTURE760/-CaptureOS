<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">工作案例</h2>

    <!-- 搜索栏 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px">
      <input v-model="search" placeholder="搜索..." style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; width: 200px" @keyup.enter="loadData" />
      <button @click="loadData" style="padding: 8px 16px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer">搜索</button>
      <button @click="openDialog()" style="padding: 8px 16px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer">新增</button>
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
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">标题</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">医院</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">系统</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">耗时</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">标签</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.title }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.hospitalName }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.systemType }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.costTime }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ formatTags(item.tags) }}</td>
            <td style="padding: 12px 16px">
              <button @click="openDialog(item)" style="background: none; border: none; color: #e94560; cursor: pointer; margin-right: 8px">编辑</button>
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

    <!-- 弹窗 -->
    <div v-if="showDialog" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000">
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; width: 600px; max-height: 80vh; overflow-y: auto">
        <h3 style="color: #e0e0e0; margin-bottom: 20px">{{ editId ? '编辑' : '新增' }} 工作案例</h3>
        <div style="display: flex; flex-direction: column; gap: 16px">
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">标题 *</label>
            <input v-model="form.title" placeholder="案例标题" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
            <div v-if="errors.title" style="color: #e94560; font-size: 12px; margin-top: 4px">{{ errors.title }}</div>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">医院名称</label>
            <input v-model="form.hospitalName" placeholder="医院名称" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">系统类型</label>
            <input v-model="form.systemType" placeholder="系统类型" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">问题描述</label>
            <textarea v-model="form.problem" placeholder="问题描述" rows="2" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">原因分析</label>
            <textarea v-model="form.reason" placeholder="原因分析" rows="2" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">解决方案</label>
            <textarea v-model="form.solution" placeholder="解决方案" rows="2" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">耗时</label>
            <input v-model="form.costTime" placeholder="耗时(如: 2小时)" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">标签</label>
            <input v-model="form.tags" placeholder="逗号分隔，如: 网络,交换机" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
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
import { workCasesApi } from '../api'

const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const search = ref('')
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const editId = ref<number | string | null>(null)
const errors = ref<Record<string, string>>({})

const form = ref({
  title: '',
  hospitalName: '',
  systemType: '',
  problem: '',
  reason: '',
  solution: '',
  costTime: '',
  tags: '',
})

function formatTags(tags: any): string {
  if (!tags) return ''
  const arr = Array.isArray(tags) ? tags : String(tags).split(',')
  return arr.map((t: string) => t.trim()).filter(Boolean).join(', ')
}

function validate(): boolean {
  errors.value = {}
  if (!form.value.title?.trim()) errors.value.title = '请输入标题'
  return Object.keys(errors.value).length === 0
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { skip: (page.value - 1) * pageSize, limit: pageSize }
    if (search.value) params.search = search.value
    const res = await workCasesApi.list(params) as any
    const d = res.data ?? res
    list.value = d.items ?? d ?? []
    total.value = d.total ?? 0
  } catch (err: any) {
    // 加载失败静默处理
  } finally {
    loading.value = false
  }
}

function openDialog(row?: any) {
  errors.value = {}
  if (row) {
    editId.value = row.id
    form.value = {
      title: row.title ?? '',
      hospitalName: row.hospitalName ?? '',
      systemType: row.systemType ?? '',
      problem: row.problem ?? '',
      reason: row.reason ?? '',
      solution: row.solution ?? '',
      costTime: row.costTime ?? '',
      tags: Array.isArray(row.tags) ? row.tags.join(',') : (row.tags ?? ''),
    }
  } else {
    editId.value = null
    form.value = { title: '', hospitalName: '', systemType: '', problem: '', reason: '', solution: '', costTime: '', tags: '' }
  }
  showDialog.value = true
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    const data = {
      ...form.value,
      tags: form.value.tags ? form.value.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    if (editId.value) {
      await workCasesApi.update(editId.value, data)
    } else {
      await workCasesApi.create(data)
    }
    showDialog.value = false
    loadData()
  } catch (err: any) {
    // 保存失败静默处理
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number | string) {
  if (!confirm('确认删除？')) return
  try {
    await workCasesApi.remove(id)
    loadData()
  } catch (err: any) {
    // 删除失败静默处理
  }
}

onMounted(() => loadData())
</script>
