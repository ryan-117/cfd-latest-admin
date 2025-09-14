<template>
  <div>
    <!-- 搜索区域 -->
    <div class="bg-fff radius-6 pd-20 mb-10">
      <el-form :inline="true" :model="params">
        <el-form-item label="名称" prop="keywords">
          <el-input placeholder="请输入栏目名称" :suffix-icon="Search" v-model="params.keywords" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search" round>搜索</el-button>
          <el-button @click="clearSearch" round>清空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="bg-fff radius-6 pd-20">
      <div class="flex justify-end">
        <el-button type="primary" v-permission-disabled="['editor','admin','super']"  @click="handleAdd" round>新增</el-button>
      </div>
      <!-- //@selection-change="handleSelectionChange" -->
      <el-table ref="multipleTableRef" :data="state.list" tooltip-effect="dark" row-key="id" v-loading="loading">
        <!-- <el-table-column type="selection"></el-table-column> -->

        <el-table-column prop="id" label="角色编号"></el-table-column>

        <el-table-column prop="name" align="center" label="角色名称"></el-table-column>

        <el-table-column prop="key" align="center" label="权限标识"></el-table-column>

        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <p v-if="scope.row.status == '1'">启用</p>
            <p v-else>停用</p>
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="160">
          <template #default="scope">
            <el-button :icon="Edit" v-permission-disabled="['editor','admin','super']"  circle @click="toEdit(scope.row)"></el-button>
            <el-button :icon="Delete" v-permission-disabled="['editor','admin','super']"  circle @click="handleDel(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增&编辑弹窗 -->
    <Dialog v-model:visible="state.dialogVisible" :id="state.id" @success="getList">
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Delete, Edit, Search } from '@element-plus/icons-vue'

import { tree, addLabelValue } from '@/utils/tool.js'
import Dialog from './components/dialog.vue'
import { list, remove } from './api/index.js'
import dayjs from 'dayjs';
const state = reactive({
  dialogVisible: false,
  id: 0,
  params: {},
  list: [],
})

onMounted(() => {
  getList()
})

watch(() => state.dialogVisible, (newValue) => {
  if (!newValue) {
    getList()
  }
})


const getList = async () => {
  try {
    const res = await list()
    if (res.code === 200) {
      res.data.list.forEach(item => {
        item.id = Number(item.id);
        item.create_time = dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss');
      })
      state.list = res.data.list
      loading.value = false
    }
  } catch (error) {
    console.log(error)
  }
}

//编辑
const toEdit = row => {
  state.id = row.id
  state.dialogVisible = true
}
//新增
const handleAdd = () => {
  state.id = 0
  state.dialogVisible = true
}

//删除
const handleDel = async row => {
  console.log(row)
  try {
    const res = await remove({ id: row.id })
    if (res.code === 200) {

      // eslint-disable-next-line no-undef
      ElMessage({
        message: '删除成功',
        type: 'success',
      })
      getList()
    }
  } catch (error) {
    console.log(error)
  }
}

const params = reactive({
  keywords: '',
})
const loading = ref(true)
const tableData = ref([])
const multipleTableRef = ref(null)
const multipleSelection = ref([])

// 清空
const clearSearch = () => {
  params.keywords = ''
  tableData.value = []
  multipleSelection.value = []
  search()
}

// 查询
const search = async () => {
  try {
    const q = params.keywords
    const res = await fetch(q)
    if (res.code === 200) {
      const data = tree(res.data)
      tableData.value = addLabelValue(data)
      loading.value = false
    }
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  search()
})
</script>

<style scoped></style>
