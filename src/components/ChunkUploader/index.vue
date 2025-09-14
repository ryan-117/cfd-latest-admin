<template>
  <div class="main">
    <el-upload
      class="upload-demo"
      :accept="acceptTypes"
      :limit="1"
      :file-list="files"
      :auto-upload="false"
      :before-remove="handleBeforeRemove"
      :on-change="handleFileChange"
      :on-remove="handleRemove"
    >
      <template #trigger>
        <el-button size="small">选择文件</el-button>
      </template>

      <el-button
        size="small"
        type="success"
        style="margin-left: 10px"
        :loading="uploading"
        :disabled="!selectedFile"
        @click="startUpload"
      >
        开始上传
      </el-button>

      <template #tip>
        <div v-if="uploadStatus" class="status">
          <el-progress
            :percentage="progress"
            :status="uploadStatus"
            :stroke-width="16"
          />
          <div class="meta">
            <span>{{ speed }}/s</span>
            <span>{{ remaining }}剩余</span>
          </div>
        </div>
        <div v-if="uploading" class="el-upload__tip">
          正在上传中，选择新文件将取消当前传输
        </div>
      </template>
    </el-upload>

    <div class="desc">
      <span class="label">文件描述：</span>
      <el-input v-model="description" type="textarea" rows="2" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SparkMD5 from 'spark-md5'
import axios from 'axios'

const CHUNK_SIZE = 50 * 1024 * 1024
const MAX_CONCURRENT = 3
const MAX_RETRY = 2

const props = defineProps({
  acceptTypes: { type: String, default: 'zip,apk,rar' },
  uploadUrl: { type: String, required: true },
  mergeUrl: { type: String, required: true }
})

const emit = defineEmits(['success', 'error', 'clear'])

const files = ref([])
const uploading = ref(false)
const selectedFile = ref(null)
const fileHash = ref('')
const description = ref('')
const progress = ref(0)
const uploadStatus = ref(null)
const startTime = ref(null)
const activeRequests = ref(new Set())
const totalSize = ref(0)

const speed = computed(() => {
  if (!startTime.value) return '0KB'
  const seconds = (Date.now() - startTime.value) / 1000
  return formatSize((progress.value / 100) * totalSize.value / seconds)
})

const remaining = computed(() => {
  if (!startTime.value || progress.value >= 100) return '0秒'
  const elapsed = (Date.now() - startTime.value) / 1000
  return `${Math.ceil((100 - progress.value) * elapsed / progress.value)}秒`
})

const handleFileChange = async (file) => {
  if (uploading.value) {
    abortAllRequests()
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  resetState()
  selectedFile.value = file.raw
  files.value = [file]
  totalSize.value = file.raw.size

  try {
    fileHash.value = await calculateHash()
  } catch (error) {
    handleError('文件处理失败', error)
  }
}

const calculateHash = () => new Promise(resolve => {
  const spark = new SparkMD5.ArrayBuffer()
  const reader = new FileReader()
  const file = selectedFile.value
  const size = file.size
  const offsets = [0, Math.floor(size/2), Math.max(0, size - CHUNK_SIZE)]
  let count = 0

  reader.onload = e => {
    spark.append(e.target.result)
    if (++count < 3) {
      reader.readAsArrayBuffer(file.slice(offsets[count], offsets[count] + CHUNK_SIZE))
    } else {
      resolve(spark.end())
    }
  }
  reader.readAsArrayBuffer(file.slice(offsets[0], offsets[0] + CHUNK_SIZE))
})

const startUpload = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  uploadStatus.value = 'uploading'
  startTime.value = Date.now()

  try {
    const totalChunks = Math.ceil(selectedFile.value.size / CHUNK_SIZE)
    await uploadChunks(totalChunks)

    const res = await axios.post(props.mergeUrl, {
      fileHash: fileHash.value,
      fileName: selectedFile.value.name,
      totalChunks,
      description: description.value
    })

    handleSuccess(res.data.path)
  } catch (error) {
    handleError('上传失败', error)
  } finally {
    uploading.value = false
  }
}

const uploadChunks = async (totalChunks) => {
  const chunks = Array.from({ length: totalChunks }, (_, i) =>
    selectedFile.value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
  )

  const pool = new Set()
  let uploadedSize = 0

  for (const [index, chunk] of chunks.entries()) {
    if (!selectedFile.value) throw new Error('上传已取消')

    for (let retry = 0; retry <= MAX_RETRY; retry++) {
      try {
        const controller = new AbortController()
        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('chunkIndex', index)
        formData.append('totalChunks', totalChunks)
        formData.append('fileHash', fileHash.value)

        const task = axios.post(props.uploadUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: controller.signal,
          onUploadProgress: e => {
            const delta = e.loaded - (e.total * (progress.value/100))
            uploadedSize = Math.min(uploadedSize + delta, totalSize.value)
            progress.value = (uploadedSize / totalSize.value * 100).toFixed(2)
          }
        }).then(() => {
          pool.delete(task)
          activeRequests.value.delete(controller)
        })

        activeRequests.value.add(controller)
        pool.add(task)

        if (pool.size >= MAX_CONCURRENT) {
          await Promise.race(pool)
        }
        break // 上传成功则跳出重试循环
      } catch (error) {
        if (retry === MAX_RETRY) throw error
      }
    }
  }
  await Promise.all(pool)
}

const abortAllRequests = () => {
  activeRequests.value.forEach(controller => controller.abort())
  activeRequests.value.clear()
}

const handleBeforeRemove = () => {
  return !uploading.value
}

const handleRemove = () => {
  abortAllRequests()
  resetState()
  selectedFile.value = null
  files.value = []
  emit('clear')
}

const handleSuccess = (path) => {
  progress.value = 100
  uploadStatus.value = 'success'
  emit('success', path)
}

const handleError = (msg, error) => {
  uploadStatus.value = 'exception'
  emit('error', { message: msg, error })
}

const resetState = () => {
  progress.value = 0
  fileHash.value = ''
  uploadStatus.value = null
  startTime.value = null
}

const formatSize = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length) {
    size /= 1024
    unit++
  }
  return `${size.toFixed(2)}${units[unit]}`
}
</script>

<style scoped>
.status {
  margin-top: 12px;
}
.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
.desc {
  margin-top: 16px;
}
.desc .label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}
.el-upload__tip {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 8px;
}
</style>