<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form :inline="true" :model="params" label-width="68px" ref="formRef">
        <el-form-item label="标题" prop="keywords">
          <el-input
            placeholder="请输入姓名/电话/邮箱/公司"
            :suffix-icon="Search"
            v-model="params.keywords"
            clearable
            @clear="clearSearch"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="doSearch" round>搜索</el-button>
          <el-button @click="clearSearch('formRef')" round>清空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="radius-6 bg-fff pd-20">
      <el-table
        ref="multipleTableRef"
        :data="tableData"
        tooltip-effect="dark"
        row-key="id"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column prop="id" label="编号" width="80" fixed></el-table-column>
        <el-table-column prop="name" label="姓名"></el-table-column>
        <el-table-column prop="tel" label="电话" width="140"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="company" label="公司"></el-table-column>
        <el-table-column prop="province" label="所在省份"></el-table-column>
        <el-table-column prop="industry" label="行业"></el-table-column>
        <el-table-column prop="scene" label="试用场景"></el-table-column>
        <el-table-column label="试用产品">
          <template #default="scope">
            {{ formatProducts(scope.row.trial_products) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>

        <el-table-column fixed="right" label="操作" width="140">
          <template #default="scope">
            <el-button :icon="View" circle @click="openDetail(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-row type="flex" class="mt-20" justify="space-between">
        <el-pagination
          background
          layout="prev, pager, next"
          @current-change="handleCurrentChange"
          :page-size="pageSize"
          :total="count"
          v-model:currentPage="cur"
          hide-on-single-page
        ></el-pagination>
      </el-row>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog :model-value="showDetail" title="试用申请详情" width="600px" @close="closeDetail">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ detail.tel }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detail.email }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ detail.company }}</el-descriptions-item>
        <el-descriptions-item label="所在省份">{{ detail.province }}</el-descriptions-item>
        <el-descriptions-item label="行业">{{ detail.industry }}</el-descriptions-item>
        <el-descriptions-item label="试用场景">{{ detail.scene }}</el-descriptions-item>
        <el-descriptions-item label="试用产品">{{ formatProducts(detail.trial_products) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="closeDetail">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Delete, Edit, View, Search } from '@element-plus/icons-vue'
import { search, detail as getDetail} from '@/api/trial.js'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const multipleTableRef = ref(null)
const loading = ref(false)
const tableData = ref([])
const multipleSelection = ref([])
const count = ref(0)
const cur = ref(1)
const pageSize = ref(20)

const params = reactive({
  keywords: '',
})

// 详情相关
const showDetail = ref(false)
const detail = reactive({})

// 试用产品映射（参照建表注释）
const productMap = {
  CFD: '长风通用流体仿真分析软件',
  RASE: '汽车造型快速评估软件',
  AiAero: '智能风阻预测软件',
}

const formatProducts = (val) => {
  if (!val && val !== 0) return ''
  // 后端可能返回字符串 "CFD,RASE" 或数组，兼容处理
  const arr = Array.isArray(val) ? val : String(val).split(',').filter(Boolean)
  return arr.map((v) => productMap[v] || v).join('、')
}

// 清空搜索
const clearSearch = (str) => {
  if (str && formRef.value) {
    formRef.value.resetFields()
  }
  params.keywords = ''
  cur.value = 1
  router.replace({ name: route.name, query: { cur: 1 } })
  searchTrial()
}

// 执行搜索
const doSearch = () => {
  router.replace({ name: route.name, query: { cur: cur.value } })
  searchTrial()
}

// 查询列表
const searchTrial = async () => {
  try {
    loading.value = true
    const res = await search(cur.value)
    if (res && res.code === 200) {
      tableData.value = Array.isArray(res.data.list) ? res.data.list : []
      count.value = Number(res.data.count) || 0
      cur.value = Number(res.data.current) || p.page
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 翻页
const handleCurrentChange = (e) => {
  cur.value = e
  doSearch()
}

// 处理选中变化
const handleSelectionChange = (val) => {
  multipleSelection.value = val
}

// 打开详情（请求详情接口）
const openDetail = async (row) => {
  try {
    const res = await getDetail(row.id)
    if (res && res.code === 200) {
      Object.assign(detail, res.data || {})
      showDetail.value = true
    }
  } catch (err) {
    console.error(err)
  }
}

const closeDetail = () => {
  showDetail.value = false
  // 清空 detail
  for (const k in detail) {
    delete detail[k]
  }
}

// 路由 query 变化同步 page
watch(
  () => route.query,
  (newQuery) => {
    const qcur = Number(newQuery.cur) || 1
    cur.value = qcur
    searchTrial()
  },
  { immediate: true }
)

onMounted(() => {
  // 初始查询由 watch 触发
})
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 0px;
}

:deep(a) {
  color: #1f1f1f;
}

:deep(a:hover) {
  color: #165dff;
}
</style>
