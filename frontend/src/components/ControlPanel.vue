<!-- components/ControlPanel.vue -->
<template>
  <section class="control-panel">
    <div class="section-header">
      <h3><i class="fas fa-sliders-h"></i> Control Panel</h3>
    </div>
    
    <div class="controls-grid">
      <!-- Update Interval -->
      <div class="control-group">
        <label>Update Interval</label>
        <select v-model="localInterval" @change="handleIntervalChange">
          <option value="1000">1 Second</option>
          <option value="2000">2 Seconds</option>
          <option value="5000">5 Seconds</option>
          <option value="10000">10 Seconds</option>
        </select>
      </div>
      
      <!-- Thresholds -->
      <div class="control-group">
        <label>Alert Thresholds</label>
        <div class="thresholds-grid">
          <div class="threshold-item">
            <span>Suhu Max (°C):</span>
            <input 
              type="number" 
              v-model.number="localThresholds.temperature"
              @change="handleThresholdChange"
              min="20" 
              max="40"
            >
          </div>
          <div class="threshold-item">
            <span>Kelembapan Max (%):</span>
            <input 
              type="number" 
              v-model.number="localThresholds.humidity"
              @change="handleThresholdChange"
              min="30" 
              max="90"
            >
          </div>
          <div class="threshold-item">
            <span>LDR Min (lux):</span>
            <input 
              type="number" 
              v-model.number="localThresholds.ldr_low"
              @change="handleThresholdChange"
              min="0" 
              max="1000"
            >
          </div>
          <div class="threshold-item">
            <span>LDR Max (lux):</span>
            <input 
              type="number" 
              v-model.number="localThresholds.ldr_high"
              @change="handleThresholdChange"
              min="500" 
              max="3000"
            >
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="control-actions">
        <button @click="saveConfig" class="btn btn-primary">
          <i class="fas fa-save"></i> Save Config
        </button>
        <button @click="resetConfig" class="btn btn-outline">
          <i class="fas fa-undo"></i> Reset
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  thresholds: {
    type: Object,
    default: () => ({})
  },
  updateInterval: {
    type: String,
    default: '1000'
  }
})

const emit = defineEmits(['updateConfig', 'saveConfig', 'resetConfig'])

const localInterval = ref(props.updateInterval)
const localThresholds = ref({ ...props.thresholds })

// Watch for prop changes
watch(() => props.updateInterval, (newVal) => {
  localInterval.value = newVal
})

watch(() => props.thresholds, (newVal) => {
  localThresholds.value = { ...newVal }
}, { deep: true })

const handleIntervalChange = () => {
  emit('updateConfig', {
    type: 'interval',
    value: localInterval.value
  })
}

const handleThresholdChange = () => {
  emit('updateConfig', {
    type: 'thresholds',
    value: { ...localThresholds.value }
  })
}

const saveConfig = () => {
  emit('saveConfig', {
    interval: localInterval.value,
    thresholds: { ...localThresholds.value }
  })
}

const resetConfig = () => {
  emit('resetConfig')
  localInterval.value = '1000'
  localThresholds.value = {
    temperature: 30,
    humidity: 80,
    ldr_low: 100,
    ldr_high: 1500
  }
}
</script>

<style scoped>
.control-panel {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 25px;
  margin: 25px 0;
  box-shadow: var(--card-shadow);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.control-group select,
.control-group input {
  padding: 10px 12px;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.control-group select:focus,
.control-group input:focus {
  outline: none;
  border-color: #1a73e8;
}

.thresholds-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.threshold-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.threshold-item span {
  min-width: 120px;
  font-size: 0.9rem;
}

.threshold-item input {
  width: 80px;
  text-align: center;
}

.control-actions {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #1a73e8;
  color: white;
}

.btn-primary:hover {
  background: #0d47a1;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-color, #ddd);
  color: var(--text-primary);
}

.btn-outline:hover {
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .control-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .threshold-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .threshold-item input {
    width: 100%;
  }
}
</style>