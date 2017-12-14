/*
 * IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
 */
'use strict';

var EventHubClient = require('azure-event-hubs').Client;

// Close connection to Event Hub.
EventHubReaderClient.prototype.stopReadMessage = function() {
  this.eventHubClient.close();
}

// Read device-to-cloud messages from Event Hub.
EventHubReaderClient.prototype.startReadMessage = function(cb) {
  var printError = function(err) {
    console.error(err.message || err);
  };

  var deviceId = process.env['Azure.IoT.IoTHub.DeviceId'];

  this.eventHubClient.open()
    .then(this.eventHubClient.getPartitionIds.bind(this.eventHubClient))
    .then(function(partitionIds) {
      return partitionIds.map(function(partitionId) {
        return this.eventHubClient.createReceiver(this.consumerGroupName, partitionId, {
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

function EventHubReaderClient(connectionString, consumerGroupName) {
  this.eventHubClient = EventHubClient.fromConnectionString(connectionString);
  this.consumerGroupName = consumerGroupName;
}

module.exports = EventHubReaderClient;
