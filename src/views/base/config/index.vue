<template>
  <div class="bg-fff radius-6 pd-20">
    <el-row type="flex" justify="end">
      <el-button type="primary" @click="handleAdd" round>新增</el-button>
    </el-row>

    <div class="mr-10 ml-10">
      <el-table :data="state.list" tooltip-effect="dark" row-key="id" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection"></el-table-column> -->
        <el-table-column prop="id" width="100" label="编号"></el-table-column>
        <el-table-column prop="type_code" label="标识"></el-table-column>
        <el-table-column prop="config_key" label="配置名称"></el-table-column>
        <!-- <el-table-column prop="config_value" label="配置值"></el-table-column> -->
        <el-table-column prop="status" label="是否启用">
          <template #default="scope">
            {{ scope.row.status == 1 ? "启用" : "关闭" }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="200" label="操作">
          <template #default="scope">

            <el-button :icon="Edit" v-permission-disabled="['editor','admin','super']"  circle @click="toEdit(scope.row)"></el-button>

            <el-popconfirm width="220" @confirm="() => handleDel(scope.row)" confirm-button-text="确定"
              cancel-button-text="取消" icon-color="#626AEF" title="你确定吗？要删管理员？">
              <template #reference>
                <el-button :icon="Delete" v-permission-disabled="['editor','admin','super']"  :disabled="username === scope.row.username" circle></el-button>
              </template>
            </el-popconfirm>
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
    <Dialog v-model:visible="state.dialogVisible" :id="state.id" :type_code="state.params.type_code">
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router'
import {Delete, Edit, QuestionFilled } from "@element-plus/icons-vue";
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
  params: {
    type_code: '',
  },
  list: [],
})

const route = useRoute()

watch(() => state.dialogVisible, (newVal) => {
  if (!newVal) {
    getConfigTypeList();
  }
});

const getConfigTypeList = async () => {
  try {
    let params = state.params;
    const res = await list(params);
    if (res.code === 200) {
      let obj = {};
      res.data.list.forEach(v => {
        console.log()
        obj[v.config_key] = typeof v.config_value === 'string' ? v.config_value:JSON.parse(v.config_value) ;
      })
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
  state.params.type_code = route.params.id;
  getConfigTypeList();
});
</script>
<style scoped></style>
