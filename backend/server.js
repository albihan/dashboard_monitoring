const express = require ('express');
const cors = require ('cors');
const { InfluxDB } = require('@influxdata/influxdb-client');

const app = express();
app.use(cors());
app.use(express.json());

const token = 'z0tMyeHzJ4diJc5QRHdPjgADiLBHyDekPk1EsDAcUbN3WMdkrKsDDALKZx_rs4zB42ubushYA9zwAVw32uaKXg==';
const org = 'Ravelware';
const bucket = 'energy_data';
const url = 'http://localhost:8086';

const influxDB = new InfluxDB({ url, token });
const queryApi = influxDB.getQueryApi(org);

//endpoint 1: realtime dashboard
app.get('/api/realtime', async (req, res) => {
    try {
        // query untuk mengambil data terakhir dari setiap panel
        const fluxQuery = `
            from(bucket: "${bucket}")
            |> range(start: -30d)
            |> filter(fn: (r) => r._measurement == "energy_monitoring")
            |> last()
        `;

        const result = {};

        //eksekusi query dan hasil nya
        for await (const{values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
            const o = tableMeta.toObject(values);

            if (!result[o.pmCode]) {
                result[o.pmCode] = { pmCode: o.pmCode };
            }

            result[o.pmCode][o._field] = o._value;
            result[o.pmCode].last_time = o._time
        }
        
        // status offline/online
        const currentTime = new Date();
        const formattedData = Object.values(result).map(panel =>{
            const lastDataTime = new Date(panel.last_time);
            const diffMinutes = (currentTime - lastDataTime) / (1000 * 60);

            panel.status = diffMinutes > 5 ? 'OFFLINE' : 'ONLINE';
            return panel;
        });
        res.json({
            status: "OK",
            messages: "Data realtime berhasil diterima",
            data: formattedData
        });
    } catch (error){
        console.error(error);
        res.status(500).json({ status: "ERROR", messages: error.messages });
    }
});

//endpoint 2: hari ini
app.get('/api/today', async (req, res)=>{
    try{
        //fromat waktu 00:00:00 hari ini untuk influxDB
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const startTimeString = todayStart.toISOString();

        // uji logika flux
        const fluxQuery = `
            from(bucket:"${bucket}")
            |> range(start: ${startTimeString})
            |> filter(fn:(r)=>r._measurement == "energy_monitoring" and r._field == "energy_kwh")
            |> spread()
        `;
        const result = [];
        const TARIF_PER_KWH = 1500;

        for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
            const o = tableMeta.toObject(values);

            //spread() akan otomatis mengembalikan kolom _value berisi selisih kwh
            const usage = parseFloat(o._value).toFixed(2);
            const cost = Math.round(usage * TARIF_PER_KWH);

            result.push({
                pmCode: o.pmCode,
                today_usage_kwh: parseFloat(usage),
                today_cost_idr: cost
            });
        }

        res.json({
            status: "OK",
            messages: "Data today's usage berhasil dihitung",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "ERROR", messages: error.messages });
    }
});
 
//endpoint 3: grafik bulanan
app.get('/api/summary', async (req, res) => {
    try {
        // Mengambil data 1 tahun ke belakang
        const fluxQuery = `
            from(bucket: "${bucket}")
            |> range(start: -1y)
            |> filter(fn: (r) => r._measurement == "energy_monitoring" and r._field == "energy_kwh")
            // Memotong data per 1 bulan (1mo) dan mencari total pemakaian (spread) tiap bulannya
            |> aggregateWindow(every: 1mo, fn: spread, createEmpty: false)
        `;

        const result = [];
        const TARIF_PER_KWH = 1500; 

        for await (const {values, tableMeta} of queryApi.iterateRows(fluxQuery)) {
            const o = tableMeta.toObject(values);
            
            // ubah format timestamp menjadi nama bulan
            const dateObj = new Date(o._time);
            const monthName = dateObj.toLocaleString('id-ID', { month: 'short' }); 
            
            const usage = parseFloat(o._value).toFixed(2);
            const cost = Math.round(usage * TARIF_PER_KWH);

            result.push({
                pmCode: o.pmCode,
                bulan: monthName,
                total_kwh: parseFloat(usage),
                total_cost_idr: cost
            });
        }

        res.json({
            status: "OK",
            message: "Data grafik bulanan berhasil ditarik",
            data: result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "ERROR", message: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server API berjalan di http://localhost:${PORT}`);
});
