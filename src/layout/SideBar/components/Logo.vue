<template>
  <h1 class="logo overflow-h flex justify-center pt-10 pb-10">
    <img src="@/assets/logo.png" class="icon" />
  </h1>
</template>

<script setup name="Logo">
import { defineProps } from 'vue'
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.logo {
  border-bottom: 1px solid #eee;
}

.icon {
  width: 100px;
  height: 100px;
}

.nowrap {
  white-space: nowrap;
}
</style>
