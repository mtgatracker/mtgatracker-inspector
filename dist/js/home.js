'use strict';

var _require = require('./api'),
    getGames = _require.getGames,
    getDecks = _require.getDecks;

var cookies = require('browser-cookies');

var homeRoute = function homeRoute() {
  console.log("CALLED FROM /");
  if (!cookies.get("token")) {
    window.stop();
    window.location.href = "/login/";
  }

  if (appData.bound) bound.unbind();
  $(function () {
    $("#page-wrapper").load('/templates/home-inner.html', function (loaded) {
      $("#more-games-button").unbind("click");
      rivets.bind($('#app'), { data: appData });
      $("#more-games-button").click(function () {
        getGames(appData.homeGameListPage);
      });
      appData.homeGameListPage = 1;
      getDecks();
      getGames(1, { removeOld: true });
    });
  });
};

module.exports = {
  homeRoute: homeRoute
};