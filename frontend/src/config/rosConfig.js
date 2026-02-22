// ros2-web-bridge-monitoring/frontend/src/config/rosConfig.js
export const ROS_CONFIG = {
    WEBSOCKET_URL: `ws://${window.location.hostname}:9090`,
    TOPICS: {
        SUHU: { name: '/suhu', type: 'std_msgs/Float32' },
        KELEMBAPAN: { name: '/kelembapan', type: 'std_msgs/Float32' },
        LDR: { name: '/ldr', type: 'std_msgs/Int32' },
        // Topik AI untuk deteksi kematangan
        AI_DETECTION: { name: '/ai_detection', type: 'std_msgs/String' },
        // Topik untuk video stream (H.264 atau MJPEG)
        
        // Topik untuk gambar hasil deteksi
        DETECTION_IMAGE: { name: '/detection_image', type: 'sensor_msgs/CompressedImage' },
        CONFIG: { name: 'dashboard_config', type: 'std_msgs/String' }
    },
    // Default values for fallback
    DEFAULT_VALUES: {
        temperature: '--',
        humidity: '--',
        ldr: '--',
        ai_detection: 'Menunggu deteksi...',
        maturity_level: 'Tidak Terdeteksi',
        image_placeholder: '/assets/offline-camera.jpg',
        confidence: 0,
        timestamp: null
    }
};