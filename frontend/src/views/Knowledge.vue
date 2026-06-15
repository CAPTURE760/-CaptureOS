<template>
  <div class="knowledge">
    <div class="page-header">
      <h2>知识卡片</h2>
    </div>

    <div class="search-bar">
      <el-input v-model="search" placeholder="搜索知识卡片..." clearable style="width: 300px" @clear="loadList" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">搜索</el-button>
      <el-button type="primary" @click="openDialog()">新增卡片</el-button>
    </div>

    <el-table :data="list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" show-overflow-tooltip />
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.category || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑知识卡片' : '新增知识卡片'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="知识标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="form.category" placeholder="知识分类" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="知识内容" />
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="form.source" placeholder="知识来源" />
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
import { getKnowledge, createKnowledge, updateKnowledge, deleteKnowledge } from '../api/knowledge'

const search = ref('')
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)
const dialogVisible = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = reactive({ title: '', category: '', content: '', source: '', tags: '' })

const resetForm = () => {
  Object.assign(form, { title: '', category: '', content: '', source: '', tags: '' })
  editingId.value = null
}

const loadList = async () => {
  try {
    const res = await getKnowledge({ page: currentPage.value, page_size: pageSize.value, search: search.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const openDialog = (row = null) => {
  resetForm()
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      title: row.title || '', category: row.category || '',
      content: row.content || '', source: row.source || '', tags: row.tags || ''
    })
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.title.trim()) { ElMessage.warning('请输入标题'); return }
  try {
    saving.value = true
    if (editingId.value) {
      await updateKnowledge(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createKnowledge({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } finally { saving.value = false }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该卡片？', '提示', { type: 'warning' })
  await deleteKnowledge(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>
