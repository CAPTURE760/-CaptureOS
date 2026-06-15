<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">成长时间轴</h2>
      <n-button type="primary" @click="openCreate">+ 新建事件</n-button>
    </div>

    <div v-if="loading" class="loading-wrap">
      <n-spin size="medium" />
    </div>

    <div v-else-if="list.length === 0" class="empty-wrap">
      <n-empty description="暂无事件" />
    </div>

    <div v-else class="timeline-list">
      <div v-for="item in list" :key="item.id" class="timeline-item">
        <div class="timeline-dot" :class="eventTypeClass(item.eventType)" />
        <n-card class="timeline-card" size="small">
          <div class="timeline-header">
            <span class="timeline-title">{{ item.eventTitle }}</span>
            <n-space size="small">
              <n-tag :type="eventTypeTag(item.eventType)" size="small" :bordered="false">
                {{ item.eventType }}
              </n-tag>
              <span class="timeline-date">{{ item.eventDate }}</span>
              <n-button size="tiny" quaternary @click="openEdit(item)">编辑</n-button>
              <n-popconfirm @positive-click="handleDelete(item.id)">
                <template #trigger>
                  <n-button size="tiny" type="error" quaternary>删除</n-button>
                </template>
                确认删除？
              </n-popconfirm>
            </n-space>
          </div>
          <p class="timeline-desc">{{ item.description }}</p>
        </n-card>
      </div>
    </div>

    <div class="pagination-wrap">
      <n-pagination v-model:page="page" :page-count="totalPages" @update:page="fetchList" />
    </div>

    <n-modal
      v-model:show="showModal"
      preset="dialog"
      :title="editingId ? '编辑事件' : '新建事件'"
      positive-text="提交"
      negative-text="取消"
      :loading="submitting"
      @positive-click="handleSubmit"
      style="width: 540px"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="left" label-width="90">
        <n-form-item label="事件标题" path="eventTitle">
          <n-input v-model:value="form.eventTitle" placeholder="事件标题" />
        </n-form-item>
        <n-form-item label="事件日期" path="eventDate">
          <n-date-picker v-model:formatted-value="form.eventDate" type="date" value-format="yyyy-MM-dd" style="width: 100%" />
        </n-form-item>
        <n-form-item label="事件类型" path="eventType">
          <n-select v-model:value="form.eventType" :options="eventTypeOptions" placeholder="选择类型" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="form.description" type="textarea" placeholder="事件描述" :rows="3" />
        </n-form-item>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  NButton, NPagination, NModal, NForm, NFormItem,
  NInput, NDatePicker, NSelect, NCard, NTag, NSpace,
  NPopconfirm, NSpin, NEmpty, useMessage,
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import { timelineApi } from '../api'

const message = useMessage()

const list = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)

const showModal = ref(false)
const submitting = ref(false)
const editingId = ref<number | string | null>(null)
const formRef = ref<FormInst | null>(null)

const form = ref({
  eventTitle: '',
  eventDate: new Date().toISOString().split('T')[0],
  eventType: '',
  description: '',
})

const rules: FormRules = {
  eventTitle: { required: true, message: '请输入事件标题', trigger: 'blur' },
  eventDate: { required: true, message: '请选择日期', trigger: 'blur' },
  eventType: { required: true, message: '请选择类型', trigger: 'change' },
}

const eventTypeOptions = [
  { label: '里程碑', value: '里程碑' },
  { label: '突破', value: '突破' },
  { label: '学习', value: '学习' },
  { label: '项目', value: '项目' },
  { label: '反思', value: '反思' },
  { label: '其他', value: '其他' },
]

function eventTypeClass(type: string): string {
  const map: Record<string, string> = {
    '里程碑': 'dot-milestone',
    '突破': 'dot-breakthrough',
    '学习': 'dot-study',
    '项目': 'dot-project',
    '反思': 'dot-reflection',
  }
  return map[type] || 'dot-default'
}

function eventTypeTag(type: string): 'success' | 'warning' | 'info' | 'error' | 'default' {
  const map: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
    '里程碑': 'success',
    '突破': 'warning',
    '学习': 'info',
    '项目': 'info',
    '反思': 'warning',
  }
  return map[type] || 'default'
}

async function fetchList() {
  loading.value = true
  try {
    const res = await timelineApi.list({ page: page.value, pageSize: 20 }) as any
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
  form.value = { eventTitle: '', eventDate: new Date().toISOString().split('T')[0], eventType: '', description: '' }
  showModal.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  form.value = {
    eventTitle: row.eventTitle ?? '',
    eventDate: row.eventDate ?? '',
    eventType: row.eventType ?? '',
    description: row.description ?? '',
  }
  showModal.value = true
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    submitting.value = true
    if (editingId.value) {
      await timelineApi.update(editingId.value, form.value)
      message.success('更新成功')
    } else {
      await timelineApi.create(form.value)
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
    await timelineApi.remove(id)
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

.loading-wrap, .empty-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.timeline-list {
  position: relative;
  padding-left: 24px;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.08);
}

.timeline-item {
  position: relative;
  margin-bottom: 16px;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 14px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #161b22;
  z-index: 1;
}

.dot-milestone { background: #18a058; }
.dot-breakthrough { background: #e94560; }
.dot-study { background: #2080f0; }
.dot-project { background: #f0a020; }
.dot-reflection { background: #8b5cf6; }
.dot-default { background: #8b949e; }

.timeline-card {
  background: #161b22;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.timeline-title {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
}

.timeline-date {
  font-size: 13px;
  color: #8b949e;
}

.timeline-desc {
  font-size: 14px;
  color: #c0c0c0;
  line-height: 1.6;
  margin: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
