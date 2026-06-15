<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">工作案例</h2>
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
      :title="editingId ? '编辑工作案例' : '新建工作案例'"
      positive-text="提交"
      negative-text="取消"
      :loading="submitting"
      @positive-click="handleSubmit"
      style="width: 640px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="90">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="form.title" placeholder="案例标题" />
        </n-form-item>
        <n-form-item label="医院名称" path="hospitalName">
          <n-input v-model:value="form.hospitalName" placeholder="医院名称" />
        </n-form-item>
        <n-form-item label="系统类型" path="systemType">
          <n-input v-model:value="form.systemType" placeholder="系统类型" />
        </n-form-item>
        <n-form-item label="问题描述" path="problem">
          <n-input v-model:value="form.problem" type="textarea" placeholder="问题描述" :rows="2" />
        </n-form-item>
        <n-form-item label="原因分析" path="reason">
          <n-input v-model:value="form.reason" type="textarea" placeholder="原因分析" :rows="2" />
        </n-form-item>
        <n-form-item label="解决方案" path="solution">
          <n-input v-model:value="form.solution" type="textarea" placeholder="解决方案" :rows="2" />
        </n-form-item>
        <n-form-item label="耗时" path="costTime">
          <n-input v-model:value="form.costTime" placeholder="耗时(如: 2小时)" />
        </n-form-item>
        <n-form-item label="标签" path="tags">
          <n-input v-model:value="form.tags" placeholder="逗号分隔，如: 网络,交换机" />
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
import { workCasesApi } from '../api'

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
  title: '', hospitalName: '', systemType: '', problem: '',
  reason: '', solution: '', costTime: '', tags: '',
})

const rules: FormRules = {
  title: { required: true, message: '请输入标题', trigger: 'blur' },
}

const columns: DataTableColumns<any> = [
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '医院', key: 'hospitalName', ellipsis: { tooltip: true } },
  { title: '系统', key: 'systemType', width: 100 },
  { title: '耗时', key: 'costTime', width: 80 },
  {
    title: '标签', key: 'tags', width: 150,
    render(row) {
      const tags = Array.isArray(row.tags) ? row.tags : (row.tags ? String(row.tags).split(',') : [])
      return tags.map((t: string) => t.trim()).filter(Boolean).join(', ')
    },
  },
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
    const res = await workCasesApi.list(params) as any
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
  form.value = { title: '', hospitalName: '', systemType: '', problem: '', reason: '', solution: '', costTime: '', tags: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
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
      await workCasesApi.update(editingId.value, data)
      message.success('更新成功')
    } else {
      await workCasesApi.create(data)
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
    await workCasesApi.remove(id)
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
