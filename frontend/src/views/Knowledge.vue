<template>
  <div>
    <h2 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin-bottom: 20px">知识卡片</h2>

    <!-- 搜索栏 -->
    <div style="display: flex; gap: 12px; margin-bottom: 20px">
      <input v-model="search" placeholder="搜索..." style="padding: 8px 12px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; width: 200px" @keyup.enter="loadData" />
      <button @click="loadData" style="padding: 8px 16px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer">搜索</button>
      <button @click="openDialog()" style="padding: 8px 16px; background: #e94560; border: none; border-radius: 6px; color: #fff; cursor: pointer">新增</button>
    </div>

    <!-- 表格 -->
    <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; overflow: hidden">
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr style="background: #1a1a2e">
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">问题</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">答案</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">场景</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">分类</th>
            <th style="padding: 12px 16px; text-align: left; color: #a0aec0; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06)">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id" style="border-bottom: 1px solid rgba(255,255,255,0.06)">
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.question }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.answer }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.scenario }}</td>
            <td style="padding: 12px 16px; color: #e0e0e0">{{ item.category }}</td>
            <td style="padding: 12px 16px">
              <button @click="openDialog(item)" style="background: none; border: none; color: #e94560; cursor: pointer; margin-right: 8px">编辑</button>
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

    <!-- 弹窗 -->
    <div v-if="showDialog" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000">
      <div style="background: #161b22; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; width: 600px; max-height: 80vh; overflow-y: auto">
        <h3 style="color: #e0e0e0; margin-bottom: 20px">{{ editId ? '编辑' : '新增' }} 知识卡片</h3>
        <div style="display: flex; flex-direction: column; gap: 16px">
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">问题 *</label>
            <textarea v-model="form.question" placeholder="问题" rows="2" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">答案 *</label>
            <textarea v-model="form.answer" placeholder="答案" rows="3" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">场景</label>
            <textarea v-model="form.scenario" placeholder="使用场景" rows="2" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; resize: vertical; box-sizing: border-box"></textarea>
          </div>
          <div>
            <label style="display: block; color: #a0aec0; margin-bottom: 6px; font-size: 14px">分类</label>
            <input v-model="form.category" placeholder="分类" style="width: 100%; padding: 10px; background: #0d1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #e0e0e0; box-sizing: border-box" />
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
import { knowledgeApi } from '../api'

const loading = ref(false)
const saving = ref(false)
const showDialog = ref(false)
const search = ref('')
const list = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const editId = ref<number | string | null>(null)

const form = ref({
  question: '',
  answer: '',
  scenario: '',
  category: '',
})

async function loadData() {
  loading.value = true
  try {
    const params: any = { skip: (page.value - 1) * pageSize, limit: pageSize }
    if (search.value) params.search = search.value
    const res = await knowledgeApi.list(params) as any
    const d = res.data ?? res
    list.value = d.items ?? d ?? []
    total.value = d.total ?? 0
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
      question: row.question ?? '',
      answer: row.answer ?? '',
      scenario: row.scenario ?? '',
      category: row.category ?? '',
    }
  } else {
    editId.value = null
    form.value = { question: '', answer: '', scenario: '', category: '' }
  }
  showDialog.value = true
}

async function handleSave() {
  if (!form.value.question.trim()) {
    alert('请输入问题')
    return
  }
  if (!form.value.answer.trim()) {
    alert('请输入答案')
    return
  }
  saving.value = true
  try {
    if (editId.value) {
      await knowledgeApi.update(editId.value, form.value)
    } else {
      await knowledgeApi.create(form.value)
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
    await knowledgeApi.remove(id)
    loadData()
  } catch (err: any) {
    alert(err?.data?.message || '删除失败')
  }
}

onMounted(() => loadData())
</script>
