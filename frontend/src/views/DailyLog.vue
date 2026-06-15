<template>
  <div class="daily-log">
    <div class="page-header">
      <h2>今日记录</h2>
    </div>

    <el-card class="form-card">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="日期">
              <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="资产类型">
              <el-select v-model="form.asset_type" placeholder="选择类型" style="width: 100%">
                <el-option label="工作案例" value="work_case" />
                <el-option label="故障案例" value="fault_case" />
                <el-option label="知识卡片" value="knowledge" />
                <el-option label="实验记录" value="lab" />
                <el-option label="项目进展" value="project" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="内容">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="记录今天的工作内容..." />
        </el-form-item>
        <el-form-item label="今日收获">
          <el-input v-model="form.gain" type="textarea" :rows="3" placeholder="今天学到了什么..." />
        </el-form-item>
        <el-form-item label="今日问题">
          <el-input v-model="form.problem" type="textarea" :rows="3" placeholder="今天遇到了什么问题..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交记录</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>历史记录</span>
      </template>
      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="asset_type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ typeMap[row.asset_type] || row.asset_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="gain" label="收获" show-overflow-tooltip />
        <el-table-column prop="problem" label="问题" show-overflow-tooltip />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDailyLogs, createDailyLog, deleteDailyLog } from '../api/dailyLogs'

const typeMap = {
  work_case: '工作案例',
  fault_case: '故障案例',
  knowledge: '知识卡片',
  lab: '实验记录',
  project: '项目进展'
}

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  asset_type: 'work_case',
  content: '',
  gain: '',
  problem: ''
})

const submitting = ref(false)
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const loadList = async () => {
  try {
    const skip = (currentPage.value - 1) * pageSize.value
    const res = await getDailyLogs({ skip, limit: pageSize.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const handleSubmit = async () => {
  if (!form.content.trim()) {
    ElMessage.warning('请输入记录内容')
    return
  }
  try {
    submitting.value = true
    await createDailyLog({ ...form })
    ElMessage.success('记录提交成功')
    form.content = ''
    form.gain = ''
    form.problem = ''
    loadList()
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该记录？', '提示', { type: 'warning' })
  await deleteDailyLog(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>

<style scoped>
.form-card {
  margin-bottom: 20px;
}
</style>
