const Aedes = require('aedes');
const aedes = Aedes();

const net = require('net');
const server = net.createServer(aedes.handle);
const port = 1883;

server.listen(port, function () {
  console.log(`[BROKER] MQTT Broker berjalan di port ${port}...`);
});

aedes.on('client', function (client) {
  console.log(`[BROKER] Client Terhubung: ${client ? client.id : client}`);
});
