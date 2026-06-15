<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">今日记录</h2>
      <n-button type="primary" @click="openCreate">
        + 新建记录
      </n-button>
    </div>

    <n-data-table
      :columns="columns"
      :data="list"
      :loading="loading"
      :bordered="false"
      class="data-table"
    />

    <div class="pagination-wrap">
      <n-pagination
        v-model:page="page"
        :page-count="totalPages"
        @update:page="fetchList"
      />
    </div>

    <n-modal
      v-model:show="showModal"
      preset="dialog"
      title="新建今日记录"
      positive-text="提交"
      negative-text="取消"
      :loading="submitting"
      @positive-click="handleSubmit"
      style="width: 600px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="80">
        <n-form-item label="日期" path="date">
          <n-date-picker v-model:formatted-value="form.date" type="date" value-format="yyyy-MM-dd" style="width: 100%" />
        </n-form-item>
        <n-form-item label="资产类型" path="assetType">
          <n-select
            v-model:value="form.assetType"
            :options="assetTypeOptions"
            placeholder="选择类型"
          />
        </n-form-item>
        <n-form-item label="内容" path="content">
          <n-input v-model:value="form.content" type="textarea" placeholder="今日记录内容" :rows="3" />
        </n-form-item>
        <n-form-item label="收获" path="gain">
          <n-input v-model:value="form.gain" type="textarea" placeholder="今日收获" :rows="2" />
        </n-form-item>
        <n-form-item label="问题" path="problem">
          <n-input v-model:value="form.problem" type="textarea" placeholder="遇到的问题" :rows="2" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import {
  NButton, NDataTable, NPagination, NModal, NForm, NFormItem,
  NInput, NDatePicker, NSelect, NPopconfirm, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules, DataTableColumns } from 'naive-ui'
import { dailyLogsApi } from '../api'

const message = useMessage()

const list = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)

const showModal = ref(false)
const submitting = ref(false)
const formRef = ref<FormInst | null>(null)

const form = ref({
  date: new Date().toISOString().split('T')[0],
  assetType: '',
  content: '',
  gain: '',
  problem: '',
})

const rules: FormRules = {
  date: { required: true, message: '请选择日期', trigger: 'blur' },
  assetType: { required: true, message: '请选择资产类型', trigger: 'change' },
  content: { required: true, message: '请输入内容', trigger: 'blur' },
}

const assetTypeOptions = [
  { label: '工作案例', value: 'work_case' },
  { label: '故障案例', value: 'fault_case' },
  { label: '实验', value: 'lab' },
  { label: '知识', value: 'knowledge' },
  { label: '项目', value: 'project' },
  { label: '其他', value: 'other' },
]

const columns: DataTableColumns<any> = [
  { title: '日期', key: 'date', width: 120 },
  { title: '类型', key: 'assetType', width: 100 },
  { title: '内容', key: 'content', ellipsis: { tooltip: true } },
  { title: '收获', key: 'gain', ellipsis: { tooltip: true } },
  { title: '问题', key: 'problem', ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render(row) {
      return h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id),
      }, {
        trigger: () => h(NButton, { size: 'small', type: 'error', quaternary: true }, { default: () => '删除' }),
        default: () => '确认删除？',
      })
    },
  },
]

async function fetchList() {
  loading.value = true
  try {
    const res = await dailyLogsApi.list({ page: page.value, pageSize: 20 }) as any
    list.value = res.items ?? res.data ?? res ?? []
    totalPages.value = res.totalPages ?? 1
  } catch (err: any) {
    message.error(err?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = {
    date: new Date().toISOString().split('T')[0],
    assetType: '',
    content: '',
    gain: '',
    problem: '',
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    await dailyLogsApi.create(form.value)
    message.success('创建成功')
    showModal.value = false
    fetchList()
  } catch (err: any) {
    if (err?.data?.message) {
      message.error(err.data.message)
    }
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number | string) {
  try {
    await dailyLogsApi.remove(id)
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
