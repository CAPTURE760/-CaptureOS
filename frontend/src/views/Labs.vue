<template>
  <div class="labs">
    <div class="page-header">
      <h2>实验室</h2>
    </div>

    <div class="search-bar">
      <el-input v-model="search" placeholder="搜索实验记录..." clearable style="width: 300px" @clear="loadList" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">搜索</el-button>
      <el-button type="primary" @click="openDialog()">新增记录</el-button>
    </div>

    <el-table :data="list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="实验标题" show-overflow-tooltip />
      <el-table-column prop="goal" label="目标" show-overflow-tooltip />
      <el-table-column prop="environment" label="环境" width="140" show-overflow-tooltip />
      <el-table-column prop="result" label="结果" show-overflow-tooltip />
      <el-table-column prop="summary" label="总结" show-overflow-tooltip />
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
      background layout="prev, pager, next"
      :total="total" :page-size="pageSize"
      v-model:current-page="currentPage" @current-change="loadList"
    />

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑实验' : '新增实验'" width="700px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="实验标题" />
        </el-form-item>
        <el-form-item label="实验目标">
          <el-input v-model="form.goal" type="textarea" :rows="2" placeholder="这次实验要验证什么" />
        </el-form-item>
        <el-form-item label="实验环境">
          <el-input v-model="form.environment" placeholder="如：Ubuntu 22.04, Python 3.11" />
        </el-form-item>
        <el-form-item label="实验步骤">
          <el-input v-model="form.steps" type="textarea" :rows="4" placeholder="详细的实验步骤" />
        </el-form-item>
        <el-form-item label="实验结果">
          <el-input v-model="form.result" type="textarea" :rows="3" placeholder="实验结果" />
        </el-form-item>
        <el-form-item label="踩坑记录">
          <el-input v-model="form.pitfalls" type="textarea" :rows="2" placeholder="过程中遇到的问题" />
        </el-form-item>
        <el-form-item label="总结">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="实验总结与收获" />
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
import { getLabs, createLab, updateLab, deleteLab } from '../api/labs'

const search = ref('')
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({ title: '', goal: '', environment: '', steps: '', result: '', pitfalls: '', summary: '' })

const resetForm = () => {
  Object.assign(form, { title: '', goal: '', environment: '', steps: '', result: '', pitfalls: '', summary: '' })
  editingId.value = null
}

const loadList = async () => {
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const res = await getLabs({ skip, limit: pageSize.value, search: search.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      title: row.title || '', goal: row.goal || '', environment: row.environment || '',
      steps: row.steps || '', result: row.result || '', pitfalls: row.pitfalls || '', summary: row.summary || ''
    })
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.title.trim()) { ElMessage.warning('请输入标题'); return }
  if (!form.goal.trim()) { ElMessage.warning('请输入实验目标'); return }
  try {
    saving.value = true
    if (editingId.value) {
      await updateLab(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createLab({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } finally { saving.value = false }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该记录？', '提示', { type: 'warning' })
  await deleteLab(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>
