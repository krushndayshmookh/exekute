<script setup>
import { ref, onMounted } from 'vue'
import EditorPanel from './components/EditorPanel.vue'
import OutputPanel from './components/OutputPanel.vue'
import Toolbar from './components/Toolbar.vue'

const API_BASE = import.meta.env.VITE_API_BASE || ''

const languages = ref([])
const selectedLanguage = ref('javascript')
const code = ref('')
const output = ref('')
const isRunning = ref(false)
const timedOut = ref(false)
const timeout = ref(10)

const defaultCode = {
  javascript: '// JavaScript\nconsole.log("Hello, world!");',
  python: '# Python\nprint("Hello, world!")',
  java: [
    '// Java',
    'public class Main {',
    '    public static void main(String[] args) {',
    '        System.out.println("Hello, world!");',
    '    }',
    '}',
  ].join('\n'),
  c: [
    '// C',
    '#include <stdio.h>',
    '',
    'int main() {',
    '    printf("Hello, world!\\n");',
    '    return 0;',
    '}',
  ].join('\n'),
  cpp: [
    '// C++',
    '#include <iostream>',
    '',
    'int main() {',
    '    std::cout << "Hello, world!" << std::endl;',
    '    return 0;',
    '}',
  ].join('\n'),
}

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/languages`)
    languages.value = await res.json()
  } catch (e) {
    languages.value = [
      { id: 'javascript', name: 'JavaScript', monacoId: 'javascript' },
      { id: 'python', name: 'Python', monacoId: 'python' },
      { id: 'java', name: 'Java', monacoId: 'java' },
      { id: 'c', name: 'C', monacoId: 'c' },
      { id: 'cpp', name: 'C++', monacoId: 'cpp' },
    ]
  }
  code.value = defaultCode[selectedLanguage.value] || ''
})

function onLanguageChange(langId) {
  selectedLanguage.value = langId
  code.value = defaultCode[langId] || ''
}

async function run() {
  if (isRunning.value) return

  isRunning.value = true
  output.value = ''
  timedOut.value = false

  try {
    const res = await fetch(`${API_BASE}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: selectedLanguage.value,
        code: code.value,
        timeout: timeout.value,
      }),
    })
    const data = await res.json()

    if (data.error) {
      output.value = `Error: ${data.error}\n${data.details || ''}`
    } else {
      output.value = data.output || '[no output]'
      timedOut.value = data.timedOut || false
    }
  } catch (e) {
    output.value = `Network error: ${e.message}`
  } finally {
    isRunning.value = false
  }
}

function stop() {
  // The server-side timeout handles stopping.
  // This is a UI-only indicator.
  isRunning.value = false
  output.value += '\n[stopped by user]'
}
</script>

<template>
  <div class="app">
    <Toolbar
      :languages="languages"
      :selectedLanguage="selectedLanguage"
      :isRunning="isRunning"
      :timeout="timeout"
      @language-change="onLanguageChange"
      @timeout-change="timeout = $event"
      @run="run"
      @stop="stop"
    />
    <div class="panels">
      <EditorPanel
        :language="selectedLanguage"
        :monacoLanguage="languages.find(l => l.id === selectedLanguage)?.monacoId || 'plaintext'"
        v-model="code"
      />
      <OutputPanel
        :output="output"
        :isRunning="isRunning"
        :timedOut="timedOut"
      />
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #1e1e1e;
  color: #d4d4d4;
}

#app {
  height: 100%;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.panels {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
