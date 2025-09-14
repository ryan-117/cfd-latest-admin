<template>
  <div class="editor-container">
      <VAceEditor
        v-model:value="localContent"
        :lang="editorMode"
        theme="monokai"
        :options="editorOptions"
        @init="editorInit"
        @change="handleContentChange"
        style="height: 100%; width: 100%"
      />
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-css'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-searchbox'

const props = defineProps({
  contentId: {
    type: [String, Number],
    required: true
  },
  fileType: {
    type: String,
    default: 'json',
    validator: (val) =>
      ['html', 'css', 'js', 'javascript', 'json', 'text'].includes(val.toLowerCase())
  },
  content: {
    type: String,
    default: ''
  }
})

const localContent = ref(props.content)
const originalContent = ref(props.content)
const hasChanges = ref(false)
const cursorPosition = ref(null)

const editorMode = computed(() => {
  const modeMap = {
    html: 'html',
    css: 'css',
    js: 'javascript',
    javascript: 'javascript',
    json: 'json'
  }
  return modeMap[props.fileType.toLowerCase()] || 'text'
})

const editorOptions = ref({
  fontSize: 14,
  tabSize: 2,
  showLineNumbers: true,
  highlightActiveLine: true,
  wrap: true,
  useWorker: false,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  showPrintMargin: false,
  behavioursEnabled: true
})

const emit = defineEmits(['save', 'refresh'])
const editorInit = (editor) => {
  editor.selection.on('changeCursor', () => {
    cursorPosition.value = editor.selection.getCursor()
  })
}

const handleContentChange = () => {
  hasChanges.value = localContent.value !== originalContent.value
  emit('save', {content: localContent.value })
}

watch(
  () => props.content,
  (newVal) => {
    if (localContent.value !== newVal) {
      localContent.value = newVal
      originalContent.value = newVal
      hasChanges.value = false
    }
  }
)
</script>

<style lang="less" scoped>

@media screen and (max-height: 620px){
  .editor-container {
    height: calc(100vh - 310px);
    display: flex;
    flex-direction: column;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1a202c;
    overflow-y: auto;
  }
}

@media screen and (min-height: 930px){
  .editor-container {
    height: calc(100vh - 550px);
    display: flex;
    flex-direction: column;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #1a202c;
    overflow-y: auto;
  }
}

.toolbar {
  background-color: #565656;
  flex-shrink: 0;

  .el-button-group {
    display: flex;

    .el-button {
      display: flex;
      align-items: center;
      gap: 5px;
      background-color: #565656;
      border: none;
      color: #e5eaef;
      transition: all 0.2s;
      height: 36px;
      padding: 0 15px;

      &.save-btn {
        background: center center #4a54ff;
        background-image: linear-gradient(315deg, #6772ff 0, #20c43d 100%);
        background-size: 104% 104%;
        color: #fff;

        &:hover {
          transform: scale(1.02);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }

      &.refresh-btn:hover {
        background-color: rgb(62, 74, 94);
      }
    }
  }

  .status-info {
    color: #cbd5e0;
    font-size: 14px;
    display: flex;
    align-items: center;
    position: absolute;
    right: 10px;
    top: 5px;

    span {
      padding: 2px 6px;
      border-radius: 3px;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}

.editor-area {
  flex: 1;
  background-color: #1a202c;
}

.editor-wrapper {
  height: 100%;
  background-color: #272822;
  border-radius: 4px;
  overflow: hidden;
}
</style>