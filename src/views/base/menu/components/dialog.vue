<template>
  <el-dialog v-model="dialogVisible" title="编辑" @close="handleClose">
    <el-form :model="state.form" ref="formRef" label-width="84px">
      <el-form-item label="节点类型" prop="type">
        <el-radio-group v-model="state.form.type">
          <el-radio label="目录" value="M">目录</el-radio>
          <el-radio label="菜单" value="C">菜单</el-radio>
          <el-radio label="按钮" value="F">按钮</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="上级节点" prop="pid">
        <el-tree-select
          v-model="state.form.pid"
          :data="state.menus"
          :render-after-expand="false"
          check-strictly
          :show-count="true"
          node-key="id"
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="节点名称" prop="title">
        <el-input
          v-model="state.form.title"
          placeholder="请输入节点名称"
        ></el-input>
      </el-form-item>

      <el-form-item label="节点图标" v-if="state.form.type !== 'F'">
        <el-input
          v-model="state.form.icon"
          placeholder="点击选择图标"
          readonly
          @click="showIconDialog = true"
        >
          <template #suffix>
            <span class="icon-suffix-container">
              <el-icon
                v-if="state.form.icon"
                class="clear-icon"
                @click.stop="clearIcon"
              >
                <Close />
              </el-icon>
              <component
                v-if="state.form.icon"
                :is="state.form.icon"
                class="selected-icon"
              />
            </span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        label="显示排序"
        prop="order_num"
        v-if="state.form.type !== 'F'"
      >
        <el-input
          v-model="state.form.order_num"
          type="number"
          placeholder="请输入菜单排序"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="路由名称"
        prop="name"
        v-if="state.form.type == 'C' || state.form.type == 'M'"
      >
        <el-input
          v-model="state.form.name"
          placeholder="请输入菜单名称"
        ></el-input>
      </el-form-item>

      <el-form-item
        label="路由地址"
        v-if="state.form.type == 'C' || state.form.type == 'M'"
      >
        <el-input
          v-model="state.form.path"
          placeholder="请输入路由地址"
        ></el-input>
      </el-form-item>

      <div v-if="state.form.type == 'C'">
        <el-form-item label="组件路径">
          <el-input
            v-model="state.form.component"
            placeholder="请输入组件路径"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否缓存">
          <el-radio-group v-model="state.form.is_cache">
            <el-radio label="缓存" value="1">缓存</el-radio>
            <el-radio label="不缓存" value="2">不缓存</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示状态">
          <el-radio-group v-model="state.form.is_show">
            <el-radio label="显示" value="1">显示</el-radio>
            <el-radio label="隐藏" value="2">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      <el-form-item
        label="权限字符"
        :rules="[
          {
            required: true,
            message: '请输入权限字符',
            trigger: 'blur',
          },
        ]"
      >
        <el-input
          v-model="state.form.perms"
          require=""
          placeholder="请输入权限标识"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="handleClose">取消</el-button>
        <el-button type="primary" @click="handleClick(formRef)">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 图标选择对话框 -->
  <el-dialog
    v-model="showIconDialog"
    title="选择图标"
    width="60%"
    append-to-body
  >
    <div class="icon-list">
      <el-row :gutter="20">
        <!-- 修改这里：遍历自定义图标列表 -->
        <el-col
          v-for="iconName in selectedIcons"
          :key="iconName"
          :xs="8"
          :sm="6"
          :md="4"
          :lg="3"
          :xl="2"
          class="icon-item"
          @click="handleIconSelect(iconName)"
        >
          <div class="icon-wrapper">
            <!-- 通过图标名称获取组件 -->
            <component :is="ElementPlusIconsVue[iconName]" class="icon" />
            <span class="icon-name">{{ iconName }}</span>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script setup>
// 在原有import基础上添加
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { tree, addLabelValue } from '@/utils/tool.js'
import { list, detail, create, update } from '../api/index.js'
import { ref, reactive, defineProps, defineEmits, computed, watch } from 'vue'

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

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit('update:visible', val),
})

const formRef = ref(null)

const state = reactive({
  menus: [],
  form: {
    id: 0,
    pid: '',
    title: '',
    name: '',
    order_num: '0',
    path: '',
    component: '',
    is_frame: '2',
    type: 'M',
    is_show: '1',
    is_cache: '2',
    perms: '',
    icon: '',
  },
})

watch(
  () => props.visible,
  async newVal => {
    if (newVal) {
      getList()
      const newIdNumber = Number(props.id) || 0
      alert(newIdNumber)
      state.form.id = newIdNumber
      getDetail(newIdNumber)
    }
  },
)

// watch(
//   () => props.id,
//   async newVal => {
//     console.log('props-->', props.id)
//     if (newVal > 0) {
//       const newIdNumber = Number(props.id)
//       state.form.id = newIdNumber
//       getDetail(newIdNumber)
//     }
//   },
// )

const getDetail = async () => {
  try {
    let id = state.form.id
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
        state.form.id ? updateMenu() : createMenu()
      } else {
        console.log('error submit!!')
        return false
      }
    })
  }
}

const createMenu = async () => {
  try {
    let { id, ...params } = state.form
    let _params = params
    if (id > 0) {
      _params.id = id
    }
    const res = await create(_params)
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

const updateMenu = async () => {
  try {
    let params = state.form
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

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

const resetForm = () => {
  state.form = {
    id: 0,
    pid: '',
    title: '',
    name: '',
    order_num: '0',
    path: '',
    component: '',
    is_frame: '2',
    type: 'M',
    is_show: '1',
    is_cache: '2',
    perms: '',
    icon: '',
  }
  state.menus = []
}

// onMounted(() => {
//   getList()
// })

const getList = async () => {
  try {
    const res = await list()
    if (res.code === 200) {
      const menu = { id: 0, label: '主类目', children: [] }
      const data = tree(res.data.list)
      const dealData = addLabelValue(data, 'title', 'id')
      menu.children = dealData
      state.menus = [menu]
    }
  } catch (error) {
    console.log(error)
  }
}
getList()
// 添加图标对话框显示状态
const showIconDialog = ref(false)
// 自定义需要显示的图标列表（按需配置）
const selectedIcons = ref([
  'DataLine',
  'Monitor',
  'Grid',
  'MagicStick',
  'Operation',
  'Setting',
  'User',
  'House',
  'Notification',
  'MessageBox',
  'DataBoard',
  'Notebook',
  'Collection',
  'Postcard',
  'SetUp',
  'DataAnalysis',
  'CreditCard',
  'Cpu',
  'Link',
  'Connection',
  'Position',
  'Odometer',
  'ChatLineRound',
  'ChatSquare',
  'ChatRound',
  'ChatLineSquare',
  'ChatDotSquare',
  'Bell',
  'PieChart',
  'Compass',
  'Filter',
  'Message',
  'MessageBox',
  'Crop',
  'SwitchButton',
  'Operation',
  'DataLine',
  'Monitor',
  'Location',
  'Guide',
  'Box',
  'MagicStick',
  'Goods',
  'Coin',
])

// 在setup部分添加清除方法
const clearIcon = () => {
  state.form.icon = ''
  // 如果需要可以触发验证更新
  if (formRef.value) {
    formRef.value.validateField('icon')
  }
}
// 添加图标选择处理函数
const handleIconSelect = iconName => {
  state.form.icon = iconName
  showIconDialog.value = false
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
