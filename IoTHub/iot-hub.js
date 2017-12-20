/*
 * IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
 */
'use strict';

var EventHubClient = require('azure-event-hubs').Client;
var iothub = require('azure-iothub');
var iotHubRegistry;

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
  iotHubRegistry = iothub.Registry.fromConnectionString(connectionString);
}

IoTHubReaderClient.prototype.createDevice = function(deviceId, cb) {
  var printError = function(err) {
    console.error(err.message || err);
  };

  var device = {
    deviceId: 'deviceId' 
  }
  device.deviceId = deviceId;
  console.log('Device ID: ' + device.deviceId);
  var resp = {
    type: '',
    msg: '',
    deviceInfo: null
  };

  iotHubRegistry.create(device, function(err, deviceInfo, res) {
    if (err) {
      iotHubRegistry.get(device.deviceId, printDeviceInfo);
      resp.type = 'error';
      resp.msg = device.deviceId + ' already exists.';
    } else {
      resp.type = 'success';
      resp.msg = device.deviceId + ' has been registered.';
    }

    if (deviceInfo) {
      printDeviceInfo(err, deviceInfo, res);
      resp.deviceInfo = Object.assign(deviceInfo.deviceId, deviceInfo.authentication.symmetricKey.primaryKey);
      cb(resp);
    } else {
      cb(resp);
    }
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