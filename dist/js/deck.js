"use strict";

var _require = require('./api'),
    getGames = _require.getGames,
    getDecks = _require.getDecks,
    getDeckWinLossByColor = _require.getDeckWinLossByColor;

var deckRoute = function deckRoute(c, n) {
  appData.currentDeckName = "loading ...";
  console.log("CALLED FROM /deck/");
  if (appData.bound) bound.unbind();
  $("#more-games-button").unbind("click");
  $("#edit-decks").unbind("change");
  $(function () {
    $("#page-wrapper").load('/templates/deck-inner.html', function (loaded) {
      rivets.bind($('#app'), { data: appData });
      $("#more-games-button").click(function () {
        getGames(appData.homeGameListPage, { deckID: appData.deckID });
      });
      $("#matchup-style").change(function (e) {
        var text = e.target.checked ? "Multiple colors" : "Single color";
        $("#matchup-style-label").html(text);
      });

      $("#edit-decks").change(function (e) {
        if (e.target.checked) {
          $(".hide-deck").slideDown();
        } else {
          $(".hide-deck").slideUp();
          $(".deckhidden").slideUp();
        }
      });

      var ctx = document.getElementById('matchup-plot').getContext('2d');
      appData.winLossColorChart = new Chart(ctx, {
        type: 'bar',
        data: { // "#c4d3ca", "#b3ceea", "#e47777", "#f8e7b9", "#a69f9d"
          labels: ["Green", "Blue", "Red", "White", "Black"],
          datasets: [{
            label: "Winrate",
            backgroundColor: ["#c4d3ca", "#b3ceea", "#e47777", "#f8e7b9", "#a69f9d"],
            data: [0, 0, 0, 0, 0]
          }]
        },
        options: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Winrate vs. Decks Containing Color'
          },
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                min: 0.0,
                beingAtZero: true,
                max: 1.0
              }
            }]
          }
        }
      });
      appData.homeGameListPage = 1;
      appData.deckID = c.params.deckID;
      getGames(1, { deckID: c.params.deckID, removeOld: true, setCurrentDeckName: true });
      getDecks();
      getDeckWinLossByColor(c.params.deckID).then(function (values) {
        appData.winLossColorChart.data.datasets[0].data = appData.winLossColors;
        appData.winLossColorChart.update();
      });
    });
  });
};

module.exports = { deckRoute: deckRoute };