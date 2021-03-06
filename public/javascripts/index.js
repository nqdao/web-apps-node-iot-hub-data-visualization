$(document).ready(function () {
  var timeData = [],
    temperatureData = [],
    humidityData = [];
  var data = {
    labels: timeData,
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: temperatureData
      },
      {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: humidityData
      }
    ]
  }

  var basicOption = {
    title: {
      display: true,
      text: 'Temperature & Humidity Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature(C)',
          display: true
        },
        position: 'left',
      }, {
          id: 'Humidity',
          type: 'linear',
          scaleLabel: {
            labelString: 'Humidity(%)',
            display: true
          },
          position: 'right'
        }]
    }
  }

  //Get the context of the canvas element we want to select
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });

  //Create Device input
  //var form = document.createElement('form');
  var idLabel = document.createElement('label');
  idLabel.for = 'deviceId';
  idLabel.innerHTML = 'New Device ID';
  //form.appendChild(idLabel);
  var idInput = document.createElement("input");
  idInput.id = 'deviceId'
  idInput.type = "text";
  idInput.value = "MyDeviceID";
  //form.appendChild(idInput);
  var idSubmit = document.createElement("button");

  idSubmit.onclick = function() {
    console.log('New Device ID: ' + idInput.value);
    console.log('sending message to server');
    ws.send(idInput.value);
  };

  idSubmit.innerHTML = 'Create Device';
  //form.appendChild(idSubmit);
  var idResponse = document.createElement('label');

  var deviceList = document.createElement('p');

  var body = document.getElementsByTagName('body')[0];
  body.appendChild(idLabel);
  body.appendChild(idInput);
  body.appendChild(idSubmit);
  body.appendChild(idResponse);
  body.appendChild(deviceList);


  var ws = new WebSocket('wss://' + location.host);
  ws.onopen = function () {
    console.log('Successfully connect WebSocket');
  }
  ws.onmessage = function (message) {
    console.log('receive message' + message.data);
    try {
      var obj = JSON.parse(message.data);
      if(!obj.time || !obj.Temperature) {
        console.log('received non-data message: ' + message.data)
        if (Array.isArray(message.data)) {
          var list = '';
          message.data.forEach(function (device) {
            list = list + device.deviceId + '<br>';
          })
          deviceList.innerHTML = list;
        } else {
          idResponse.innerHTML = message.data;
        }
        return;
      }
      timeData.push(obj.time);
      temperatureData.push(obj.Temperature);
      // only keep no more than 50 points in the line chart
      const maxLen = 50;
      var len = timeData.length;
      if (len > maxLen) {
        timeData.shift();
        temperatureData.shift();
      }

      if (obj.Humidity) {
        humidityData.push(obj.Humidity);
      }
      if (humidityData.length > maxLen) {
        humidityData.shift();
      }

      myLineChart.update();
    } catch (err) {
      console.error(err);
    }
  }
});
