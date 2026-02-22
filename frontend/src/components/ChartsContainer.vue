<!-- components/ChartsContainer.vue -->
<template>
  <section class="charts-section">
    <div class="section-header">
      <h3><i class="fas fa-chart-area"></i> Historical Data - {{ chartTitle }}</h3>
      <button @click="$emit('close')" class="btn btn-sm btn-outline">
        <i class="fas fa-times"></i> Close
      </button>
    </div>
    
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  chartType: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

const chartCanvas = ref(null)
const chartInstance = ref(null)

const chartTitle = {
  temperature: 'Suhu',
  humidity: 'Kelembapan',
  ldr: 'Intensitas Cahaya'
}[props.chartType] || 'Data'

const chartColors = {
  temperature: '#e53935',
  humidity: '#1a73e8',
  ldr: '#ffb300'
}

const chartConfig = {
  type: 'line',
  data: {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{
      label: chartTitle,
      data: [],
      borderColor: chartColors[props.chartType] || '#666',
      backgroundColor: `${chartColors[props.chartType] || '#666'}20`,
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        }
      },
      y: {
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        }
      }
    }
  }
}

// Generate mock data
const generateData = () => {
  return Array.from({ length: 24 }, () => {
    switch(props.chartType) {
      case 'temperature':
        return 22 + Math.random() * 8
      case 'humidity':
        return 50 + Math.random() * 25
      case 'ldr':
        return Math.random() * 2000
      default:
        return 0
    }
  })
}

const renderChart = () => {
  if (!chartCanvas.value) return
  
  // Destroy previous chart
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  
  // Update data
  chartConfig.data.datasets[0].data = generateData()
  
  // Create new chart
  chartInstance.value = new Chart(chartCanvas.value, chartConfig)
}

onMounted(() => {
  renderChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})

watch(() => props.chartType, () => {
  renderChart()
})
</script>

<style scoped>
.charts-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 25px;
  margin: 25px 0;
  box-shadow: var(--card-shadow);
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }
}
</style>