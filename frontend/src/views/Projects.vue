<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">项目资产</h2>
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
      :title="editingId ? '编辑项目' : '新建项目'"
      positive-text="提交"
      negative-text="取消"
      :loading="submitting"
      @positive-click="handleSubmit"
      style="width: 640px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="90">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="form.name" placeholder="项目名称" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="form.description" type="textarea" placeholder="项目描述" :rows="3" />
        </n-form-item>
        <n-form-item label="GitHub" path="githubUrl">
          <n-input v-model:value="form.githubUrl" placeholder="GitHub 地址" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-select v-model:value="form.status" :options="statusOptions" placeholder="选择状态" />
        </n-form-item>
        <n-form-item label="版本" path="version">
          <n-input v-model:value="form.version" placeholder="如: v1.0.0" />
        </n-form-item>
        <n-form-item label="后续计划" path="nextPlan">
          <n-input v-model:value="form.nextPlan" type="textarea" placeholder="后续计划" :rows="2" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import {
  NButton, NDataTable, NPagination, NModal, NForm, NFormItem,
  NInput, NSelect, NSpace, NPopconfirm, NTag, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns } from 'naive-ui'
import { projectsApi } from '../api'

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
  name: '', description: '', githubUrl: '', status: '', version: '', nextPlan: '',
})

const rules: FormRules = {
  name: { required: true, message: '请输入项目名称', trigger: 'blur' },
}

const statusOptions = [
  { label: '规划中', value: 'planning' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已归档', value: 'archived' },
]

const statusMap: Record<string, { label: string; type: 'default' | 'success' | 'warning' | 'info' | 'error' }> = {
  planning: { label: '规划中', type: 'info' },
  active: { label: '进行中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  archived: { label: '已归档', type: 'default' },
}

const columns: DataTableColumns<any> = [
  { title: '名称', key: 'name', ellipsis: { tooltip: true } },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  {
    title: '状态', key: 'status', width: 90,
    render(row) {
      const s = statusMap[row.status]
      if (!s) return row.status
      return h(NTag, { size: 'small', type: s.type, bordered: false }, { default: () => s.label })
    },
  },
  { title: '版本', key: 'version', width: 80 },
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
    const res = await projectsApi.list(params) as any
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
  form.value = { name: '', description: '', githubUrl: '', status: '', version: '', nextPlan: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  form.value = {
    name: row.name ?? '',
    description: row.description ?? '',
    githubUrl: row.githubUrl ?? '',
    status: row.status ?? '',
    version: row.version ?? '',
    nextPlan: row.nextPlan ?? '',
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (editingId.value) {
      await projectsApi.update(editingId.value, form.value)
      message.success('更新成功')
    } else {
      await projectsApi.create(form.value)
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
    await projectsApi.remove(id)
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
