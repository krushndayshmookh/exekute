<script setup>
defineProps({
  languages: Array,
  selectedLanguage: String,
  isRunning: Boolean,
  timeout: Number,
})

const emit = defineEmits(['language-change', 'timeout-change', 'run', 'stop'])

const timeoutOptions = [5, 10, 15, 30, 60]
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <span class="brand">exekute</span>
      <select
        :value="selectedLanguage"
        @change="emit('language-change', $event.target.value)"
        class="select"
      >
        <option
          v-for="lang in languages"
          :key="lang.id"
          :value="lang.id"
        >
          {{ lang.name }}
        </option>
      </select>
      <select
        :value="timeout"
        @change="emit('timeout-change', Number($event.target.value))"
        class="select select-small"
      >
        <option v-for="t in timeoutOptions" :key="t" :value="t">
          {{ t }}s
        </option>
      </select>
    </div>
    <div class="toolbar-right">
      <button
        v-if="!isRunning"
        class="btn btn-run"
        @click="emit('run')"
      >
        <img src="https://img.icons8.com/ios-glyphs/16/ffffff/play--v1.png" alt="run" />
        Run
      </button>
      <button
        v-else
        class="btn btn-stop"
        @click="emit('stop')"
      >
        <img src="https://img.icons8.com/ios-glyphs/16/ffffff/stop.png" alt="stop" />
        Stop
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.brand {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #cccccc;
  margin-right: 8px;
}

.select {
  background: #3c3c3c;
  color: #d4d4d4;
  border: 1px solid #555;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.select:hover {
  border-color: #777;
}

.select-small {
  width: 64px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border: none;
  border-radius: 3px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: #fff;
}

.btn img {
  width: 14px;
  height: 14px;
}

.btn-run {
  background: #0e7a0d;
}

.btn-run:hover {
  background: #0c9a0b;
}

.btn-stop {
  background: #c72a2a;
}

.btn-stop:hover {
  background: #e03030;
}
</style>
