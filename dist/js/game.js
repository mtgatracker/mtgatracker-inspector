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
    $("#page-wrapper").load(pagePrefix + '/templates/game-inner.html?v=1.3.0', function (loaded) {
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

        var turn = 0;
        var players = game.onThePlay == game.hero ? [game.hero, game.opponent] : [game.opponent, game.hero];

        appData.currentGameActionLog = [];

        if (game.gameHistory && game.historyKey) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = game.gameHistory[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var event = _step.value;

              var eventTexts = [];
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = event[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var key = _step2.value;

                  var thisText = game.historyKey[key];
                  if (thisText == "turn++") {
                    var playerTurn = turn / 2 + 1;
                    thisText = { text: turn + 1 + ' / ' + players[turn++ % 2] + ' turn ' + Math.floor(playerTurn), type: "turn" };
                  }
                  eventTexts.push(thisText);
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }

              appData.currentGameActionLog.push(eventTexts);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        } else {
          appData.currentGameActionLog.push(["No history to show :("]);
        }

        appData.currentGameName = game.hero + ' vs ' + game.opponent;
        appData.currentGameID = game._id;
        appData.currentGameIsPermanent = game.permanent || false;
        appData.currentGameInColdStorage = game.inColdStorage || false;
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

        if (localStorage.getItem("dark-mode") == "true") enableDarkMode(true);
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