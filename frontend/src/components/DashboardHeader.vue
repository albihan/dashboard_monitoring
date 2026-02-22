<!-- components/DashboardHeader.vue -->
<template>
  <header class="dashboard-header">
    <div class="header-content">
      <div class="header-main">
        <h1>
          <i class="fas fa-chart-line"></i> Real Time Data Monitoring
        </h1>
        <p>Sensors and AI detection</p>
      </div>
      
      <button 
        @click="$emit('toggleMenu')"
        class="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        <i class="fas fa-bars"></i>
      </button>
    </div>
    
    <div class="header-info">
      <div class="info-item">
        <i class="fas fa-clock"></i>
        <span>Last update: {{ lastUpdate }}</span>
      </div>
      <div class="info-item">
        <i class="fas fa-clock"></i>
        <span>Current: {{ currentTime }}</span>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  lastUpdate: {
    type: String,
    default: '--:--:--'
  },
  currentTime: {
    type: String,
    default: '--:--:--'
  }
})

defineEmits(['toggleMenu'])
</script>

<style scoped>
.dashboard-header {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  color: white;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: var(--card-shadow);
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-main {
  flex: 1;
}

.header-main h1 {
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-main p {
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

.mobile-menu-btn {
  display: none;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-info {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
  font-size: 0.95rem;
  opacity: 0.9;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 20px;
  }
  
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header-info {
    flex-direction: column;
    gap: 15px;
  }
}
</style>