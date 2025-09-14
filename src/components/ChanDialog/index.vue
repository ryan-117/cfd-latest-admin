<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    @close="handleClose"
  >
    <slot></slot>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '标题',
  },
  width: {
    type: String,
    default: '50%',
  },
});

const emit = defineEmits(['update:modelValue', 'confirm']);

// 使用 computed 实现 v-model 的双向绑定
const dialogVisible = computed({
  get() {
    return props.modelValue; // 获取父组件传递的值
  },
  set(value) {
    emit('update:modelValue', value); // 更新父组件的值
  },
});

const handleConfirm = () => {
  emit('confirm'); // 触发 confirm 事件
  dialogVisible.value = false; // 关闭对话框
};

const handleClose = () => {
  dialogVisible.value = false; // 关闭对话框
};
</script>
