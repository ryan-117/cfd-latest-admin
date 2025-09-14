<template>
  <el-dialog v-model="dialogVisible" title="编辑" @close="handleClose">
    <el-form :model="state.form" ref="formRef" label-width="84px">

      <el-form-item label="角色名称" prop="name">
        <el-input v-model="state.form.name" placeholder="请输入角色名称"></el-input>
      </el-form-item>

      <el-form-item label="角色标识" prop="key">
        <el-input v-model="state.form.key" placeholder="请输入角色标识"></el-input>
      </el-form-item>

      <el-form-item label="角色顺序" prop="sort">
        <el-input v-model="state.form.sort" type="number" placeholder="请输入角色顺序"></el-input>
      </el-form-item>

      <el-form-item label="权限菜单" prop="pid">

        <el-tree @check="handleCheckChange" :data="state.menus" :default-checked-keys="checkedKeys" multiple
          ref="treeRef" :render-after-expand="false" show-checkbox check-on-click-node :show-count="true" node-key="id"
          class="w-full" />
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
import { tree, addLabelValue } from '@/utils/tool.js'

import { menuList, detail, create, update, roleMenuList, } from '../api/index.js'
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
const treeRef = ref(null); // 用于访问树组件的方法，如设置选中的节点等
const checkedKeys = ref([]); // 存储选中节点的 key 的数组
const roleId = ref(0); // 存储当前角色的 id

const handleCheckChange = (checkedNode, { checkedKeys: currentKeys }) => {
  checkedKeys.value = currentKeys
};
const emit = defineEmits(['update:visible', 'success']);
const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
});


//数据
const state = reactive({
  menus: [],
  form: {
    name: '',
    key: '',
    sort: '0',
    status: '1'
  },
})

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      //菜单列表
      getList()
      if (props.id > 0) {
        // 这里替换实际的API调用
        const id = Number(props.id)
        roleId.value = id;
        getDetail(id)
        getRoleMenuList(id)
      }
    }
  },
)

//所有权限菜单
const getList = async () => {
  try {
    const res = await menuList()
    if (res.code === 200) {
      const data = tree(res.data.list);
      const dealData = addLabelValue(data, 'title', 'id');
      state.menus = dealData;
    }
  } catch (error) {
    console.log(error)
  }
}
//权限菜单
const getRoleMenuList = async (id) => {
  try {

    let res = await roleMenuList({ id })
    console.log('res--->',res)
    if (res.code == 200) {
      let data = res.data.list.map(item => item.menu_id);
      checkedKeys.value = [...data];
    }

  } catch (error) {
    console.error(error)
  }
}

//创建菜单
const createMenu = async () => {
  try {

    const res = await create({ roleData: state.form, menuIds: checkedKeys.value })
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
    let params = { roleId: roleId.value, roleData: state.form, menuIds: checkedKeys.value };

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
      state.form = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

const handleClick = formRef => {
  if (formRef) {
    formRef.validate(valid => {
      if (valid) {
        if (roleId.value == 0) {
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
    name: '',
    key: '',
    sort: '0',
    status: '1',
  }

  state.menus = []
  roleId.value = 0;
  checkedKeys.value = []

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
