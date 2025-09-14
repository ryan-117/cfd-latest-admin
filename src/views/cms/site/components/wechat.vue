<template>
  <div class="mr-10 ml-10">
    <!-- 微信配置 -->
    <el-tab-pane label="微信配置" class="mt-20" name="wechat">
      <el-form ref="setFormRef" :model="state.set" label-width="80px">
        <el-form-item
          label="appid"
          prop="appid"
          :rules="[
            {
              required: true,
              message: '请输入appid',
              trigger: 'blur',
            },
          ]"
        >
          <el-input v-model="state.set.appid"></el-input>
        </el-form-item>

        <el-form-item prop="secret" label="secret">
          <el-input
            v-model="state.set.secret"
            :rules="[
              {
                required: true,
                message: '请输入secret',
                trigger: 'blur',
              },
            ]"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getlist, updateMany } from '../api/index.js'
const state = reactive({
  loading: true,
  set: {
    appid: '',
    secret: '',
  },
  list: [],
})

const setFormRef = ref(null)

onMounted(async () => {
  await query()
})

// 查询
async function query() {
  try {
    const res = await getlist({
      type_code: 'wechat_minip',
    })
    if (res.code === 200) {
      state.loading = false
      let data = res.data.list
      data.map(item => {
        state.set[item.config_key] = item.config_value
        state.list.push({
          query: { id: item.id },
          params: {
            config_value: item.config_value,
            config_key: item.config_key,
          },
        })
      })
    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// 更新配置
async function updateWechat() {
  try {
    state.list.map(item => {
      item.params.config_value = state.set[item.params.config_key]
      delete item.params.config_key
    })
    let params = state.list
    const res = await updateMany(params)
    if (res.code === 200) {
      ElMessage({
        message: '更新成功^_^',
        type: 'success',
      })
      await query()
    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  } catch (error) {
    console.log(error)
  }
}

// 提交表单
function handleSubmit() {
  setFormRef.value.validate(async valid => {
    if (valid) {
      await updateWechat()
    } else {
      console.log('error submit!!')
      return false
    }
  })
}
</script>

<style scoped></style>
