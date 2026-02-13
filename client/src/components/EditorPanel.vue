<script setup>
import { ref, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  language: String,
  monacoLanguage: String,
  modelValue: String,
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
const editor = shallowRef(null)

onMounted(() => {
  editor.value = monaco.editor.create(editorContainer.value, {
    value: props.modelValue || '',
    language: props.monacoLanguage || 'plaintext',
    theme: 'vs-dark',
    fontSize: 14,
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 12 },
    tabSize: 4,
    insertSpaces: true,
    wordWrap: 'off',
    renderLineHighlight: 'line',
    cursorBlinking: 'smooth',
  })

  editor.value.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.value.getValue())
  })
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.dispose()
  }
})

watch(() => props.monacoLanguage, (newLang) => {
  if (editor.value) {
    const model = editor.value.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLang)
    }
  }
})

watch(() => props.modelValue, (newVal) => {
  if (editor.value && newVal !== editor.value.getValue()) {
    editor.value.setValue(newVal)
  }
})
</script>

<template>
  <div class="editor-panel">
    <div class="panel-header">Editor</div>
    <div class="editor-container" ref="editorContainer"></div>
  </div>
</template>

<style scoped>
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #3c3c3c;
  min-width: 0;
}

.panel-header {
  padding: 6px 16px;
  font-size: 12px;
  color: #888;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.editor-container {
  flex: 1;
  overflow: hidden;
}
</style>
