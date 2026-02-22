// ros2-web-bridge-monitoring/frontend/src/composables/useRosMonitor.js
import { ref, onUnmounted } from 'vue';
import ROSLIB from 'roslib';
import { ROS_CONFIG } from '../config/rosConfig';

export function useRosMonitor() {
  // --- STATE ---
  const isConnected = ref(false);
  const isStreamActive = ref(false);
  const rosInstance = ref(null);
  
  const sensorData = ref({
    temperature: ROS_CONFIG.DEFAULT_VALUES.temperature,
    humidity: ROS_CONFIG.DEFAULT_VALUES.humidity,
    ldr: ROS_CONFIG.DEFAULT_VALUES.ldr,
    ai_detection: ROS_CONFIG.DEFAULT_VALUES.ai_detection,
    maturity_level: ROS_CONFIG.DEFAULT_VALUES.maturity_level,
    confidence: ROS_CONFIG.DEFAULT_VALUES.confidence,
    timestamp: null
  });

  const videoStream = ref(null);
  const detectionImage = ref(null);
  const isVideoPlaying = ref(false);
  const events = ref([]);
  const connectionStatus = ref('Disconnected');

  // --- HELPERS ---
  const safeParse = (jsonString) => {
    try { 
      return JSON.parse(jsonString); 
    } catch (e) { 
      console.warn('Failed to parse JSON:', jsonString);
      return null; 
    }
  };

  const addEvent = (source, message, type = 'info') => {
    const eventTime = new Date().toLocaleTimeString();
    events.value.unshift({
      id: Date.now(),
      time: eventTime,
      source: source,
      msg: message,
      type: type
    });
    // Batasi log agar memori browser tidak penuh (Max 100)
    if (events.value.length > 100) events.value.pop();
  };

  // Fungsi untuk mengkonversi ROS CompressedImage ke URL data
  const compressedImageToDataURL = (compressedImage) => {
    try {
      // Format base64 untuk gambar JPEG/PNG
      const base64Data = btoa(
        String.fromCharCode.apply(null, new Uint8Array(compressedImage.data))
      );
      return `data:image/jpeg;base64,${base64Data}`;
    } catch (error) {
      console.error('Error converting image:', error);
      return null;
    }
  };

  // --- CORE CONNECTION ---
  const connect = () => {
    rosInstance.value = new ROSLIB.Ros({
      url: ROS_CONFIG.WEBSOCKET_URL
    });

    rosInstance.value.on('connection', () => {
      console.log('✅ Connected to ROS Bridge');
      isConnected.value = true;
      connectionStatus.value = 'Connected';
      addEvent('System', 'Connected to ROS Bridge', 'info');
      _setupSubscribers();
    });

    rosInstance.value.on('error', (error) => {
      console.error('❌ ROS Error:', error);
      isConnected.value = false;
      isStreamActive.value = false;
      connectionStatus.value = `Error: ${error.message}`;
      addEvent('System', `❌ Connection Error: ${error.message}`, 'error');
    });

    rosInstance.value.on('close', () => {
      console.log('⚠️ Connection Closed');
      isConnected.value = false;
      isStreamActive.value = false;
      connectionStatus.value = 'Disconnected';
      addEvent('System', '⚠️ Connection to ROS Bridge closed', 'warning');
    });

    // Try to connect
    addEvent('System', 'Attempting to connect to ROS Bridge...', 'info');
  };

  const _setupSubscribers = () => {
    // ---------------------------------------------------------
    // 1. SUBSCRIBER SUHU
    // ---------------------------------------------------------
    const suhuTopic = new ROSLIB.Topic({
      ros: rosInstance.value,
      name: ROS_CONFIG.TOPICS.SUHU.name,
      messageType: ROS_CONFIG.TOPICS.SUHU.type
    });

    suhuTopic.subscribe((msg) => {
      isStreamActive.value = true;
      const data = msg.data;
      
      // Handle both string and object data
      if (typeof data === 'string') {
        const parsed = safeParse(data);
        if (parsed && parsed.temp !== undefined) {
          sensorData.value.temperature = parseFloat(parsed.temp).toFixed(1);
          sensorData.value.timestamp = parsed.timestamp || new Date().toISOString();
          
          // Check temperature thresholds
          const tempValue = parseFloat(parsed.temp);
          if (tempValue > 30) {
            addEvent('Suhu', `⚠️ Suhu Tinggi: ${tempValue.toFixed(1)}°C`, 'warning');
          } else if (tempValue < 20) {
            addEvent('Suhu', `⚠️ Suhu Rendah: ${tempValue.toFixed(1)}°C`, 'warning');
          }
        } else if (!isNaN(data)) {
          sensorData.value.temperature = parseFloat(data).toFixed(1);
          sensorData.value.timestamp = new Date().toISOString();
        }
      } else if (typeof data === 'number') {
        sensorData.value.temperature = data.toFixed(1);
        sensorData.value.timestamp = new Date().toISOString();
      }
    });

    // ---------------------------------------------------------
    // 2. SUBSCRIBER KELEMBAPAN
    // ---------------------------------------------------------
    const kelembapanTopic = new ROSLIB.Topic({
      ros: rosInstance.value,
      name: ROS_CONFIG.TOPICS.KELEMBAPAN.name,
      messageType: ROS_CONFIG.TOPICS.KELEMBAPAN.type
    });

    kelembapanTopic.subscribe((msg) => {
      isStreamActive.value = true;
      const data = msg.data;
      
      if (typeof data === 'string') {
        const parsed = safeParse(data);
        if (parsed && parsed.humid !== undefined) {
          sensorData.value.humidity = parseFloat(parsed.humid).toFixed(1);
          sensorData.value.timestamp = parsed.timestamp || new Date().toISOString();
          
          // Check humidity thresholds
          const humidValue = parseFloat(parsed.humid);
          if (humidValue > 80) {
            addEvent('Kelembapan', `⚠️ Kelembapan Tinggi: ${humidValue.toFixed(1)}%`, 'warning');
          } else if (humidValue < 40) {
            addEvent('Kelembapan', `⚠️ Kelembapan Rendah: ${humidValue.toFixed(1)}%`, 'warning');
          }
        } else if (!isNaN(data)) {
          sensorData.value.humidity = parseFloat(data).toFixed(1);
          sensorData.value.timestamp = new Date().toISOString();
        }
      } else if (typeof data === 'number') {
        sensorData.value.humidity = data.toFixed(1);
        sensorData.value.timestamp = new Date().toISOString();
      }
    });

    // ---------------------------------------------------------
    // 3. SUBSCRIBER LDR (Intensitas Cahaya)
    // ---------------------------------------------------------
    const ldrTopic = new ROSLIB.Topic({
      ros: rosInstance.value,
      name: ROS_CONFIG.TOPICS.LDR.name,
      messageType: ROS_CONFIG.TOPICS.LDR.type
    });

    ldrTopic.subscribe((msg) => {
      isStreamActive.value = true;
      const data = msg.data;
      
      if (typeof data === 'string') {
        const parsed = safeParse(data);
        if (parsed && parsed.ldr !== undefined) {
          const ldrValue = parseFloat(parsed.ldr);
          sensorData.value.ldr = ldrValue;
          sensorData.value.timestamp = parsed.timestamp || new Date().toISOString();
          
          // Logic Event: Jika terlalu gelap (< 100)
          if (ldrValue < 100) {
            const lastLog = events.value[0];
            if (!lastLog || !lastLog.msg.includes('Gelap')) {
              addEvent('LDR', `⚠️ Ruangan Gelap (LDR: ${ldrValue} lux)`, 'warning');
            }
          } else if (ldrValue > 1500) {
            const lastLog = events.value[0];
            if (!lastLog || !lastLog.msg.includes('Terang')) {
              addEvent('LDR', `⚠️ Cahaya Sangat Terang (LDR: ${ldrValue} lux)`, 'warning');
            }
          }
        } else if (!isNaN(data)) {
          sensorData.value.ldr = parseFloat(data);
          sensorData.value.timestamp = new Date().toISOString();
        }
      } else if (typeof data === 'number') {
        sensorData.value.ldr = data;
        sensorData.value.timestamp = new Date().toISOString();
      }
    });

    // ---------------------------------------------------------
    // 4. SUBSCRIBER SISTEM CERDAS (AI DETECTION)
    // ---------------------------------------------------------
    const aiDetectionTopic = new ROSLIB.Topic({
      ros: rosInstance.value,
      name: ROS_CONFIG.TOPICS.AI_DETECTION.name,
      messageType: ROS_CONFIG.TOPICS.AI_DETECTION.type
    });

    aiDetectionTopic.subscribe((msg) => {
      const data = msg.data;
      
      if (typeof data === 'string') {
        const parsed = safeParse(data);
        
        if (parsed) {
          // Update AI detection data
          sensorData.value.ai_detection = parsed.detection || 'Tidak Terdeteksi';
          sensorData.value.maturity_level = parsed.maturity || 'Tidak Diketahui';
          sensorData.value.confidence = parsed.confidence || 0;
          
          // Format untuk display
          const confidencePercent = (parsed.confidence * 100).toFixed(1);
          
          // Log event untuk deteksi penting
          if (parsed.detection === 'Tomat' && parsed.confidence > 0.7) {
            let maturityText = '';
            switch(parsed.maturity) {
              case 'mentah':
                maturityText = '🥚 Mentah';
                break;
              case 'setengah_mateng':
                maturityText = '🟡 Setengah Matang';
                break;
              case 'mateng':
                maturityText = '🍅 Matang';
                break;
              case 'terlalu_mateng':
                maturityText = '🔴 Terlalu Matang';
                break;
              default:
                maturityText = parsed.maturity;
            }
            
            addEvent('AI', 
              `🍅 Deteksi: ${maturityText} (${confidencePercent}%)`, 
              parsed.maturity === 'mateng' ? 'info' : 'warning'
            );
          }
        }
      }
    });

    // ---------------------------------------------------------
    // 5. SUBSCRIBER VIDEO STREAM (Kamera Real-time)
    // ---------------------------------------------------------
    const videoStreamTopic = new ROSLIB.Topic({
      ros: rosInstance.value,
      name: ROS_CONFIG.TOPICS.VIDEO_STREAM.name,
      messageType: ROS_CONFIG.TOPICS.VIDEO_STREAM.type
    });

    videoStreamTopic.subscribe((msg) => {
      try {
        // Konversi ROS CompressedImage ke data URL
        const imageUrl = compressedImageToDataURL(msg);
        if (imageUrl) {
          videoStream.value = imageUrl;
          isVideoPlaying.value = true;
        }
      } catch (error) {
        console.error('Error processing video stream:', error);
      }
    });

    // ---------------------------------------------------------
    // 6. SUBSCRIBER DETECTION IMAGE (Gambar dengan bounding box)
    // ---------------------------------------------------------
    const detectionImageTopic = new ROSLIB.Topic({
      ros: rosInstance.value,
      name: ROS_CONFIG.TOPICS.DETECTION_IMAGE.name,
      messageType: ROS_CONFIG.TOPICS.DETECTION_IMAGE.type
    });

    detectionImageTopic.subscribe((msg) => {
      try {
        // Konversi ROS CompressedImage ke data URL
        const imageUrl = compressedImageToDataURL(msg);
        if (imageUrl) {
          detectionImage.value = imageUrl;
        }
      } catch (error) {
        console.error('Error processing detection image:', error);
      }
    });
  };

  // --- ACTIONS ---
  const disconnect = () => {
    if (rosInstance.value) {
      rosInstance.value.close();
      isConnected.value = false;
      connectionStatus.value = 'Disconnected';
      isVideoPlaying.value = false;
      addEvent('System', 'Manual disconnection', 'info');
    }
  };

  const reconnect = () => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  };

  const publishConfig = (payload) => {
    if (!isConnected.value) {
      addEvent('System', '❌ Cannot publish: Not connected to ROS', 'error');
      return;
    }
    
    try {
      const topic = new ROSLIB.Topic({
        ros: rosInstance.value,
        name: ROS_CONFIG.TOPICS.CONFIG.name,
        messageType: ROS_CONFIG.TOPICS.CONFIG.type
      });
      
      const message = new ROSLIB.Message({ 
        data: JSON.stringify(payload) 
      });
      
      topic.publish(message);
      addEvent('System', `📤 Published config: ${JSON.stringify(payload)}`, 'info');
    } catch (error) {
      console.error('Failed to publish config:', error);
      addEvent('System', `❌ Failed to publish config: ${error.message}`, 'error');
    }
  };

  // Fungsi untuk mengontrol video stream
  const startVideoStream = () => {
    if (!isConnected.value) {
      addEvent('System', '❌ Cannot start video: Not connected to ROS', 'error');
      return;
    }
    addEvent('System', '🎥 Starting video stream...', 'info');
    // Dalam implementasi nyata, ini akan publish command ke ROS
  };

  const stopVideoStream = () => {
    isVideoPlaying.value = false;
    videoStream.value = null;
    addEvent('System', '⏸️ Video stream stopped', 'info');
  };

  const captureImage = () => {
    if (!isConnected.value) {
      addEvent('System', '❌ Cannot capture image: Not connected to ROS', 'error');
      return;
    }
    addEvent('System', '📸 Capturing image for analysis...', 'info');
    // Dalam implementasi nyata, ini akan publish command ke ROS
  };

  // --- CLEANUP ---
  onUnmounted(() => {
    disconnect();
  });

  return { 
    isConnected, 
    isStreamActive, 
    connectionStatus,
    sensorData, 
    videoStream,
    detectionImage,
    isVideoPlaying,
    events, 
    connect, 
    disconnect,
    reconnect,
    publishConfig,
    startVideoStream,
    stopVideoStream,
    captureImage
  };
}