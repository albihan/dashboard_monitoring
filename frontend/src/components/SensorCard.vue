<!-- components/SensorCard.vue -->
<template>
  <div 
    class="sensor-card" 
    :class="[sensor.color, { 'has-chart': showChart }]"
    :id="sensor.id"
  >
    <div class="card-header">
      <div class="card-icon">
        <i :class="`fas fa-${sensor.icon}`"></i>
      </div>
      <div class="card-info">
        <h3>{{ sensor.name }}</h3>
        <p>{{ sensor.description }}</p>
      </div>
      <button 
        v-if="sensor.color !== 'ai'"
        @click="$emit('showChart')"
        class="chart-btn"
        title="Show Chart"
      >
        <i class="fas fa-chart-line"></i>
      </button>
    </div>
    
    <div class="card-value">
      {{ displayValue }}
      <span v-if="sensor.unit" class="unit">{{ sensor.unit }}</span>
    </div>
    
    <div class="card-status" :class="status.class">
      {{ status.text }}
    </div>
    
    <div class="card-footer">
      <div class="range">{{ sensor.normalRange }}</div>
      <div class="topic">{{ sensor.topic }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sensor: {
    type: Object,
    required: true
  },
  data: {
    type: [String, Number],
    default: '--'
  }
})

const emit = defineEmits(['showChart'])

const displayValue = computed(() => {
  if (props.data === '--') return '--'
  if (props.sensor.key === 'ai_detection') return props.data
  if (typeof props.data === 'number') return props.data.toFixed(1)
  return props.data
})

const status = computed(() => {
  return props.sensor.getStatus(props.data)
})
</script>

<style scoped>
.sensor-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  transition: all 0.3s ease;
  border-top: 4px solid;
}

.sensor-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--card-shadow-hover);
}

.sensor-card.temperature { border-color: #e53935; }
.sensor-card.humidity { border-color: #1a73e8; }
.sensor-card.light { border-color: #ffb300; }
.sensor-card.ai { border-color: #7b1fa2; }

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 1.5rem;
}

.temperature .card-icon {
  background: rgba(229, 57, 53, 0.1);
  color: #e53935;
}

.humidity .card-icon {
  background: rgba(26, 115, 232, 0.1);
  color: #1a73e8;
}

.light .card-icon {
  background: rgba(255, 179, 0, 0.1);
  color: #ffb300;
}

.ai .card-icon {
  background: rgba(123, 31, 162, 0.1);
  color: #7b1fa2;
}

.card-info {
  flex: 1;
}

.card-info h3 {
  font-size: 1.3rem;
  margin-bottom: 5px;
  color: var(--text-primary);
}

.card-info p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.chart-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.chart-btn:hover {
  background: var(--bg-secondary);
  color: #1a73e8;
}

.card-value {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin: 15px 0;
  color: inherit;
}

.temperature .card-value { color: #e53935; }
.humidity .card-value { color: #1a73e8; }
.light .card-value { color: #ffb300; }
.ai .card-value { color: #7b1fa2; font-size: 1.8rem; }

.unit {
  font-size: 1.2rem;
  font-weight: 500;
  margin-left: 5px;
}

.card-status {
  display: inline-block;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 10px auto;
  text-align: center;
}

.card-status.normal {
  background: #e8f5e9;
  color: #2e7d32;
}

.card-status.warning {
  background: #fff3e0;
  color: #ef6c00;
}

.card-status.danger {
  background: #ffebee;
  color: #c62828;
}

.card-status.unknown {
  background: #f5f5f5;
  color: #757575;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color, #eee);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.range {
  font-weight: 500;
}

.topic {
  font-family: monospace;
  opacity: 0.8;
}
</style>