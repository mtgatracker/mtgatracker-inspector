"use strict";

var _require = require('./api'),
    getDraft = _require.getDraft,
    getDrafts = _require.getDrafts;

var _require2 = require("./conf"),
    pagePrefix = _require2.pagePrefix;

var draftRoute = function draftRoute(c, n) {
  appData.currentDeckName = "loading ...";
  console.log("CALLED FROM /draft/");
  if (appData.bound) bound.unbind();
  $("#more-games-button").unbind("click");
  $("#edit-decks").unbind("change");
  $(function () {
    $("#page-wrapper").load(pagePrefix + "/templates/draft-inner.html?v=1.3.0", function (loaded) {
      rivets.bind($('#app'), { data: appData });
      getDrafts();

      getDraft(c.params.draftID).then(function (draft) {
        appData.picks = [];
        appData.eventName = draft.draftID.split(":")[1];

        Object.values(draft.picks).forEach(function (event) {

          var pick = {};
          pick.pickNumber = event.pickNumber + 1;
          pick.packNumber = event.packNumber + 1;
          var card = cardUtils.allCards.findCard(event.pick);
          if (card) {
            var cardObj = {
              cardID: event.pick,
              colors: card.get("colors"),
              cost: card.get("cost"),
              name: card.get("prettyName"),
              set: card.get("set"),
              rarity: card.get("rarity"),
              setNumber: card.get("setNumber"),
              cardType: card.get("cardType").split(" ").slice(-1)[0] // "Legendary Creature" => "Creature"
            };
            pick.pick = cardObj;
          }
          var pack = [];
          Object.values(event.pack).forEach(function (passed) {
            var card = cardUtils.allCards.findCard(passed);
            if (card && passed != event.pick) {
              var _cardObj = {
                cardID: passed,
                colors: card.get("colors"),
                cost: card.get("cost"),
                name: card.get("prettyName"),
                set: card.get("set"),
                rarity: card.get("rarity"),
                setNumber: card.get("setNumber"),
                cardType: card.get("cardType").split(" ").slice(-1)[0] // "Legendary Creature" => "Creature"
              };
              pack.push(_cardObj);
            }
          });
          pick.pack = pack;
          appData.picks.push(pick);
        });
      });
    });
  });
};

module.exports = { draftRoute: draftRoute };