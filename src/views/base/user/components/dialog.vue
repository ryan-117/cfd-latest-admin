<template>
  <el-dialog v-model="dialogVisible" title="编辑" @close="handleClose">
    <el-form :model="state.form" ref="formRef" label-width="84px">

      <el-form-item label="用户名" prop="username">
        <el-input v-model="state.form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>

      <el-form-item label="密码" prop="key">
        <el-input v-model="state.form.password" placeholder="请输入密码"></el-input>
      </el-form-item>

      <el-form-item label="角色" prop="role_id">
        <el-select v-model="state.form.role_id" value-key="id" class="m-2" placeholder="请选择角色" size="large"
          style="width: 240px">
          <el-option v-for="item in state.roleList" :key="item.name" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>


      <el-form-item label="状态">
        <el-radio-group v-model="state.form.status">
          <el-radio label="显示" value="1">正常</el-radio>
          <el-radio label="隐藏" value="2">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="handleClose">取消</el-button>
        <el-button type="primary" @click="handleClick(formRef)">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup>
// 在原有import基础上添加
import { rolelist, roleDetail, detail, create, update } from '../api/index.js'
import {
  ref,
  reactive,
  defineProps,
  defineEmits,
  computed,
  watch,
} from 'vue'


const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  id: {
    type: Number,
    default: 0,
  },
})

const formRef = ref(null);

const userId = ref(0); // 存储当前角色的 id


const emit = defineEmits(['update:visible']);
const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
});


//数据
const state = reactive({
  roleList: [],
  form: {
    username: '',
    password: '',
    status: '1',
    role_id: ''
  },
})

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      //菜单列表
      getList()
      if (props.id > 0) {
        const id = Number(props.id)
        userId.value = id;
        await getDetail(id)
        await getRoleDetail(id)
      }
    } else {
      resetForm()
    }
  },
)

//所有权限菜单
const getList = async () => {
  try {
    const res = await rolelist()
    if (res.code === 200) {
      let data = res.data.list || [];
      state.roleList = data
    }
  } catch (error) {
    console.log(error)
  }
}
//权限菜单
const getRoleDetail = async (id) => {
  try {
    let res = await roleDetail({ user_id: id })
    if (res.code == 200) {
      let id = res.data.role_id;
      state.form.role_id = id;
    }
  } catch (error) {
    console.error(error)
  }
}

//创建菜单
const createMenu = async () => {
  try {
    let data = state.form;
    const res = await create(data)
    if (res.code === 200) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '创建成功 ^_^',
        type: 'success',
      })
      handleClose()
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  } catch (error) {
    console.log(error)
  }
}

//更新菜单
const updateMenu = async () => {
  try {
    let params = { userId: userId.value, ...state.form };
    const res = await update(params)
    if (res.code === 200) {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: '更新成功 ^_^',
        type: 'success',
      })
      handleClose()
    } else {
      // eslint-disable-next-line no-undef
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  } catch (error) {
    console.log(error)
  }
}


//角色详情
const getDetail = async (id) => {
  try {
    let res = await detail({ id: id })
    if (res.code == 200) {
      let { username, status } = res.data
      state.form = { username, password: '', status }
    }
  } catch (error) {
    console.error(error)
  }
}

const handleClick = formRef => {
  if (formRef) {
    formRef.validate(valid => {
      if (valid) {
        if (userId.value == 0) {
          //创建角色
          createMenu()
          //创建角色菜单
          // handleRoleMenuCreate()
        } else {
          //更新角色
          updateMenu()

        }
      } else {
        console.log('error submit!!')
        return false
      }
    })
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  state.form = {
    username: '',
    password: '',
    status: '1',
    role_id: ''
  }
  userId.value = 0;

}

</script>

<style scoped>
.icon-list {
  max-height: 60vh;
  overflow-y: auto;
}

.icon-item {
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 2em;
  height: 2em;
}

.icon-name {
  font-size: 12px;
  text-align: center;
  word-break: break-all;
}

.icon-suffix {
  width: 1em;
  height: 1em;
  vertical-align: middle;
}

/* 新增样式 */
.icon-suffix-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
}

.clear-icon {
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.clear-icon:hover {
  color: #666;
}

.selected-icon {
  width: 1em;
  height: 1em;
}
</style>
