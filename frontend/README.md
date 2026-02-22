ROS2 Web Monitoring Dashboard
Dashboard real-time untuk monitoring parameter lingkungan berbasis ROS2 dengan Vue.js.

🚀 Fitur Utama
📊 Monitoring real-time Suhu, Kelembapan, dan Intensitas Cahaya
🤖 Integrasi dengan sistem AI untuk deteksi objek
📱 Responsif untuk desktop dan mobile
🌓 Dark mode
🔔 Event logging otomatis
📈 Grafik data historis

🏗️ Struktur Proyek
frontend/
├── src/
│   ├── components/          # Komponen Vue.js
│   │   ├── Dashboard.vue      # Main container
│   │   ├── ConnectionStatus.vue
│   │   ├── SensorCard.vue
│   │   ├── EventsLog.vue
│   │   ├── ControlPanel.vue
│   │   ├── DashboardHeader.vue
│   │   ├── DashboardFooter.vue
│   │   └── MobileMenu.vue
│   │
│   ├── composables/         # Composition API hooks
│   │   └── useRosMonitor.js  # ROS connection logic
│   │
│   ├── config/              # Konfigurasi
│        └── rosConfig.js      # ROS topic configuration
│   
│            
│__ tailwind.config.js
├── package.json            # Dependencies
└── vite.config.js         # Build configuration

📡 Topik ROS
Topik	Tipe	Keterangan
/suhu	std_msgs/String	Data suhu (°C)
/kelembapan	std_msgs/String	Data kelembapan (%)
/ldr	std_msgs/String	Intensitas cahaya (lux)
/plant_health_status	std_msgs/String	Output AI detection

⚡ Instalasi Cepat
1. Install Dependencies
cd frontend
npm install
2. Setup ROS2 Bridge
Pastikan ROS2 Humble terinstall, lalu:
# Install rosbridge_server
sudo apt-get install ros-humble-rosbridge-server
# Jalankan rosbridge
ros2 launch rosbridge_server rosbridge_websocket_launch.xml
3. Jalankan Mock Publisher
ros2 run your_package mock_sensor_publisher
4. Start Dashboard
npm run dev
Akses: http://localhost:5173

🛠️ Development
# Development server
npm run dev

# Build production
npm run build

# Preview build
📱 Tampilan
Dashboard memiliki 4 bagian utama:
Status Connection - Indikator koneksi ROS2
Sensor Cards - Kartu untuk setiap parameter
Control Panel - Pengaturan threshold
Events Log - Log semua aktivitas

⚙️ Konfigurasi
Edit src/config/rosConfig.js untuk mengubah:
URL websocket ROS bridge
Nama topik ROS
Tipe pesan
javascript
WEBSOCKET_URL: `ws://${window.location.hostname}:9090`

🔧 Troubleshooting
Koneksi gagal: Pastikan rosbridge_server berjalan di port 9090
Data tidak muncul: Cek publisher ROS2 berjalan
Layout rusak: Clear cache browser

👥 Tim Pengembang
Tim Monitoring Sistem - Univeristas Trisakti
Mentor: Pak Agung
Anggota:
🔌 IoT Engineer
🙋‍♂️ Data Engineer
🤖 AI Engineer
🌐 Web Developer