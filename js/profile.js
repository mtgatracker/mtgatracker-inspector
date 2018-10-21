const { getOverallWinLoss, getPlayerEventHistory, getDeckCount, getTimeStats } = require('./api')
const { pagePrefix } = require("./conf")
/* TODO: DRY @ admin.js*/

var niceColors = [
  "#AAAAAA",
  "#FF8500",
  "#B01124",
  "#99FF00",
  "#FFED00",
  "#3db0de",
  "#9A989F",  // 6
  "#d09dfd",
  "#AEE5D8",
  "#95867F",
  "#80A1C1",
  "#BFD7B5",
  "#34608F",  // 12
  "#D3DFB8",
  "#C6A15B",
  "#720E07",
  "#8B6220",
]

let donutOptions = {
  maintainAspectRatio: false,
  legend: {
      labels: {
          fontColor: "#474747"
      }
  },
  tooltips: {
      titleFontFamily: 'magic-font',
      callbacks: {
          // https://stackoverflow.com/questions/39500315/chart-js-different-x-axis-and-tooltip-format
          title: function(tooltipItem){
              return this._data.labels[tooltipItem[0].index];
          }
      }
  },
  tooltips: {
    callbacks: {
      label: function(tooltipItem, data) {
        //get the concerned dataset
        var dataset = data.datasets[tooltipItem.datasetIndex];
        //calculate the total of this data set
        var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
          return previousValue + currentValue;
        });
        //get the current items value
        var currentValue = dataset.data[tooltipItem.index];
        //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
        var precentage = Math.floor(((currentValue/total) * 100)+0.5);

        return precentage + "%" + " (" + currentValue + ")";
      }
    }
  }
}

let eventLineOptions = {
  maintainAspectRatio: false,
  legend: {
    labels: {
      fontColor: "#474747",
      fontSize: 14,
    }
  },
  scales: {
    yAxes: [{
      id: 'A',
      type: 'linear',
      position: 'left',
      ticks: {
        beginAtZero: true,
        max: 70,
        min: 0,
        fontColor: "#474747",
        fontSize: 18,
      },
      gridLines: {
         color: "#5d5d5d"
      },
    }],
    xAxes: [{
      gridLines: {
        color: "#333"
      },
      ticks: {
        fontColor: "#555",
        fontSize: 18,
      }
    }]
  }
}

let lineData = {
  datasets: [],
  labels: []
}

let profileRoute = (c, n) => {
  appData.currentDeckName = "loading ..."
  console.log("CALLED FROM /profile/")
  if (appData.bound)
    bound.unbind()
  $(function() {
    $("#page-wrapper").load(`${pagePrefix}/templates/profile-inner.html?v=1.3.0`, loaded => {
      rivets.bind($('#app'), {data: appData})

      var ctx = document.getElementById('overall-wl-plot').getContext('2d');
      appData.overallWinLossChart = new Chart(ctx, {
        type: 'doughnut',
            data: {   // "#c4d3ca", "#b3ceea", "#e47777", "#f8e7b9", "#a69f9d"
              labels: ["Wins", "Losses"],
              datasets: [
                {
                  backgroundColor: ["#3f903f", "#d9534f"],
                  data: [0,0],
                  borderColor: "#eee",
                  borderWidth: 3
                }
              ]
            },
            options: donutOptions
        })
      getOverallWinLoss().then(overallWinLoss => {
          appData.overallWinLossChart.data.datasets[0].data = appData.overallWinLoss
          appData.overallWinLossChart.update()
      })
      var eventCtx = document.getElementById('event-usage-plot').getContext('2d');
      appData.playerEventHistoryChart = new Chart(eventCtx, {
        type: 'line',
        data: lineData,
        options: eventLineOptions
      });
      getPlayerEventHistory().then(playerHistory => {
        let labelLength = 0;
        let maxHeight = 0;
        let idx = 0;
        for (let windowKey in playerHistory.eventTypeWindows) {
          playerHistory.eventTypeWindows[windowKey].windows.map(height => {
            maxHeight = Math.max(height, maxHeight)
          })
          labelLength = playerHistory.eventTypeWindows[windowKey].windows.length;
          idx++;
          let newDataSeries = {
            label: windowKey,
            data: playerHistory.eventTypeWindows[windowKey].windows,
            borderColor: niceColors[idx % niceColors.length],
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderWidth: 2,
            pointRadius: 1,
            lineTension: 0.2,
          }
          appData.playerEventHistoryChart.data.datasets.push(newDataSeries)
        }

        // fix max height
        maxHeight = Math.trunc(maxHeight / 10) * 10 + 10  // get to next multiple of 10
        appData.playerEventHistoryChart.options.scales.yAxes[0].ticks.max = maxHeight

        appData.playerEventHistoryChart.data.labels = [playerHistory.firstDate]
        for (let i = 1; i < labelLength - 1; i++) {
          appData.playerEventHistoryChart.data.labels.push('')
        }
        appData.playerEventHistoryChart.data.labels.push(playerHistory.lastDate)
        appData.playerEventHistoryChart.update()
      })
      getDeckCount()
      getTimeStats()
      /* // TODO: fix this
      $("#matchup-style").change((e) => {
        let text = (e.target.checked ? "Multiple colors" : "Single color");
        $("#matchup-style-label").html(text)
      })
      */
    })
  })
}

module.exports = {profileRoute:profileRoute}

/*

*/
