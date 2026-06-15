<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">知识卡片</h2>
      <n-space>
        <n-input v-model:value="search" placeholder="搜索..." clearable style="width: 200px" @clear="fetchList" @keyup.enter="fetchList" />
        <n-button type="primary" @click="openCreate">+ 新建</n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="list"
      :loading="loading"
      :bordered="false"
      class="data-table"
    />

    <div class="pagination-wrap">
      <n-pagination v-model:page="page" :page-count="totalPages" @update:page="fetchList" />
    </div>

    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :title="editingId ? '编辑知识卡片' : '新建知识卡片'"
      positive-text="提交"
      negative-text="取消"
      :loading="submitting"
      @positive-click="handleSubmit"
      style="width: 640px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="90">
        <n-form-item label="问题" path="question">
          <n-input v-model:value="form.question" type="textarea" placeholder="问题" :rows="2" />
        </n-form-item>
        <n-form-item label="答案" path="answer">
          <n-input v-model:value="form.answer" type="textarea" placeholder="答案" :rows="3" />
        </n-form-item>
        <n-form-item label="场景" path="scenario">
          <n-input v-model:value="form.scenario" type="textarea" placeholder="使用场景" :rows="2" />
        </n-form-item>
        <n-form-item label="分类" path="category">
          <n-input v-model:value="form.category" placeholder="分类" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import {
  NButton, NDataTable, NPagination, NModal, NForm, NFormItem,
  NInput, NSpace, NPopconfirm, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns } from 'naive-ui'
import { knowledgeApi } from '../api'

const message = useMessage()

const list = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const search = ref('')

const showModal = ref(false)
const submitting = ref(false)
const editingId = ref<number | string | null>(null)
const formRef = ref<FormInst | null>(null)

const form = ref({
  question: '', answer: '', scenario: '', category: '',
})

const rules: FormRules = {
  question: { required: true, message: '请输入问题', trigger: 'blur' },
  answer: { required: true, message: '请输入答案', trigger: 'blur' },
}

const columns: DataTableColumns<any> = [
  { title: '问题', key: 'question', ellipsis: { tooltip: true } },
  { title: '答案', key: 'answer', ellipsis: { tooltip: true } },
  { title: '场景', key: 'scenario', ellipsis: { tooltip: true } },
  { title: '分类', key: 'category', width: 100 },
  {
    title: '操作', key: 'actions', width: 140,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { size: 'small', quaternary: true, onClick: () => openEdit(row) }, { default: () => '编辑' }),
          h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
            trigger: () => h(NButton, { size: 'small', type: 'error', quaternary: true }, { default: () => '删除' }),
            default: () => '确认删除？',
          }),
        ],
      })
    },
  },
]

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize: 20 }
    if (search.value) params.search = search.value
    const res = await knowledgeApi.list(params) as any
    list.value = res.items ?? res.data ?? res ?? []
    totalPages.value = res.totalPages ?? 1
  } catch (err: any) {
    message.error(err?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { question: '', answer: '', scenario: '', category: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  form.value = {
    question: row.question ?? '',
    answer: row.answer ?? '',
    scenario: row.scenario ?? '',
    category: row.category ?? '',
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (editingId.value) {
      await knowledgeApi.update(editingId.value, form.value)
      message.success('更新成功')
    } else {
      await knowledgeApi.create(form.value)
      message.success('创建成功')
    }
    showModal.value = false
    fetchList()
  } catch (err: any) {
    if (err?.data?.message) message.error(err.data.message)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number | string) {
  try {
    await knowledgeApi.remove(id)
    message.success('删除成功')
    fetchList()
  } catch (err: any) {
    message.error(err?.data?.message || '删除失败')
  }
}

onMounted(() => fetchList())
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #e0e0e0;
}

.data-table {
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
