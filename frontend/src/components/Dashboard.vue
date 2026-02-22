<!-- ros2-web-bridge-monitoring/frontend/src/components/Dashboard.vue -->
<template>
  <div class="dashboard-container" :class="{ 'dark-mode': darkMode }">
    <!-- Connection Status -->
    <ConnectionStatus
      :is-connected="isConnected"
      :is-stream-active="isStreamActive"
      :connection-status="connectionStatus"
      @reconnect="reconnect"
      @toggle-dark-mode="toggleDarkMode"
    />

    <!-- Mobile Menu -->
    <MobileMenu 
      :is-open="mobileMenuOpen"
      @close="mobileMenuOpen = false"
      @navigate="scrollToSection"
    />

    <!-- Header -->
    <DashboardHeader 
      :last-update="lastUpdateTime"
      :current-time="currentTime"
      @toggle-menu="mobileMenuOpen = !mobileMenuOpen"
    />

    <!-- Sensor Cards Grid -->
    <div class="sensor-grid">
      <SensorCard
        v-for="sensor in sensors"
        :key="sensor.id"
        :sensor="sensor"
        :data="sensorData[sensor.key]"
        @show-chart="showChart(sensor.key)"
      />
    </div>

    

    <!-- Charts (Conditional) -->
    <ChartsContainer
      v-if="showCharts"
      :chart-type="currentChart"
      @close="closeCharts"
    />

    <!-- Events Log -->
    <EventsLog
      :events="events"
      :auto-scroll="autoScroll"
      @clear-events="clearEvents"
      @toggle-auto-scroll="autoScroll = !autoScroll"
    />

    <!-- Control Panel -->
    <ControlPanel
      :thresholds="thresholds"
      :update-interval="updateInterval"
      @update-config="updateConfig"
      @save-config="saveConfig"
      @reset-config="resetConfig"
    />

    <!-- Footer -->
    <DashboardFooter 
      :websocket-url="ROS_CONFIG.WEBSOCKET_URL"
      :event-count="events.length"
      :current-time="currentTime"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRosMonitor } from '../composables/useRosMonitor'
import { ROS_CONFIG } from '../config/rosConfig'
import ConnectionStatus from './ConnectionStatus.vue'
import MobileMenu from './MobileMenu.vue'
import DashboardHeader from './DashboardHeader.vue'
import SensorCard from './SensorCard.vue'

import ChartsContainer from './ChartsContainer.vue'
import EventsLog from './EventsLog.vue'
import ControlPanel from './ControlPanel.vue'
import DashboardFooter from './DashboardFooter.vue'

// ROS Connection dengan video support
const { 
  isConnected, 
  isStreamActive, 
  connectionStatus,
  sensorData, 
  
  detectionImage,
  
  events, 
  connect, 
  reconnect,
  
  captureImage: captureAIImage
} = useRosMonitor()

// UI State
const darkMode = ref(false)
const mobileMenuOpen = ref(false)
const showCharts = ref(false)
const currentChart = ref('')
const autoScroll = ref(true)

// Config State
const updateInterval = ref('1000')
const thresholds = ref({
  temperature: 30,
  humidity: 80,
  ldr_low: 100,
  ldr_high: 1500
})

