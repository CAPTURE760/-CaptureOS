<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">故障案例</h2>
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
      :title="editingId ? '编辑故障案例' : '新建故障案例'"
      positive-text="提交"
      negative-text="取消"
      :loading="submitting"
      @positive-click="handleSubmit"
      style="width: 640px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="90">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="form.title" placeholder="故障标题" />
        </n-form-item>
        <n-form-item label="环境" path="environment">
          <n-input v-model:value="form.environment" placeholder="运行环境" />
        </n-form-item>
        <n-form-item label="症状" path="symptom">
          <n-input v-model:value="form.symptom" type="textarea" placeholder="故障症状" :rows="2" />
        </n-form-item>
        <n-form-item label="根因" path="rootCause">
          <n-input v-model:value="form.rootCause" type="textarea" placeholder="根本原因" :rows="2" />
        </n-form-item>
        <n-form-item label="解决方案" path="solution">
          <n-input v-model:value="form.solution" type="textarea" placeholder="解决方案" :rows="2" />
        </n-form-item>
        <n-form-item label="预防措施" path="prevention">
          <n-input v-model:value="form.prevention" type="textarea" placeholder="预防措施" :rows="2" />
        </n-form-item>
        <n-form-item label="标签" path="tags">
          <n-input v-model:value="form.tags" placeholder="逗号分隔" />
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
import { faultCasesApi } from '../api'

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
  title: '', environment: '', symptom: '', rootCause: '',
  solution: '', prevention: '', tags: '',
})

const rules: FormRules = {
  title: { required: true, message: '请输入标题', trigger: 'blur' },
}

const columns: DataTableColumns<any> = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '环境', key: 'environment', ellipsis: { tooltip: true } },
  { title: '症状', key: 'symptom', ellipsis: { tooltip: true } },
  { title: '根因', key: 'rootCause', ellipsis: { tooltip: true } },
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
    const res = await faultCasesApi.list(params) as any
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
  form.value = { title: '', environment: '', symptom: '', rootCause: '', solution: '', prevention: '', tags: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  form.value = {
    title: row.title ?? '',
    environment: row.environment ?? '',
    symptom: row.symptom ?? '',
    rootCause: row.rootCause ?? '',
    solution: row.solution ?? '',
    prevention: row.prevention ?? '',
    tags: Array.isArray(row.tags) ? row.tags.join(',') : (row.tags ?? ''),
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    const data = {
      ...form.value,
      tags: form.value.tags ? form.value.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    if (editingId.value) {
      await faultCasesApi.update(editingId.value, data)
      message.success('更新成功')
    } else {
      await faultCasesApi.create(data)
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
    await faultCasesApi.remove(id)
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
