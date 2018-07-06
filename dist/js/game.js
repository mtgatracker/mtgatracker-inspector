'use strict';

// /game/_id/:_id
// 5af804c72088d900069b283a

var _require = require('./api'),
    getGame = _require.getGame,
    getDecks = _require.getDecks;

var _require2 = require('./conf'),
    pagePrefix = _require2.pagePrefix;

var allTypes = ['Creature', 'Sorcery', 'Instant', 'Enchantment', 'Planeswalker', 'Artifact', 'Land'];

var gameRoute = function gameRoute(c, n) {
  console.log("CALLED FROM /game/");
  appData.currentGameWinner = "loading ...";
  appData.currentGameName = "";
  appData.currentGameHero = "";
  appData.currentGameHeroDeck = [];
  appData.currentGameHeroDeckName = "loading ...";
  appData.currentGameOpponent = "";
  appData.currentGameOpponentDeck = [];
  appData.currentGameOpponentDeckName = "loading ...";
  if (appData.bound) bound.unbind();

  $("#edit-decks").unbind("change");

  $(function () {
    $("#page-wrapper").load(pagePrefix + '/templates/game-inner.html', function (loaded) {
      rivets.bind($('#app'), { data: appData });
      getDecks();
      appData.currentGameHasRankInfo = false;
      appData.currentGameHasInfo = false;
      getGame(c.params.gameID).then(function (game) {
        if (game.eventID) {
          // old records don't have this stuff, let it be
          appData.currentGameEvent = '' + game.eventID;
          appData.currentGameOnPlay = '' + game.onThePlay;
          appData.currentGameElapsedTime = '' + game.elapsedTime;
          appData.currentGameTurnCount = game.turnNumber;
          appData.currentGameOpponentRank = game.opponentStartingRank;
          appData.currentGameHasInfo = true;
        }

        if (game.rankChange) {
          appData.currentGameHeroRankBefore = game.rankChange.oldClass + ' ' + game.rankChange.oldTier + ' - ' + Math.round(100 * game.rankChange.oldProgress) / 100;
          appData.currentGameHeroRankAfter = game.rankChange.newClass + ' ' + game.rankChange.newTier + ' - ' + Math.round(100 * game.rankChange.newProgress) / 100;
          appData.currentGameHeroRankChange = Math.round(100 * (game.rankChange.newProgress - game.rankChange.oldProgress)) / 100;
          appData.currentGameHasRankInfo = true;
        }

        appData.currentGameName = game.hero + ' vs ' + game.opponent;
        appData.currentGameHero = game.hero;
        appData.currentGameWinner = game.winner;
        appData.currentGameOpponent = game.opponent;
        appData.currentGameHeroDeck = [];

        Object.keys(game.players[0].deck.cards).forEach(function (cardID) {
          var card = cardUtils.allCards.findCard(cardID);
          if (card) {
            var cardObj = {
              cardID: cardID,
              count: game.players[0].deck.cards[cardID],
              colors: card.get("colors"),
              cost: card.get("cost"),
              name: card.get("prettyName"),
              set: card.get("set"),
              setNumber: card.get("setNumber"),
              cardType: card.get("cardType").split(" ").slice(-1)[0] // "Legendary Creature" => "Creature"
            };
            appData.currentGameHeroDeck.push(cardObj);
          }
        });
        appData.currentGameHeroDeckName = game.hero + '\'s deck: ' + game.players[0].deck.poolName;
        appData.currentGameOpponentDeckName = game.players[1].deck.poolName;
        appData.currentGameOpponentDeck = [];
        Object.keys(game.players[1].deck.cards).forEach(function (cardID) {
          var card = cardUtils.allCards.findCard(cardID);
          if (card) {
            var cardObj = {
              cardID: cardID,
              count: game.players[1].deck.cards[cardID],
              colors: card.get("colors"),
              cost: card.get("cost"),
              name: card.get("prettyName"),
              set: card.get("set"),
              setNumber: card.get("setNumber"),
              cardType: card.get("cardType").split(" ").slice(-1)[0] // "Legendary Creature" => "Creature"
            };
            appData.currentGameOpponentDeck.push(cardObj);
          }
        });
      });

      $("#edit-decks").change(function (e) {
        console.log("edit decks");
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

module.exports = { gameRoute: gameRoute };