// Sensor Definitions
const sensors = [
  {
    id: 'temperature',
    key: 'temperature',
    name: 'Suhu',
    description: 'Sensor Suhu',
    icon: 'thermometer-half',
    color: 'temperature',
    unit: '°C',
    normalRange: '22°C - 28°C',
    topic: ROS_CONFIG.TOPICS.SUHU.name,
    getStatus: (value) => {
      if (value === '--') return { class: 'unknown', text: 'No Data' }
      const num = parseFloat(value)
      if (num >= 22 && num <= 28) return { class: 'normal', text: 'Normal' }
      if (num > 28 && num <= 30) return { class: 'warning', text: 'Panas' }
      return { class: 'danger', text: 'Sangat Panas' }
    }
  },
  {
    id: 'humidity',
    key: 'humidity',
    name: 'Kelembapan',
    description: 'Sensor Kelembapan',
    icon: 'tint',
    color: 'humidity',
    unit: '%',
    normalRange: '50% - 70%',
    topic: ROS_CONFIG.TOPICS.KELEMBAPAN.name,
    getStatus: (value) => {
      if (value === '--') return { class: 'unknown', text: 'No Data' }
      const num = parseFloat(value)
      if (num >= 50 && num <= 70) return { class: 'normal', text: 'Normal' }
      if (num > 70 && num <= 75) return { class: 'warning', text: 'Lembap' }
      if (num >= 45 && num < 50) return { class: 'warning', text: 'Kering' }
      return { class: 'danger', text: num > 75 ? 'Sangat Lembap' : 'Sangat Kering' }
    }
  },
  {
    id: 'ldr',
    key: 'ldr',
    name: 'Intensitas Cahaya',
    description: 'Sensor LDR',
    icon: 'sun',
    color: 'light',
    unit: 'lux',
    normalRange: '300 - 1000 lux',
    topic: ROS_CONFIG.TOPICS.LDR.name,
    getStatus: (value) => {
      if (value === '--') return { class: 'unknown', text: 'No Data' }
      const num = parseFloat(value)
      if (num >= 300 && num <= 1000) return { class: 'normal', text: 'Optimal' }
      if (num > 1000 && num <= 1500) return { class: 'warning', text: 'Terang' }
      if (num > 1500) return { class: 'danger', text: 'Sangat Terang' }
      return { class: 'warning', text: 'Gelap' }
    }
  },
  {
    id: 'ai',
    key: 'maturity_level',
    name: 'Kematangan Tomat',
    description: 'Deteksi AI',
    icon: 'apple-alt',
    color: 'ai',
    unit: '',
    normalRange: 'Deteksi Real-time',
    topic: ROS_CONFIG.TOPICS.AI_DETECTION.name,
    getStatus: (value) => {
      if (value === 'Tidak Terdeteksi') return { class: 'unknown', text: 'Tidak Terdeteksi' }
      if (value === 'mentah') return { class: 'warning', text: 'Mentah' }
      if (value === 'setengah_mateng') return { class: 'warning', text: 'Setengah Matang' }
      if (value === 'mateng') return { class: 'normal', text: 'Matang' }
      if (value === 'terlalu_mateng') return { class: 'danger', text: 'Terlalu Matang' }
      return { class: 'unknown', text: value }
    }
  }
]

// Computed
const lastUpdateTime = computed(() => {
  return sensorData.value.timestamp 
    ? new Date(sensorData.value.timestamp).toLocaleTimeString()
    : '--:--:--'
})

const currentTime = ref('--:--:--')

// Methods
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  document.body.classList.toggle('dark-mode', darkMode.value)
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    mobileMenuOpen.value = false
  }
}

const showChart = (type) => {
  currentChart.value = type
  showCharts.value = true
}

const closeCharts = () => {
  showCharts.value = false
  currentChart.value = ''
}

const clearEvents = () => {
  if (confirm('Clear all events?')) {
    events.value = []
  }
}

const updateConfig = () => {
  const config = {
    update_interval: parseInt(updateInterval.value),
    thresholds: thresholds.value,
    timestamp: new Date().toISOString()
  }
  // publishConfig(config) - Uncomment when publishing is needed
}

const saveConfig = () => {
  updateConfig()
  alert('Configuration saved!')
}

const resetConfig = () => {
  updateInterval.value = '1000'
  thresholds.value = {
    temperature: 30,
    humidity: 80,
    ldr_low: 100,
    ldr_high: 1500
  }
}



const captureImage = () => {
  captureAIImage()
}

// Lifecycle
onMounted(() => {
  connect()
  
  // Update current time
  const updateTime = () => {
    currentTime.value = new Date().toLocaleTimeString()
  }
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)
  
  onUnmounted(() => {
    clearInterval(timeInterval)
  })
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: var(--bg-primary, #f5f7fa);
  color: var(--text-primary, #333);
  padding: 15px;
  transition: background-color 0.3s ease;
}

.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: 25px 0;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .sensor-grid {
    grid-template-columns: 1fr;
  }
}
</style>