<template>
  <h1 class="logo overflow-h flex justify-center pt-10 pb-10 mb-10">
    <img src="@/assets/logo.png" class="icon mr-5" />
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
  height: 52px;
  box-shadow: 1px 1px 8px rgba(0, 0, 0, .06);
}

.icon {
  width: 32px;
  height: 32px;

}

.nowrap {
  white-space: nowrap;
}
</style>
