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
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ row.status || '进行中' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="hypothesis" label="假设" show-overflow-tooltip />
      <el-table-column prop="conclusion" label="结论" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑实验' : '新增实验'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="实验标题" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已放弃" value="已放弃" />
          </el-select>
        </el-form-item>
        <el-form-item label="假设">
          <el-input v-model="form.hypothesis" type="textarea" :rows="3" placeholder="实验假设" />
        </el-form-item>
        <el-form-item label="过程记录">
          <el-input v-model="form.process" type="textarea" :rows="4" placeholder="实验过程" />
        </el-form-item>
        <el-form-item label="结论">
          <el-input v-model="form.conclusion" type="textarea" :rows="3" placeholder="实验结论" />
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
import { getLabs, createLab, updateLab, deleteLab } from '../api/labs'

const statusType = (s) => ({ '已完成': 'success', '已放弃': 'info', '进行中': 'warning' }[s] || 'warning')

const search = ref('')
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({ title: '', status: '进行中', hypothesis: '', process: '', conclusion: '', tags: '' })

const resetForm = () => {
  Object.assign(form, { title: '', status: '进行中', hypothesis: '', process: '', conclusion: '', tags: '' })
  editingId.value = null
}

const loadList = async () => {
  try {
    const res = await getLabs({ page: currentPage.value, page_size: pageSize.value, search: search.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      title: row.title || '', status: row.status || '进行中',
      hypothesis: row.hypothesis || '', process: row.process || '',
      conclusion: row.conclusion || '', tags: row.tags || ''
    })
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.title.trim()) { ElMessage.warning('请输入标题'); return }
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
