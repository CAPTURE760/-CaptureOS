<template>
  <div class="time-record">
    <div class="page-header">
      <h2>时间流向</h2>
    </div>

    <el-card class="form-card">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="日期">
              <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="工作(小时)">
              <el-input-number v-model="form.work_hours" :min="0" :max="24" :precision="1" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学习(小时)">
              <el-input-number v-model="form.study_hours" :min="0" :max="24" :precision="1" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目(小时)">
              <el-input-number v-model="form.project_hours" :min="0" :max="24" :precision="1" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="娱乐(小时)">
              <el-input-number v-model="form.entertainment_hours" :min="0" :max="24" :precision="1" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="其他(小时)">
              <el-input-number v-model="form.other_hours" :min="0" :max="24" :precision="1" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">提交记录</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图表 -->
    <div class="chart-container" style="margin-top: 20px">
      <h3>最近7天时间分配</h3>
      <Bar :data="chartData" :options="chartOptions" v-if="chartData.labels" />
      <div v-else class="chart-placeholder">暂无数据</div>
    </div>

    <!-- 历史列表 -->
    <el-card style="margin-top: 20px">
      <template #header><span>历史记录</span></template>
      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="work_hours" label="工作" width="80" />
        <el-table-column prop="study_hours" label="学习" width="80" />
        <el-table-column prop="project_hours" label="项目" width="80" />
        <el-table-column prop="entertainment_hours" label="娱乐" width="80" />
        <el-table-column prop="other_hours" label="其他" width="80" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js'
import { getTimeRecords, createTimeRecord, deleteTimeRecord } from '../api/timeRecords'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  work_hours: 0, study_hours: 0, project_hours: 0,
  entertainment_hours: 0, other_hours: 0
})

const submitting = ref(false)
const list = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const chartData = computed(() => {
  if (!list.value.length) return {}
  const recent = list.value.slice(0, 7).reverse()
  return {
    labels: recent.map(d => d.date),
    datasets: [
      { label: '工作', data: recent.map(d => d.work_hours), backgroundColor: '#e94560' },
      { label: '学习', data: recent.map(d => d.study_hours), backgroundColor: '#0f3460' },
      { label: '项目', data: recent.map(d => d.project_hours), backgroundColor: '#53a8b6' },
      { label: '娱乐', data: recent.map(d => d.entertainment_hours), backgroundColor: '#f5a623' },
      { label: '其他', data: recent.map(d => d.other_hours), backgroundColor: '#7c4dff' }
    ]
  }
})

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#a0aec0' } } },
  scales: {
    x: { stacked: true, ticks: { color: '#a0aec0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { stacked: true, ticks: { color: '#a0aec0' }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
  }
}

const loadList = async () => {
  try {
    const res = await getTimeRecords({ page: currentPage.value, page_size: pageSize.value })
    list.value = res.items || res.data || res || []
    total.value = res.total || list.value.length
  } catch (e) { /* silent */ }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    await createTimeRecord({ ...form })
    ElMessage.success('记录提交成功')
    Object.assign(form, { work_hours: 0, study_hours: 0, project_hours: 0, entertainment_hours: 0, other_hours: 0 })
    loadList()
  } finally { submitting.value = false }
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该记录？', '提示', { type: 'warning' })
  await deleteTimeRecord(id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(loadList)
</script>

<style scoped>
.form-card { margin-bottom: 20px; }
.chart-container { min-height: 300px; }
.chart-placeholder { height: 250px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
</style>
