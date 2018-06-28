'use strict';

var _require = require('./api'),
    getGames = _require.getGames,
    getDecks = _require.getDecks;

var cookies = require('browser-cookies');

var _require2 = require('./conf'),
    pagePrefix = _require2.pagePrefix,
    loginCheck = _require2.loginCheck;

console.log('got pagePrefix ' + pagePrefix + ' from spaRouter');

var homeRoute = function homeRoute() {
  console.log("CALLED FROM /");
  loginCheck();

  if (appData.bound) bound.unbind();
  console.log("unbind home");
  $("#edit-decks").unbind("change");

  $(function () {
    $("#page-wrapper").load(pagePrefix + '/templates/home-inner.html', function (loaded) {
      $("#more-games-button").unbind("click");
      rivets.bind($('#app'), { data: appData });
      $("#more-games-button").click(function () {
        getGames(appData.homeGameListPage);
      });
      appData.homeGameListPage = 1;
      getDecks();
      getGames(1, { removeOld: true });

      $("#edit-decks").change(function (e) {
        if (e.target.checked) {
          $(".hide-deck").slideDown();
        } else {
          $(".hide-deck").slideUp();
          $(".deckhidden").slideUp();
        }
      });
    });
  });
};

module.exports = {
  homeRoute: homeRoute
};