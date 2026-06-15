<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">项目资产</h2>

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
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">名称</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">描述</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">状态</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">版本</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">创建时间</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.name }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.description }}</td>
            <td style="padding: 12px 16px">
              <span :style="{ padding: '2px 8px', borderRadius: '4px', fontSize: '12px', ...statusStyle(item.status) }">{{ statusLabel(item.status) }}</span>
            </td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.version }}</td>
            <td style="padding: 12px 16px; color: #a0aec0; font-size: 13px">{{ formatDateTime(item.createdAt) }}</td>
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
        <h3 style="color: #e0e0e0; margin-bottom: 20px">{{ editId ? '编辑' : '新增' }} 项目</h3>
        <div style="display: flex; flex-direction: column; gap: 16px">
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">名称 *</label>
            <input v-model="form.name" placeholder="项目名称" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
            <div v-if="errors.name" style="color: #e94560; font-size: 12px; margin-top: 4px">{{ errors.name }}</div>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">描述</label>
            <textarea v-model="form.description" placeholder="项目描述" rows="3" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">GitHub</label>
            <input v-model="form.githubUrl" placeholder="GitHub 地址" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">状态</label>
            <select v-model="form.status" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box">
              <option value="">请选择</option>
              <option value="planning">规划中</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">版本</label>
            <input v-model="form.version" placeholder="如: v1.0.0" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">后续计划</label>
            <textarea v-model="form.nextPlan" placeholder="后续计划" rows="2" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
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
import { projectsApi } from '../api'

function formatDateTime(val: string) {
  if (!val) return ''
  const d = val.replace('T', ' ')
  return d.slice(0, 16)
}

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
  name: '',
  description: '',
  githubUrl: '',
  status: '',
  version: '',
  nextPlan: '',
})

const statusLabelMap: Record<string, string> = {
  planning: '规划中',
  active: '进行中',
  completed: '已完成',
  archived: '已归档',
}

const statusColorMap: Record<string, { background: string; color: string }> = {
  planning: { background: 'rgba(32,128,240,0.15)', color: '#2080f0' },
  active: { background: 'rgba(240,160,32,0.15)', color: '#f0a020' },
  completed: { background: 'rgba(24,160,88,0.15)', color: '#18a058' },
  archived: { background: 'rgba(139,148,158,0.15)', color: '#8b949e' },
}

function statusLabel(status: string): string {
  return statusLabelMap[status] || status || '-'
}

function statusStyle(status: string) {
  return statusColorMap[status] || {}
}

function validate(): boolean {
  errors.value = {}
  if (!form.value.name?.trim()) errors.value.name = '请输入项目名称'
  return Object.keys(errors.value).length === 0
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { skip: (page.value - 1) * pageSize, limit: pageSize }
    if (search.value) params.search = search.value
    const res = await projectsApi.list(params) as any
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
      name: row.name ?? '',
      description: row.description ?? '',
      githubUrl: row.githubUrl ?? '',
      status: row.status ?? '',
      version: row.version ?? '',
      nextPlan: row.nextPlan ?? '',
    }
  } else {
    editId.value = null
    form.value = { name: '', description: '', githubUrl: '', status: '', version: '', nextPlan: '' }
  }
  showDialog.value = true
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    if (editId.value) {
      await projectsApi.update(editId.value, form.value)
    } else {
      await projectsApi.create(form.value)
    }
    showDialog.value = false
    loadData()
  } catch (err: any) {
    alert('保存失败: ' + (err?.response?.data?.message || err?.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number | string) {
  if (!confirm('⚠️ 确认删除此项目？\n\n删除后数据将被隐藏，如需恢复请联系管理员。')) return
  try {
    await projectsApi.remove(id)
    loadData()
  } catch (err: any) {
    // 删除失败静默处理
  }
}

onMounted(() => loadData())
</script>
