const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const iotHubClient = require('./IoTHub/iot-hub.js');
const eventHubClient = require('./EventHub/eventhub.js');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res/*, next*/) {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log('sending data ' + data);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

var iotHubReader = new iotHubClient(process.env['Azure.IoT.IoTHub.ConnectionString'], process.env['Azure.IoT.IoTHub.ConsumerGroup']);

//update device list for all client every minute
setInterval(function() {
  iotHubReader.getDevices(function (deviceList) {
    try {
      wss.broadcast(JSON.stringify(deviceList));
    } catch (err) {
      console.log(deviceList);
      console.error(err);
    }
  });
}, 1000);

iotHubReader.startReadMessage(function (obj, date) {
  try {
    console.log(date);
    date = date || Date.now()
    wss.broadcast(JSON.stringify(Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })));
  } catch (err) {
    console.log(obj);
    console.error(err);
  }
});

//server receives message from client
wss.on('connection', function connection(ws) {
  ws.on('message', function (message) {
    console.log('received message from client: ' + message);
    iotHubReader.createDevice(message, function(resp) {
      console.log('Create device response: ' + resp + ' ' + JSON.stringify(resp));
      ws.send(JSON.stringify(resp));
    });
  });
});

//Event Hub Reader
// var eventHubReader = new eventHubClient(process.env['Azure.IoT.EventHub.ConnectionString'], process.env['Azure.IoT.EventHub.ConsumerGroup']);
// eventHubReader.startReadMessage(function (obj, date) {
//   try {
//     console.log(date);
//     date = date || Date.now()
//     wss.broadcast(JSON.stringify(Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })));
//   } catch (err) {
//     console.log(obj);
//     console.error(err);
//   }
// });

var port = normalizePort(process.env.PORT || '3000');
server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
