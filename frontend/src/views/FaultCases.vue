<template>
  <div class="fault-cases">
    <div class="page-header">
      <h2>故障案例</h2>
    </div>

    <div class="search-bar">
      <el-input v-model="search" placeholder="搜索故障案例..." clearable style="width: 300px" @clear="loadList" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">搜索</el-button>
      <el-button type="primary" @click="openDialog()">新增案例</el-button>
    </div>

    <el-table :data="list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="故障标题" show-overflow-tooltip />
      <el-table-column prop="severity" label="严重程度" width="120">
        <template #default="{ row }">
          <el-tag :type="severityType(row.severity)">{{ row.severity || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="root_cause" label="根因分析" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑故障案例' : '新增故障案例'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="故障标题" />
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select v-model="form.severity" style="width: 100%">
            <el-option label="低" value="低" />
            <el-option label="中" value="中" />
            <el-option label="高" value="高" />
            <el-option label="严重" value="严重" />
          </el-select>
        </el-form-item>
        <el-form-item label="现象描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="故障现象" />
        </el-form-item>
        <el-form-item label="根因分析">
          <el-input v-model="form.root_cause" type="textarea" :rows="3" placeholder="根因分析" />
        </el-form-item>
        <el-form-item label="解决方案">
          <el-input v-model="form.solution" type="textarea" :rows="3" placeholder="解决方案" />
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
import { getFaultCases, createFaultCase, updateFaultCase, deleteFaultCase } from '../api/faultCases'

const severityType = (s) => {
  const map = { '低': 'info', '中': 'warning', '高': 'danger', '严重': 'danger' }
  return map[s] || 'info'
}

const search = ref('')
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({
  title: '', severity: '中', description: '', root_cause: '', solution: '', tags: ''
})

const resetForm = () => {
  Object.assign(form, { title: '', severity: '中', description: '', root_cause: '', solution: '', tags: '' })
  editingId.value = null
}

const loadList = async () => {
  try {
    const res = await getFaultCases({ page: currentPage.value, page_size: pageSize.value, search: search.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      title: row.title || '', severity: row.severity || '中',
      description: row.description || '', root_cause: row.root_cause || '',
      solution: row.solution || '', tags: row.tags || ''
    })
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.title.trim()) { ElMessage.warning('请输入标题'); return }
  try {
    saving.value = true
    if (editingId.value) {
      await updateFaultCase(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createFaultCase({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } finally { saving.value = false }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该案例？', '提示', { type: 'warning' })
  await deleteFaultCase(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>
