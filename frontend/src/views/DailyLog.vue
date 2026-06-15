<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">今日记录</h2>

    <!-- 搜索栏 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px">
      <button @click="openDialog()" style="padding: 8px 16px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer">新增记录</button>
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
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">日期</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">类型</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">内容</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">收获</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">问题</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.date }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.assetType }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.content }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.gain }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.problem }}</td>
            <td style="padding: 12px 16px">
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
        <h3 style="color: #e0e0e0; margin-bottom: 20px">新增今日记录</h3>
        <div style="display: flex; flex-direction: column; gap: 16px">
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">日期 *</label>
            <input v-model="form.date" type="date" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
            <div v-if="errors.date" style="color: #e94560; font-size: 12px; margin-top: 4px">{{ errors.date }}</div>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">资产类型 *</label>
            <select v-model="form.assetType" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box">
              <option value="">请选择</option>
              <option value="work_case">工作案例</option>
              <option value="fault_case">故障案例</option>
              <option value="lab">实验</option>
              <option value="knowledge">知识</option>
              <option value="project">项目</option>
              <option value="other">其他</option>
            </select>
            <div v-if="errors.assetType" style="color: #e94560; font-size: 12px; margin-top: 4px">{{ errors.assetType }}</div>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">内容 *</label>
            <textarea v-model="form.content" placeholder="今日记录内容" rows="3" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
            <div v-if="errors.content" style="color: #e94560; font-size: 12px; margin-top: 4px">{{ errors.content }}</div>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">收获</label>
            <textarea v-model="form.gain" placeholder="今日收获" rows="2" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">问题</label>
            <textarea v-model="form.problem" placeholder="遇到的问题" rows="2" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
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
import { dailyLogsApi } from '../api'

const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const errors = ref<Record<string, string>>({})

const form = ref({
  date: new Date().toISOString().split('T')[0],
  assetType: '',
  content: '',
  gain: '',
  problem: '',
})

function validate(): boolean {
  errors.value = {}
  if (!form.value.date) errors.value.date = '请选择日期'
  if (!form.value.assetType) errors.value.assetType = '请选择资产类型'
  if (!form.value.content?.trim()) errors.value.content = '请输入内容'
  return Object.keys(errors.value).length === 0
}

async function loadData() {
  loading.value = true
  try {
    const params: any = { skip: (page.value - 1) * pageSize, limit: pageSize }
    const res = await dailyLogsApi.list(params) as any
    const d = res.data ?? res
    list.value = d.items ?? d ?? []
    total.value = d.total ?? 0
  } catch (err: any) {
    // 加载失败静默处理
  } finally {
    loading.value = false
  }
}

function openDialog() {
  errors.value = {}
  form.value = {
    date: new Date().toISOString().split('T')[0],
    assetType: '',
    content: '',
    gain: '',
    problem: '',
  }
  showDialog.value = true
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  try {
    await dailyLogsApi.create(form.value)
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
    await dailyLogsApi.remove(id)
    loadData()
  } catch (err: any) {
    // 删除失败静默处理
  }
}

onMounted(() => loadData())
</script>
