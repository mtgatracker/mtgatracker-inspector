"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('./api'),
    getOverallWinLoss = _require.getOverallWinLoss,
    getPlayerEventHistory = _require.getPlayerEventHistory,
    getDeckCount = _require.getDeckCount,
    getTimeStats = _require.getTimeStats;

var _require2 = require("./conf"),
    pagePrefix = _require2.pagePrefix;
/* TODO: DRY @ admin.js*/

var niceColors = ["#AAAAAA", "#FF8500", "#B01124", "#99FF00", "#FFED00", "#3db0de", "#9A989F", // 6
"#d09dfd", "#AEE5D8", "#95867F", "#80A1C1", "#BFD7B5", "#34608F", // 12
"#D3DFB8", "#C6A15B", "#720E07", "#8B6220"];

var donutOptions = _defineProperty({
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
      title: function title(tooltipItem) {
        return this._data.labels[tooltipItem[0].index];
      }
    }
  }
}, "tooltips", {
  callbacks: {
    label: function label(tooltipItem, data) {
      //get the concerned dataset
      var dataset = data.datasets[tooltipItem.datasetIndex];
      //calculate the total of this data set
      var total = dataset.data.reduce(function (previousValue, currentValue, currentIndex, array) {
        return previousValue + currentValue;
      });
      //get the current items value
      var currentValue = dataset.data[tooltipItem.index];
      //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
      var precentage = Math.floor(currentValue / total * 100 + 0.5);

      return precentage + "%" + " (" + currentValue + ")";
    }
  }
});

var eventLineOptions = {
  maintainAspectRatio: false,
  legend: {
    labels: {
      fontColor: "#474747",
      fontSize: 14
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
        fontSize: 18
      },
      gridLines: {
        color: "#5d5d5d"
      }
    }],
    xAxes: [{
      gridLines: {
        color: "#333"
      },
      ticks: {
        fontColor: "#555",
        fontSize: 18
      }
    }]
  }
};

var lineData = {
  datasets: [],
  labels: []
};

var profileRoute = function profileRoute(c, n) {
  appData.currentDeckName = "loading ...";
  console.log("CALLED FROM /profile/");
  if (appData.bound) bound.unbind();
  $(function () {
    $("#page-wrapper").load(pagePrefix + "/templates/profile-inner.html?v=1.3.0", function (loaded) {
      rivets.bind($('#app'), { data: appData });

      var ctx = document.getElementById('overall-wl-plot').getContext('2d');
      appData.overallWinLossChart = new Chart(ctx, {
        type: 'doughnut',
        data: { // "#c4d3ca", "#b3ceea", "#e47777", "#f8e7b9", "#a69f9d"
          labels: ["Wins", "Losses"],
          datasets: [{
            backgroundColor: ["#3f903f", "#d9534f"],
            data: [0, 0],
            borderColor: "#eee",
            borderWidth: 3
          }]
        },
        options: donutOptions
      });
      getOverallWinLoss().then(function (overallWinLoss) {
        appData.overallWinLossChart.data.datasets[0].data = appData.overallWinLoss;
        appData.overallWinLossChart.update();
      });
      var eventCtx = document.getElementById('event-usage-plot').getContext('2d');
      appData.playerEventHistoryChart = new Chart(eventCtx, {
        type: 'line',
        data: lineData,
        options: eventLineOptions
      });
      getPlayerEventHistory().then(function (playerHistory) {
        var labelLength = 0;
        var maxHeight = 0;
        var idx = 0;
        for (var windowKey in playerHistory.eventTypeWindows) {
          playerHistory.eventTypeWindows[windowKey].windows.map(function (height) {
            maxHeight = Math.max(height, maxHeight);
          });
          labelLength = playerHistory.eventTypeWindows[windowKey].windows.length;
          idx++;
          var newDataSeries = {
            label: windowKey,
            data: playerHistory.eventTypeWindows[windowKey].windows,
            borderColor: niceColors[idx % niceColors.length],
            backgroundColor: "rgba(0, 0, 0, 0)",
            borderWidth: 2,
            pointRadius: 1,
            lineTension: 0.2
          };
          appData.playerEventHistoryChart.data.datasets.push(newDataSeries);
        }

        // fix max height
        maxHeight = Math.trunc(maxHeight / 10) * 10 + 10; // get to next multiple of 10
        appData.playerEventHistoryChart.options.scales.yAxes[0].ticks.max = maxHeight;

        appData.playerEventHistoryChart.data.labels = [playerHistory.firstDate];
        for (var i = 1; i < labelLength - 1; i++) {
          appData.playerEventHistoryChart.data.labels.push('');
        }
        appData.playerEventHistoryChart.data.labels.push(playerHistory.lastDate);
        appData.playerEventHistoryChart.update();
      });
      getDeckCount();
      getTimeStats();
      /* // TODO: fix this
      $("#matchup-style").change((e) => {
        let text = (e.target.checked ? "Multiple colors" : "Single color");
        $("#matchup-style-label").html(text)
      })
      */
    });
  });
};

module.exports = { profileRoute: profileRoute

  /*
  
  */

};