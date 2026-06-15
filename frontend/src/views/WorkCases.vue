<template>
  <div class="work-cases">
    <div class="page-header">
      <h2>工作案例</h2>
    </div>

    <div class="search-bar">
      <el-input v-model="search" placeholder="搜索案例..." clearable style="width: 300px" @clear="loadList" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">搜索</el-button>
      <el-button type="primary" @click="openDialog()">新增案例</el-button>
    </div>

    <el-table :data="list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="hospital_name" label="医院名称" width="140" show-overflow-tooltip />
      <el-table-column prop="system_type" label="系统类型" width="120" />
      <el-table-column prop="problem" label="问题" show-overflow-tooltip />
      <el-table-column prop="solution" label="解决方案" show-overflow-tooltip />
      <el-table-column prop="created_at" label="创建时间" width="170" />
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
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      v-model:current-page="currentPage"
      @current-change="loadList"
    />

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑案例' : '新增案例'" width="700px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="案例标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="医院名称">
              <el-input v-model="form.hospital_name" placeholder="医院名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统类型">
              <el-input v-model="form.system_type" placeholder="如：HIS、LIS、PACS" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="遇到的问题">
          <el-input v-model="form.problem" type="textarea" :rows="3" placeholder="描述遇到的问题" />
        </el-form-item>
        <el-form-item label="原因分析">
          <el-input v-model="form.reason" type="textarea" :rows="3" placeholder="问题原因分析" />
        </el-form-item>
        <el-form-item label="解决方案">
          <el-input v-model="form.solution" type="textarea" :rows="3" placeholder="解决方案" />
        </el-form-item>
        <el-form-item label="耗时">
          <el-input v-model="form.cost_time" placeholder="如：2小时" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="tagsInput" placeholder="标签，用逗号分隔" />
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
import { getWorkCases, createWorkCase, updateWorkCase, deleteWorkCase } from '../api/workCases'

const search = ref('')
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)
const tagsInput = ref('')

const form = reactive({
  title: '', hospital_name: '', system_type: '',
  problem: '', reason: '', solution: '', cost_time: ''
})

const resetForm = () => {
  Object.assign(form, { title: '', hospital_name: '', system_type: '', problem: '', reason: '', solution: '', cost_time: '' })
  tagsInput.value = ''
  editingId.value = null
}

const loadList = async () => {
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const res = await getWorkCases({ skip, limit: pageSize.value, search: search.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      title: row.title || '', hospital_name: row.hospital_name || '',
      system_type: row.system_type || '', problem: row.problem || '',
      reason: row.reason || '', solution: row.solution || '', cost_time: row.cost_time || ''
    })
    tagsInput.value = (row.tags || []).join(', ')
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.title.trim()) { ElMessage.warning('请输入标题'); return }
  const tags = tagsInput.value ? tagsInput.value.split(',').map(t => t.trim()).filter(Boolean) : []
  try {
    saving.value = true
    const payload = { ...form, tags }
    if (editingId.value) {
      await updateWorkCase(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await createWorkCase(payload)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } finally { saving.value = false }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该案例？', '提示', { type: 'warning' })
  await deleteWorkCase(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>
