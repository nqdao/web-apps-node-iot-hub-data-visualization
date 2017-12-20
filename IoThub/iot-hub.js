<<<<<<< HEAD
/*
 * IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
 */
'use strict';

var EventHubClient = require('azure-event-hubs').Client;
var iothub = require('azure-iothub');

// Close connection to IoT Hub.
IoTHubReaderClient.prototype.stopReadMessage = function() {
  this.iotHubClient.close();
}

// Read device-to-cloud messages from IoT Hub.
IoTHubReaderClient.prototype.startReadMessage = function(cb) {
  var printError = function(err) {
    console.error(err.message || err);
  };

  var deviceId = process.env['Azure.IoT.IoTHub.DeviceId'];

  this.iotHubClient.open()
    .then(this.iotHubClient.getPartitionIds.bind(this.iotHubClient))
    .then(function(partitionIds) {
      return partitionIds.map(function(partitionId) {
        return this.iotHubClient.createReceiver(this.consumerGroupName, partitionId, {
          'startAfterTime': Date.now()
        })
        .then(function(receiver) {
          receiver.on('errorReceived', printError);
          receiver.on('message', (message) => {
            var from = message.annotations['iothub-connection-device-id'];
            if (deviceId && deviceId !== from) {
              return;
            }
            cb(message.body, Date.parse(message.enqueuedTimeUtc));
          });
        }.bind(this));
      }.bind(this));
    }.bind(this))
    .catch(printError);
}

function IoTHubReaderClient(connectionString, consumerGroupName) {
  this.iotHubClient = EventHubClient.fromConnectionString(connectionString);
  this.consumerGroupName = consumerGroupName;
  this.iotHubRegistry = iothub.Registry.fromConnectionString(connectionString);
}

IoTHubReaderClient.prototype.createDevice = function(deviceId, cb) {
  var printError = function(err) {
    console.error(err.message || err);
  };

  var device = {
    deviceId: deviceId 
  }
  var resp = {
    type: 'error',
    message: '',
    deviceInfo: null
  };
  cb(resp);
  
  this.iotHubRegistry.create(device, function(err, deviceInfo, res) {
    if (err) {
      this.iotHubRegistry.get(device.deviceId, printDeviceInfo);
      resp.type = 'error';
      console.log('Create Device Error: ' + err);
    } else {
      resp.type = 'success';
    }

    if (deviceInfo) {
      printDeviceInfo(err, deviceInfo, res);
      if (resp.type == 'error') {
        resp.message = 'Device already existed';
      }
      resp.info = deviceInfo;
    }
    cb(resp);
  });

}

function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    console.log('Device ID: ' + deviceInfo.deviceId);
    console.log('Device key: ' + deviceInfo.authentication.symmetricKey.primaryKey);
    return deviceInfo;
  }
}

module.exports = IoTHubReaderClient;
=======
/*
 * IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
 */
'use strict';

var EventHubClient = require('azure-event-hubs').Client;
var iothub = require('azure-iothub');

// Close connection to IoT Hub.
IoTHubReaderClient.prototype.stopReadMessage = function() {
  this.iotHubClient.close();
}

// Read device-to-cloud messages from IoT Hub.
IoTHubReaderClient.prototype.startReadMessage = function(cb) {
  var printError = function(err) {
    console.error(err.message || err);
  };

  var deviceId = process.env['Azure.IoT.IoTHub.DeviceId'];

  this.iotHubClient.open()
    .then(this.iotHubClient.getPartitionIds.bind(this.iotHubClient))
    .then(function(partitionIds) {
      return partitionIds.map(function(partitionId) {
        return this.iotHubClient.createReceiver(this.consumerGroupName, partitionId, {
          'startAfterTime': Date.now()
        })
        .then(function(receiver) {
          receiver.on('errorReceived', printError);
          receiver.on('message', (message) => {
            var from = message.annotations['iothub-connection-device-id'];
            if (deviceId && deviceId !== from) {
              return;
            }
            cb(message.body, Date.parse(message.enqueuedTimeUtc));
          });
        }.bind(this));
      }.bind(this));
    }.bind(this))
    .catch(printError);
}

function IoTHubReaderClient(connectionString, consumerGroupName) {
  this.iotHubClient = EventHubClient.fromConnectionString(connectionString);
  this.consumerGroupName = consumerGroupName;
  this.iotHubRegistry = iothub.Registry.fromConnectionString(connectionString);
}

IoTHubReaderClient.prototype.createDevice = function(deviceId, cb) {
  var printError = function(err) {
    console.error(err.message || err);
  };

  var device = {
    deviceId: deviceId 
  }
  var resp = {
    type: 'error',
    message: '',
    deviceInfo: null
  };
  cb(resp);
  
  this.iotHubRegistry.create(device, function(err, deviceInfo, res) {
    if (err) {
      this.iotHubRegistry.get(device.deviceId, printDeviceInfo);
      resp.type = 'error';
      console.log('Create Device Error: ' + err);
    } else {
      resp.type = 'success';
    }

    if (deviceInfo) {
      printDeviceInfo(err, deviceInfo, res);
      if (resp.type == 'error') {
        resp.message = 'Device already existed';
      }
      resp.info = deviceInfo;
    }
    cb(resp);
  });

}

function printDeviceInfo(err, deviceInfo, res) {
  if (deviceInfo) {
    console.log('Device ID: ' + deviceInfo.deviceId);
    console.log('Device key: ' + deviceInfo.authentication.symmetricKey.primaryKey);
    return deviceInfo;
  }
}

module.exports = IoTHubReaderClient;
>>>>>>> ee3f7b745c5a6894a6998de0353e8a6325a56fc6
