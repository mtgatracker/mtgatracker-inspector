'use strict';

var API_URL = "https://gx3.mtgatracker.com/str-85b6a06b2d213fac515a8ba7b582387a-p3/mtgatracker-prod-EhDvLyq7PNb";

var cookies = require('browser-cookies');

var _require = require('./conf'),
    loginCheck = _require.loginCheck;

var getGame = function getGame(gameID) {
  return new Promise(function (resolve, reject) {
    $(".game-loading").css("display", "block");
    $(".export-button").prop('disabled', true);
    var token = loginCheck();
    $.ajax({
      url: API_URL + '/api/game/_id/' + gameID,
      headers: { token: token },
      success: function success(data) {
        $(".game-loading").css("display", "none");
        $(".export-button").prop('disabled', false);
        resolve(data);
      },
      error: function error(err) {
        if (err.status == 401) {
          cookies.erase("token");
          document.location.href = "/login";
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $(".game-loading").css("display", "none");
        reject(err);
      }
    });
  });
};

var getDraft = function getDraft(draftID) {
  return new Promise(function (resolve, reject) {
    $(".draft-loading").css("display", "block");
    var token = loginCheck();
    $.ajax({
      url: API_URL + '/api/draft/_id/' + draftID,
      headers: { token: token },
      success: function success(data) {
        $(".draft-loading").css("display", "none");
        resolve(data);
      },
      error: function error(err) {
        if (err.status == 401) {
          cookies.erase("token");
          document.location.href = "/login";
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $(".game-loading").css("display", "none");
        reject(err);
      }
    });
  });
};

var getDeckWinLossByColor = function getDeckWinLossByColor(deckID) {
  return new Promise(function (resolve, reject) {
    if (appData.winLossColorChart) {
      appData.winLossColorChart.data.datasets[0].data = [0, 0, 0, 0, 0];
      appData.winLossColorChart.update();
    }
    $("#matchup-loading").css("display", "block");
    var token = loginCheck();
    $.ajax({
      url: API_URL + '/api/deck/' + deckID + '/winloss-colors',
      headers: { token: token },
      success: function success(data) {
        console.log(data);
        $("#matchup-loading").css("display", "none");
        appData.winLossColors = [data.Green.wins / data.Green.total, data.Blue.wins / data.Blue.total, data.Red.wins / data.Red.total, data.White.wins / data.White.total, data.Black.wins / data.Black.total];
        resolve(appData.winLossColors);
      },
      error: function error(err) {
        if (err.status == 401) {
          cookies.erase("token");
          document.location.href = "/login";
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $("#matchup-loading").css("display", "none");
        reject(err);
      }
    });
  });
};

var getPlayerEventHistory = function getPlayerEventHistory() {
  return new Promise(function (resolve, reject) {
    if (appData.playerEventHistoryChart) {
      appData.playerEventHistoryChart.data.datasets = [];
      appData.playerEventHistoryChart.data.labels = [];
      appData.playerEventHistoryChart.update();
    }
    $("#event-usage-loading").css("display", "block");
    var token = loginCheck();
    $.ajax({
      url: API_URL + '/api/event-history',
      headers: { token: token },
      success: function success(data) {
        $("#event-usage-loading").css("display", "none");
        appData.playerEventHistoryData = data;
        resolve(appData.playerEventHistoryData);
      },
      error: function error(err) {
        if (err.status == 401) {
          cookies.erase("token");
          document.location.href = "/login";
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $("#event-usage-loading").css("display", "none");
        reject(err);
      }
    });
  });
};

var getDeckCount = function getDeckCount() {
  var token = loginCheck();
  var url = API_URL + '/api/decks/count';

  $.ajax({
    url: url,
    headers: { token: token },
    success: function success(data) {
      appData.totalDecks = data.numDecks;
    },
    error: function error(err) {
      if (err.status == 401) {
        cookies.erase("token");
        document.location.href = "/login";
      }
    }
  });
};

var getTimeStats = function getTimeStats() {
  var token = loginCheck();
  var url = API_URL + '/api/time-stats';

  $.ajax({
    url: url,
    headers: { token: token },
    success: function success(data) {
      $("#player-stats-loading").css("display", "none");
      appData.totalTimeSeconds = data.timeStats.totalTimeSeconds;
      appData.longestGameLengthSeconds = data.timeStats.maxTimeSeconds;
      appData.averageGameLengthSeconds = data.timeStats.avgTimeSeconds;
    },
    error: function error(err) {
      if (err.status == 401) {
        cookies.erase("token");
        document.location.href = "/login";
      }
    }
  });
};

var getOverallWinLoss = function getOverallWinLoss() {
  return new Promise(function (resolve, reject) {
    if (appData.overallWinLossChart) {
      appData.overallWinLossChart.data.datasets[0].data = [0, 0];
      appData.overallWinLossChart.update();
    }
    $("#overall-wl-loading").css("display", "block");
    var token = loginCheck();
    $.ajax({
      url: API_URL + '/api/win-loss',
      headers: { token: token },
      success: function success(data) {
        console.log(data);
        $("#overall-wl-loading").css("display", "none");
        appData.overallWinLoss = [data.wins, data.losses];
        appData.totalGamesPlayed = data.wins + data.losses;
        resolve(appData.overallWinLoss);
      },
      error: function error(err) {
        if (err.status == 401) {
          cookies.erase("token");
          document.location.href = "/login";
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $("#overall-wl-loading").css("display", "none");
        reject(err);
      }
    });
  });
};

var getDrafts = function getDrafts(perPage) {
  if (perPage === undefined) {
    perPage = 10;
  }
  $("#drafts-loading").css("display", "block");
  var token = loginCheck();
  var url = API_URL + '/api/drafts?per_page=' + perPage;
  $.ajax({
    url: url,
    headers: { token: token },
    success: function success(data) {
      $("#drafts-loading").css("display", "none");
      appData.homeDraftList = [];
      $.each(data.docs, function (key, value) {
        value.link = '/draft/?draftID=' + value._id;
        value.draftName = value.draftID.split(':')[1];
        var draftNameSplit = value.draftName.split("_");
        if (draftNameSplit.length == 3) {
          // for drafts like QuickDraft_M19_08262018 => M19
          value.draftName = draftNameSplit[1] + " " + draftNameSplit[0];
        }
        value.timeago = timeago().format(value.date);
        appData.homeDraftList.push(value);
      });
    },
    error: function error(err) {
      if (err.status == 401) {
        cookies.erase("token");
        document.location.href = "/login";
      } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
        appData.homeDraftList.push({
          draftName: "Your account has been locked!",
          wins: "?",
          losses: "?",
          link: "https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md#inspector-says-my-account-is-locked-what-gives"
        });
      } else if (err.responseJSON.error && err.responseJSON.error == " no records") {
        appData.homeDraftList.push({
          deckName: "No game records found (but you've authorized at least one tracker). Go play some MTGA!",
          wins: "?",
          losses: "?",
          link: ""
        });
      } else if (err.responseJSON.error && err.responseJSON.error == "no authed trackers") {
        appData.homeDraftList.push({
          draftName: "No authorized trackers found :(",
          wins: "?",
          losses: "?",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements"
        });
      }
      $("#drafts-loading").css("display", "none");
    }
  });
};

var getDecks = function getDecks(includeHidden) {
  $("#decks-loading").css("display", "block");
  var token = loginCheck();
  var url = API_URL + '/api/decks';
  if (includeHidden) {
    url += "?includeHidden=true";
  }
  $.ajax({
    url: url,
    headers: { token: token },
    success: function success(data) {
      $("#decks-loading").css("display", "none");
      appData.homeDeckList = [];
      $.each(data, function (key, value) {
        value.link = '/deck/?deckID=' + value.deckID;
        value.wins = value.wins.length;
        value.losses = value.losses.length;
        appData.homeDeckList.unshift(value);
      });
    },
    error: function error(err) {
      if (err.status == 401) {
        cookies.erase("token");
        document.location.href = "/login";
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeDeckList.push({
          deckName: "No game records found (but you've authorized at least one tracker). Go play some MTGA!",
          wins: "?",
          losses: "?",
          link: ""
        });
      } else if (err.responseJSON.error && err.responseJSON.error == "no authed trackers") {
        appData.homeDeckList.push({
          deckName: "No authorized trackers found :( Have you authorized MTGATracker?",
          wins: "?",
          losses: "?",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements"
        });
      }
      $("#decks-loading").css("display", "none");
    }
  });
};

var hideDeck = function hideDeck(deckID, button) {
  if (button) {
    $(button).prop('disabled', true);
  }
  console.log("hideDeck called");
  var token = loginCheck();
  var url = API_URL + '/api/deck/' + deckID + '/hide';
  $.ajax({
    url: url,
    method: "POST",
    headers: { token: token },
    success: function success(data) {
      if (button) {
        $(button).prop('disabled', false);
      }
      console.log("success, hidden");
      appData.homeDeckList.forEach(function (deck) {
        if (deck.deckID == deckID) {
          deck.hidden = true;
        }
      });
    },
    error: function error(err) {
      if (button) {
        $(button).prop('disabled', false);
      }
      console.log("err didn't hide :(");
      if (err.status == 401) {
        cookies.erase("token");
        document.location.href = "/login";
      } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
        appData.homeDeckList.push({
          deckName: "Your account has been locked!",
          wins: "?",
          losses: "?",
          link: "https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md#inspector-says-my-account-is-locked-what-gives"
        });
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeDeckList.push({
          deckName: "No game records found (but you've authorized at least one tracker). Go play some MTGA!",
          wins: "?",
          losses: "?",
          link: ""
        });
      } else if (err.responseJSON.error && err.responseJSON.error == "no authed trackers") {
        appData.homeDeckList.push({
          deckName: "No authorized trackers found :(",
          wins: "?",
          losses: "?",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements"
        });
      }
    }
  });
};

var unHideDeck = function unHideDeck(deckID, button) {
  if (button) {
    $(button).prop('disabled', true);
  }
  console.log("unHideDeck called");
  var token = loginCheck();
  var url = API_URL + '/api/deck/' + deckID + '/unhide';
  $.ajax({
    url: url,
    method: "POST",
    headers: { token: token },
    success: function success(data) {
      if (button) {
        $(button).prop('disabled', false);
      }
      console.log("success, unhidden");
      appData.homeDeckList.forEach(function (deck) {
        if (deck.deckID == deckID) {
          deck.hidden = false;
        }
      });
    },
    error: function error(err) {
      if (button) {
        $(button).prop('disabled', false);
      }
      console.log("err didn't unhide :(");
      if (err.status == 401) {
        cookies.erase("token");
        document.location.href = "/login";
      } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
        appData.homeDeckList.push({
          deckName: "Your account has been locked!",
          wins: "?",
          losses: "?",
          link: "https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md#inspector-says-my-account-is-locked-what-gives"
        });
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeDeckList.push({
          deckName: "No game records found (but you've authorized at least one tracker). Go play some MTGA!",
          wins: "?",
          losses: "?",
          link: ""
        });
      } else if (err.responseJSON.error && err.responseJSON.error == "no authed trackers") {
        appData.homeDeckList.push({
          deckName: "No game records found :(",
          wins: "?",
          losses: "?",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements"
        });
      }
    }
  });
};

var getGames = function getGames(page, opts) {
  console.log("getting games... " + JSON.stringify(opts));
  $("#more-games-button").removeClass("btn-info").addClass("btn-primary").val("Loading games...").prop('disabled', true);
  appData.homeGameListPage += 1;
  if (page === undefined) page = 1;
  var token = loginCheck();
  var url = API_URL + '/api/games?page=' + page;
  if (opts && opts.deckID) url += '&deckID=' + opts.deckID;
  if (opts && opts.opponent) url += '&opponent=' + opts.opponent;
  if (opts && opts.removeOld) appData.homeGameList = [];
  $.ajax({
    url: url,
    headers: { token: token },
    success: function success(data) {
      if (data.totalPages > page) {
        $("#more-games-button").removeClass("btn-primary").addClass("btn-info").val('Load more (' + page + '/' + data.totalPages + ')').prop('disabled', false);
      } else {
        $("#more-games-button").removeClass("btn-info").addClass("btn-primary").val("No more to load!").prop('disabled', true);
      }
      $("#timeline-loading").css("display", "none");
      if (opts && opts.setCurrentDeckName) appData.currentDeckName = data.docs[0].players[0].deck.poolName;
      $.each(data.docs, function (idx, val) {
        var heroColors = cardUtils.cardsColors(Object.keys(val.players[0].deck.cards).map(function (x) {
          return parseInt(x, 10);
        }));
        var opponentColors = cardUtils.cardsColors(Object.keys(val.players[1].deck.cards).map(function (x) {
          return parseInt(x, 10);
        }));
        Promise.all([heroColors, opponentColors]).then(function (res) {
          var newVal = {};
          newVal.hero = val.hero;
          newVal.heroDeck = val.players[0].deck.cards;
          newVal.heroDeckColors = res[0];
          newVal.opponent = val.opponent;
          newVal.opponentDeck = val.players[1].deck.cards;
          newVal.heroDeckName = val.players[0].deck.poolName;
          newVal.deckLink = '/deck/?deckID=' + val.players[0].deck.deckID;
          newVal.opponentDeckName = val.players[1].deck.poolName;
          newVal.opponentDeckColors = res[1];
          newVal.timeago = timeago().format(val.date);
          newVal.won = val.winner == val.hero;
          newVal.link = '/game/?gameID=' + val._id;
          newVal.winner = val.winner;

          appData.homeGameList.push(newVal);
        });
      });
    },
    error: function error(err) {
      console.log(err);
      if (err.status == 401) {
        cookies.erase("token");
        document.location.href = "/login";
      } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
        appData.homeGameList.push({
          heroDeckName: "Your account has been locked!",
          timeago: "Click here for more info",
          hero: "unknown",
          opponent: "unknown",
          winner: "unknown",
          link: "https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md#inspector-says-my-account-is-locked-what-gives"
        });
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeGameList.push({
          heroDeckName: "No game records found (but you've authorized at least one tracker). Go play some MTGA!",
          timeago: "No data",
          hero: "unknown",
          opponent: "unknown",
          winner: "unknown",
          link: ""
        });
      } else if (err.responseJSON.error && err.responseJSON.error == "no authed trackers") {
        appData.homeGameList.push({
          heroDeckName: "No authorized trackers found  :( Have you authorized MTGATracker?",
          timeago: "Click here for more info",
          hero: "unknown",
          opponent: "unknown",
          winner: "unknown",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements"
        });
      }
      $("#timeline-loading").css("display", "none");
    }
  });
};

module.exports = {
  getDecks: getDecks,
  getGames: getGames,
  getDeckWinLossByColor: getDeckWinLossByColor,
  getGame: getGame,
  hideDeck: hideDeck,
  unHideDeck: unHideDeck,
  getDraft: getDraft,
  getDrafts: getDrafts,
  getOverallWinLoss: getOverallWinLoss,
  getPlayerEventHistory: getPlayerEventHistory,
  getDeckCount: getDeckCount,
  getTimeStats: getTimeStats,
  API_URL: API_URL
};