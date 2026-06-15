<template>
  <div class="projects">
    <div class="page-header">
      <h2>项目资产</h2>
    </div>

    <div class="search-bar">
      <el-input v-model="search" placeholder="搜索项目..." clearable style="width: 300px" @clear="loadList" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">搜索</el-button>
      <el-button type="primary" @click="openDialog()">新增项目</el-button>
    </div>

    <el-table :data="list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="项目名称" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ row.status || '进行中' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tech_stack" label="技术栈" show-overflow-tooltip />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="updated_at" label="更新时间" width="170" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > pageSize"
      style="margin-top: 16px; justify-content: flex-end"
      background layout="prev, pager, next"
      :total="total" :page-size="pageSize"
      v-model:current-page="currentPage" @current-change="loadList"
    />

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑项目' : '新增项目'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="项目名">
          <el-input v-model="form.name" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="规划中" value="规划中" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已暂停" value="已暂停" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已归档" value="已归档" />
          </el-select>
        </el-form-item>
        <el-form-item label="技术栈">
          <el-input v-model="form.tech_stack" placeholder="如：Vue3, Python, PostgreSQL" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="项目描述" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="form.tags" placeholder="标签，用逗号分隔" />
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
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects'

const statusType = (s) => ({
  '已完成': 'success', '进行中': 'warning', '已暂停': 'danger',
  '规划中': 'info', '已归档': 'info'
}[s] || 'info')

const search = ref('')
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({ name: '', status: '进行中', tech_stack: '', description: '', tags: '' })

const resetForm = () => {
  Object.assign(form, { name: '', status: '进行中', tech_stack: '', description: '', tags: '' })
  editingId.value = null
}

const loadList = async () => {
  try {
    const res = await getProjects({ page: currentPage.value, page_size: pageSize.value, search: search.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      name: row.name || '', status: row.status || '进行中',
      tech_stack: row.tech_stack || '', description: row.description || '', tags: row.tags || ''
    })
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.name.trim()) { ElMessage.warning('请输入项目名'); return }
  try {
    saving.value = true
    if (editingId.value) {
      await updateProject(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createProject({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } finally { saving.value = false }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该项目？', '提示', { type: 'warning' })
  await deleteProject(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>
