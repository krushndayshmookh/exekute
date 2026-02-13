<script setup>
defineProps({
  output: String,
  isRunning: Boolean,
  timedOut: Boolean,
})
</script>

<template>
  <div class="output-panel">
    <div class="panel-header">
      Output
      <span v-if="isRunning" class="status running">running...</span>
      <span v-if="timedOut" class="status timed-out">timed out</span>
    </div>
    <pre class="output-content">{{ output }}</pre>
  </div>
</template>

<style scoped>
.output-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  font-size: 12px;
  color: #888;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.status {
  font-size: 11px;
  text-transform: none;
  letter-spacing: 0;
}

.running {
  color: #dcdcaa;
}

.timed-out {
  color: #f44747;
}

.output-content {
  flex: 1;
  margin: 0;
  padding: 12px 16px;
  overflow: auto;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  color: #d4d4d4;
  background: #1e1e1e;
}
</style>
