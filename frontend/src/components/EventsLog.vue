<!-- components/EventsLog.vue -->
<template>
  <section id="events-section" class="events-section">
    <div class="section-header">
      <h3><i class="fas fa-history"></i> Event Log</h3>
      <div class="section-actions">
        <button 
          @click="$emit('clearEvents')"
          class="btn btn-sm btn-outline"
          :disabled="events.length === 0"
        >
          <i class="fas fa-trash"></i> Clear
        </button>
        <button 
          @click="$emit('toggleAutoScroll')"
          class="btn btn-sm btn-outline"
          :class="{ active: autoScroll }"
        >
          <i class="fas" :class="autoScroll ? 'fa-pause' : 'fa-play'"></i>
          {{ autoScroll ? 'Pause' : 'Auto' }}
        </button>
      </div>
    </div>
    
    <div class="events-container" ref="container">
      <div v-if="events.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No events yet</p>
      </div>
      <div v-else class="events-list">
        <div 
          v-for="event in events" 
          :key="event.id"
          class="event-item"
          :class="event.type"
        >
          <div class="event-time">{{ event.time }}</div>
          <div class="event-source">{{ event.source }}</div>
          <div class="event-message">{{ event.msg }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  autoScroll: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['clearEvents', 'toggleAutoScroll'])
const container = ref(null)

// Auto scroll when new events arrive
watch(() => props.events, () => {
  if (props.autoScroll && container.value) {
    nextTick(() => {
      container.value.scrollTop = 0
    })
  }
}, { deep: true })
</script>

<style scoped>
.events-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 25px;
  margin: 25px 0;
  box-shadow: var(--card-shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
}

.section-actions {
  display: flex;
  gap: 10px;
}

.events-container {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  background: var(--bg-secondary);
  padding: 15px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-item {
  display: grid;
  grid-template-columns: 80px 120px 1fr;
  gap: 15px;
  padding: 12px 15px;
  background: var(--card-bg);
  border-radius: 8px;
  font-size: 0.85rem;
  border-left: 4px solid;
}

.event-item.info {
  border-color: #1a73e8;
}

.event-item.warning {
  border-color: #ffb300;
}

.event-item.error {
  border-color: #e53935;
}

.event-time {
  color: var(--text-secondary);
  font-weight: 500;
}

.event-source {
  color: #1a73e8;
  font-weight: 500;
}

.event-message {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .event-item {
    grid-template-columns: 1fr;
    gap: 5px;
  }
  
  .event-time,
  .event-source {
    display: inline-block;
    margin-right: 10px;
  }
}
</style>