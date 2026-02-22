const mqtt = require ('mqtt');
const client = mqtt.connect('mqtt://localhost:1883') //koneksi ke broker

const panels = [
    { topic: 'DATA/PM/PANEL_LANTAI_1', v: 220, i: 1.2, kw: 0.26, kwh: 100 },
    { topic: 'DATA/PM/PANEL_LANTAI_2', v: 220, i: 1.5, kw: 0.33, kwh: 150 },
    { topic: 'DATA/PM/PANEL_LANTAI_3', v: 220, i: 1.0, kw: 0.22, kwh: 80 }
];

client.on('connect', ()=> {
    console.log('Connected to MQTT Broker. Starting simulator');

    // interval 1 menit (60000ms)
    setInterval(() => {
        // logika randomisasi data
        panels.forEach(panel => {
            panel.v = +(218 + Math.random() * 7).toFixed(1);
            panel.i = +(1 + Math.random() *4).toFixed(2);
            panel.kw = +((panel.v * panel.i) / 1000).toFixed(3);
            panel.kwh = +(panel.kwh + (panel.kw / 60)).toFixed(4);
            
            const payload= {
                status: "OK",
                data: {
                    v: [panel.v, panel.v, 0, panel.v],
                    i: [0, panel.i, 0.02, panel.i],
                    kw: panel.kw.toString(),
                    kVA: "0.18",
                    kwh: panel.kwh.toString(), // <-- perhatikan ini
                    pf: 0,
                    vunbal: 0.009,
                    iunbal: 0.099,
                    time: new Date().toISOString().replace('T', ' ').substring(0, 19) // format yyyy-mm-dd hh:mm:ss
                }
            };

            client.publish(panel.topic, JSON.stringify(payload));
            console.log(`[PUBLISHED] ${panel.topic} - kWh: ${panel.kwh}`);
        });
    }, 6000);
});