'use strict';

var _require = require('./api'),
    getGames = _require.getGames,
    getDecks = _require.getDecks;

var _require2 = require('./conf'),
    pagePrefix = _require2.pagePrefix;

var decksRoute = function decksRoute(c, n) {
  appData.currentDeckName = "loading ...";
  console.log("CALLED FROM /decks/");
  if (appData.bound) bound.unbind();
  appData.homeDeckList = [];
  $("#more-games-button").unbind("click");
  console.log("unbind change");
  $("#edit-decks").unbind("change");
  $(function () {
    $("#page-wrapper").load(pagePrefix + '/templates/decks-inner.html', function (loaded) {
      rivets.bind($('#app'), { data: appData });
      appData.homeGameListPage = 1;

      getDecks(true);

      $("#edit-decks").change(function (e) {
        if (e.target.checked) {
          $(".hide-deck").slideDown();
        } else {
          $(".hide-deck").slideUp();
        }
      });
    });
  });
};

module.exports = { decksRoute: decksRoute };