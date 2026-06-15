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
      <el-table-column prop="environment" label="环境" width="120" show-overflow-tooltip />
      <el-table-column prop="symptom" label="故障现象" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑故障案例' : '新增故障案例'" width="700px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="故障标题" />
        </el-form-item>
        <el-form-item label="运行环境">
          <el-input v-model="form.environment" placeholder="如：CentOS 7.9 + MySQL 8.0" />
        </el-form-item>
        <el-form-item label="故障现象">
          <el-input v-model="form.symptom" type="textarea" :rows="3" placeholder="描述故障现象" />
        </el-form-item>
        <el-form-item label="根因分析">
          <el-input v-model="form.root_cause" type="textarea" :rows="3" placeholder="根因分析" />
        </el-form-item>
        <el-form-item label="解决方案">
          <el-input v-model="form.solution" type="textarea" :rows="3" placeholder="解决方案" />
        </el-form-item>
        <el-form-item label="预防措施">
          <el-input v-model="form.prevention" type="textarea" :rows="2" placeholder="如何预防再次发生" />
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
import { getFaultCases, createFaultCase, updateFaultCase, deleteFaultCase } from '../api/faultCases'

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
  title: '', environment: '', symptom: '', root_cause: '', solution: '', prevention: ''
})

const resetForm = () => {
  Object.assign(form, { title: '', environment: '', symptom: '', root_cause: '', solution: '', prevention: '' })
  tagsInput.value = ''
  editingId.value = null
}

const loadList = async () => {
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const res = await getFaultCases({ skip, limit: pageSize.value, search: search.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      title: row.title || '', environment: row.environment || '',
      symptom: row.symptom || '', root_cause: row.root_cause || '',
      solution: row.solution || '', prevention: row.prevention || ''
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
      await updateFaultCase(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await createFaultCase(payload)
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
