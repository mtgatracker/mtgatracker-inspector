'use strict';

var _require = require('./api'),
    getDrafts = _require.getDrafts;

var _require2 = require('./conf'),
    pagePrefix = _require2.pagePrefix;

var draftsRoute = function draftsRoute(c, n) {
  appData.currentDraftName = "loading ...";
  console.log("CALLED FROM /drafts/");
  if (appData.bound) bound.unbind();
  appData.homeDraftList = [];
  $("#more-games-button").unbind("click");
  console.log("unbind change");
  $("#edit-decks").unbind("change");
  $(function () {
    $("#page-wrapper").load(pagePrefix + '/templates/drafts-inner.html?v=1.3.0', function (loaded) {
      rivets.bind($('#app'), { data: appData });
      appData.homeDraftsListPage = 1;

      getDrafts();
    });
  });
};

module.exports = { draftsRoute: draftsRoute };