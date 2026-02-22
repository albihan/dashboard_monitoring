<!-- components/MobileMenu.vue -->
<template>
  <div v-if="isOpen" class="mobile-menu-overlay" @click="$emit('close')">
    <div class="mobile-menu-content" @click.stop>
      <div class="menu-header">
        <h3>Navigation</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <nav class="menu-nav">
        <a 
          v-for="item in menuItems" 
          :key="item.id"
          href="#" 
          class="menu-item"
          @click.prevent="navigate(item.id)"
        >
          <i :class="`fas fa-${item.icon}`"></i>
          {{ item.label }}
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'navigate'])

const menuItems = [
  { id: 'suhu-card', icon: 'thermometer-half', label: 'Suhu' },
  { id: 'kelembapan-card', icon: 'tint', label: 'Kelembapan' },
  { id: 'cahaya-card', icon: 'sun', label: 'Cahaya' },
  { id: 'ai-card', icon: 'robot', label: 'AI Detection' },
  { id: 'events-section', icon: 'history', label: 'Events Log' }
]

const navigate = (sectionId) => {
  emit('navigate', sectionId)
  emit('close')
}
</script>

<style scoped>
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.mobile-menu-content {
  background: var(--card-bg);
  width: 280px;
  height: 100vh;
  padding: 20px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.menu-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
}

.close-btn:hover {
  background: var(--bg-secondary);
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background: var(--bg-secondary);
}

.menu-item i {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}
</style>