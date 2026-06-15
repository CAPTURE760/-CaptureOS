<template>
  <div class="timeline-page">
    <div class="page-header">
      <h2>成长时间轴</h2>
      <el-button type="primary" @click="openDialog()">新增事件</el-button>
    </div>

    <el-timeline>
      <el-timeline-item
        v-for="item in list"
        :key="item.id"
        :timestamp="item.date"
        placement="top"
        :color="typeColor(item.event_type)"
      >
        <el-card class="timeline-card">
          <div class="timeline-header">
            <h4>{{ item.title }}</h4>
            <el-tag :type="tagType(item.event_type)" size="small">{{ item.event_type || '其他' }}</el-tag>
          </div>
          <p class="timeline-desc">{{ item.description }}</p>
          <div class="timeline-actions">
            <el-button type="primary" link size="small" @click="openDialog(item)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(item.id)">删除</el-button>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <el-pagination
      v-if="total > pageSize"
      style="margin-top: 20px; justify-content: flex-end"
      background layout="prev, pager, next"
      :total="total" :page-size="pageSize"
      v-model:current-page="currentPage" @current-change="loadList"
    />

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑事件' : '新增事件'" width="500px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="事件标题" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.event_type" style="width: 100%">
            <el-option label="里程碑" value="里程碑" />
            <el-option label="技能提升" value="技能提升" />
            <el-option label="项目完成" value="项目完成" />
            <el-option label="重要决策" value="重要决策" />
            <el-option label="学习笔记" value="学习笔记" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="事件描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTimelineEvents, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from '../api/timeline'

const typeColor = (t) => ({
  '里程碑': '#e94560', '技能提升': '#53a8b6', '项目完成': '#f5a623',
  '重要决策': '#7c4dff', '学习笔记': '#0f3460'
}[t] || '#a0aec0')

const tagType = (t) => ({
  '里程碑': 'danger', '技能提升': '', '项目完成': 'warning',
  '重要决策': 'success', '学习笔记': 'info'
}[t] || 'info')

const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({
  title: '', date: new Date().toISOString().slice(0, 10),
  event_type: '里程碑', description: ''
})

const resetForm = () => {
  Object.assign(form, { title: '', date: new Date().toISOString().slice(0, 10), event_type: '里程碑', description: '' })
  editingId.value = null
}

const loadList = async () => {
  try {
    const res = await getTimelineEvents({ page: currentPage.value, page_size: pageSize.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      title: row.title || '', date: row.date || '',
      event_type: row.event_type || '里程碑', description: row.description || ''
    })
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.title.trim()) { ElMessage.warning('请输入标题'); return }
  try {
    saving.value = true
    if (editingId.value) {
      await updateTimelineEvent(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createTimelineEvent({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } finally { saving.value = false }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该事件？', '提示', { type: 'warning' })
  await deleteTimelineEvent(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>

<style scoped>
.timeline-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  margin-bottom: 4px;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.timeline-header h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: 16px;
}

.timeline-desc {
  color: var(--text-secondary);
  margin: 8px 0;
  line-height: 1.6;
}

.timeline-actions {
  margin-top: 8px;
}
</style>
