const mqtt = require ('mqtt');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');


const url = 'http://localhost:8086';
const token = 'z0tMyeHzJ4diJc5QRHdPjgADiLBHyDekPk1EsDAcUbN3WMdkrKsDDALKZx_rs4zB42ubushYA9zwAVw32uaKXg==';
const org = 'Ravelware';
const bucket = 'energy_data';

const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket, 'ns');

function getAverage(arr) {
    const validNumbers = arr.filter(n => n>0);
    if (validNumbers.length === 0) return 0;
    const sum = validNumbers.reduce((a, b) => a + b, 0);
    return + (sum / validNumbers.length).toFixed(2);
}

const mqttClient = mqtt.connect('mqtt://localhost:1883');

//koneksi mqtt
mqttClient.on('connect',() => {
    console.log('Subscriber terhubung ke Broker MQTT');
    mqttClient.subscribe('DATA/PM/+', (err) => {
        if (!err) console.log('mendengarkan topik DATA/PM/+');
    });
});

// menerima dan menyimpan data
mqttClient.on('message', (topic, message) => {
    try {
        const pmCode = topic.split ('/')[2];
        const payload = JSON.parse(message.toString());

        if (payload.status === 'OK'){
            const data = payload.data;

            //logika matematika untuk array
            const avgVoltage = getAverage(data.v);
            const avgCurrent = getAverage(data.i);

            //buat titik data (point) untuk disimpan
            const point = new Point('energy_monitoring')
                .tag('pmCode', pmCode)
                .floatField('voltage', avgVoltage)
                .floatField('arus', avgCurrent)
                .floatField('power_kw', parseFloat(data.kw))
                .floatField('energy_kwh', parseFloat(data.kwh));

            writeApi.writePoint(point);
            console.log(`[SAVED] Data ${pmCode} -> InfluxDB. (V: ${avgVoltage}, A: ${avgCurrent}, Energy: ${data.kwh} kwh)`);
        }
    } catch (error) {
        console.log('Gagal memproses pesan:', error);
    }
});

