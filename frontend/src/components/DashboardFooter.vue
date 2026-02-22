<!-- components/DashboardFooter.vue -->
<template>
  <footer class="dashboard-footer">
    <div class="footer-content">
      <div class="footer-info">
        <div class="system-stats">
          <div class="stat-item">
            <i class="fas fa-server"></i>
            <span>ROS2 Bridge: {{ websocketUrl }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-microchip"></i>
            <span>Topics: 4 Active</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-database"></i>
            <span>Events: {{ eventCount }}</span>
          </div>
        </div>
        <div class="timestamp">
          <i class="fas fa-sync-alt"></i>
          <span>Updated: {{ currentTime }}</span>
        </div>
      </div>
      
      <div class="footer-copyright">
        <p>ROS2 Monitoring Dashboard &copy; {{ currentYear }} | Built with Vue.js & ROSLIB.js</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  websocketUrl: {
    type: String,
    default: 'ws://localhost:9090'
  },
  eventCount: {
    type: Number,
    default: 0
  },
  currentTime: {
    type: String,
    default: '--:--:--'
  }
})

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.dashboard-footer {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 25px;
  margin-top: 20px;
  box-shadow: var(--card-shadow);
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.system-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item i {
  opacity: 0.7;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.footer-copyright {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid var(--border-color, #eee);
  color: var(--text-secondary);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .footer-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .system-stats {
    justify-content: center;
  }
}
</style>