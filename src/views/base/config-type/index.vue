<template>
  <div class="bg-fff radius-6 pd-20">
    <el-row type="flex" justify="end">
      <el-button type="primary" v-permission-disabled="['editor','admin','super']"  @click="handleAdd" round>新增</el-button>
    </el-row>

    <div class="mr-10 ml-10">
      <el-table :data="state.list" tooltip-effect="dark" row-key="id" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection"></el-table-column> -->
        <el-table-column prop="id" width="100" label="编号"></el-table-column>
        <el-table-column prop="type_code" label="标识"></el-table-column>
        <el-table-column prop="type_name" label="名称"></el-table-column>
        <el-table-column prop="status" label="是否启用">
          <template #default="scope">
            {{ scope.row.status == 1 ? "启用" : "关闭" }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="200" label="操作">
          <template #default="scope">

            <el-button :icon="View" circle @click="handleClick(scope.row)"></el-button>

            <el-button :icon="Edit" v-permission-disabled="['editor','admin','super']"  circle @click="toEdit(scope.row)"></el-button>
            <el-button :icon="Delete" v-permission-disabled="['editor','admin','super']"  @click="handleDelMessage(scope.row)" :disabled="username === scope.row.username"
              circle></el-button>

            <el-tooltip v-if="username === scope.row.username" content="当前登录用户不可删除" effect="light"
              placement="top-start">
              <el-icon class="ml-10 t-4 pointer">
                <QuestionFilled class="c-165dff" />
              </el-icon>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination background layout="prev, pager, next" :total="count" :page-size="10" :model-value="cur"
        @update:model-value="handleCurrentChange" hide-on-single-page></el-pagination>


    </div>

    <!-- 新增&编辑弹窗 -->
    <Dialog v-model:visible="state.dialogVisible" :id="state.id">
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router'
import { View, Delete, Edit, QuestionFilled } from "@element-plus/icons-vue";
import { list, remove } from "./api/index.js";
import { getCookie } from "@/utils/tool";
import Dialog from './components/dialog.vue'

const multipleSelection = ref([]);
const count = ref(0);
const cur = ref(1);
const username = getCookie("username");

const state = reactive({
  dialogVisible: false,
  id: 0,
  params: {},
  list: [],
})

const router = useRouter()

watch(() => state.dialogVisible, (newVal) => {
  if (!newVal) {
    getConfigTypeList();
  }
});

const getConfigTypeList = async () => {
  try {
    const res = await list();
    if (res.code === 200) {
      state.list = [...res.data.list];
      count.value = res.data.total;
    }
  } catch (error) {
    console.log(error);
  }
};

const handleCurrentChange = (val) => {
  cur.value = val;
  getConfigTypeList();
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
};

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

const handleClick = (e) => {
  let { type_code } = e;
  router.push({
    name: 'config',
    params: {
      id: type_code,
    }
  });
}


const handleDelMessage = async (e) => {
  // eslint-disable-next-line no-undef
  ElMessageBox.confirm(
    '将会删除当前类型下所有配置，确定要继续?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      handleDel(e)
    })
    .catch(() => {
      // eslint-disable-next-line no-undef
      ElMessage({
        type: 'info',
        message: '取消成功',
      })
    })

};

const handleDel = async (e) => {
  try {
    const { id } = e;
    const res = await remove({ id });
    if (res.code === 200) {
      // eslint-disable-next-line no-undef
      ElMessage.success('删除成功 ^_^');
      getConfigTypeList();
    }
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  getConfigTypeList();
});
</script>
<style scoped></style>
