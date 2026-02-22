<!-- components/ConnectionStatus.vue -->
<template>
  <div class="connection-bar" :class="statusClass">
    <div class="connection-info">
      <span class="status-dot" :class="{ connected: isConnected }"></span>
      {{ connectionStatus }}
      <span v-if="isStreamActive" class="stream-indicator">• Stream Active</span>
    </div>
    
    <div class="connection-actions">
      <button 
        @click="$emit('reconnect')" 
        class="btn btn-sm btn-outline"
        :disabled="isConnected"
      >
        <i class="fas fa-sync-alt"></i> Reconnect
      </button>
      <button 
        @click="$emit('toggleDarkMode')" 
        class="btn btn-sm btn-outline"
      >
        <i class="fas" :class="darkModeIcon"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isConnected: Boolean,
  isStreamActive: Boolean,
  connectionStatus: String
})

const emit = defineEmits(['reconnect', 'toggleDarkMode'])

const statusClass = computed(() => {
  if (!props.isConnected) return 'disconnected'
  if (props.isStreamActive) return 'streaming'
  return 'connected'
})

const darkModeIcon = computed(() => {
  return document.body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon'
})
</script>

<style scoped>
.connection-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 20px;
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  font-size: 14px;
  font-weight: 500;
}

.connection-bar.connected {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  color: #2e7d32;
}

.connection-bar.streaming {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1a73e8;
  animation: pulse 2s infinite;
}

.connection-bar.disconnected {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  color: #e53935;
}

.connection-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.status-dot.connected {
  background: #4caf50;
  animation: blink 1s infinite;
}

.stream-indicator {
  font-size: 12px;
  opacity: 0.8;
}

.connection-actions {
  display: flex;
  gap: 10px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .connection-bar {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .connection-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>