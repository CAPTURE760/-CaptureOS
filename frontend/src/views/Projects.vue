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
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ row.status || '进行中' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="80" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column prop="github_url" label="GitHub" width="120" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑项目' : '新增项目'" width="700px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="项目名">
          <el-input v-model="form.name" placeholder="项目名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="规划中" value="规划中" />
                <el-option label="进行中" value="进行中" />
                <el-option label="已暂停" value="已暂停" />
                <el-option label="已完成" value="已完成" />
                <el-option label="已归档" value="已归档" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本">
              <el-input v-model="form.version" placeholder="如：v1.0.0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="GitHub 地址">
          <el-input v-model="form.github_url" placeholder="https://github.com/..." />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="项目描述" />
        </el-form-item>
        <el-form-item label="下一步计划">
          <el-input v-model="form.next_plan" type="textarea" :rows="3" placeholder="接下来要做什么" />
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

const form = reactive({ name: '', description: '', github_url: '', status: '进行中', version: '', next_plan: '' })

const resetForm = () => {
  Object.assign(form, { name: '', description: '', github_url: '', status: '进行中', version: '', next_plan: '' })
  editingId.value = null
}

const loadList = async () => {
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const res = await getProjects({ skip, limit: pageSize.value, search: search.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      name: row.name || '', description: row.description || '',
      github_url: row.github_url || '', status: row.status || '进行中',
      version: row.version || '', next_plan: row.next_plan || ''
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
