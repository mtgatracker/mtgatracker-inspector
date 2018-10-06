const API_URL = "https://gx3.mtgatracker.com/str-85b6a06b2d213fac515a8ba7b582387a-p3/mtgatracker-prod-EhDvLyq7PNb"

var cookies = require('browser-cookies');
let { loginCheck } = require('./conf')

var getGame = function(gameID) {
  return new Promise((resolve, reject) => {
    $(".game-loading").css("display", "block")
    $(".export-button").prop('disabled', true);
    let token = loginCheck()
    $.ajax({
      url: `${API_URL}/api/game/_id/${gameID}`,
      headers: {token: token},
      success: function(data) {
        $(".game-loading").css("display", "none")
        $(".export-button").prop('disabled', false);
        resolve(data)
      },
      error: function(err) {
        if (err.status == 401) {
          cookies.erase("token")
          document.location.href = "/login"
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $(".game-loading").css("display", "none")
        reject(err)
      }
    })
  })
}

var getDraft = function(draftID) {
  return new Promise((resolve, reject) => {
    $(".draft-loading").css("display", "block")
    let token = loginCheck()
    $.ajax({
      url: `${API_URL}/api/draft/_id/${draftID}`,
      headers: {token: token},
      success: function(data) {
        $(".draft-loading").css("display", "none")
        resolve(data)
      },
      error: function(err) {
        if (err.status == 401) {
          cookies.erase("token")
          document.location.href = "/login"
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $(".game-loading").css("display", "none")
        reject(err)
      }
    })
  })
}

var getDeckWinLossByColor = function(deckID) {
  return new Promise((resolve, reject) => {
    if (appData.winLossColorChart) {
      appData.winLossColorChart.data.datasets[0].data = [0,0,0,0,0]
      appData.winLossColorChart.update()
    }
    $("#matchup-loading").css("display", "block")
    let token = loginCheck()
    $.ajax({
      url: `${API_URL}/api/deck/${deckID}/winloss-colors`,
      headers: {token: token},
      success: function(data) {
        console.log(data)
        $("#matchup-loading").css("display", "none")
        appData.winLossColors = [
          data.Green.wins / data.Green.total,
          data.Blue.wins / data.Blue.total,
          data.Red.wins / data.Red.total,
          data.White.wins / data.White.total,
          data.Black.wins / data.Black.total
        ]
        resolve(appData.winLossColors)
      },
      error: function(err) {
        if (err.status == 401) {
          cookies.erase("token")
          document.location.href = "/login"
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $("#matchup-loading").css("display", "none")
        reject(err)
      }
    })
  })
}

var getPlayerEventHistory = function() {
  return new Promise((resolve, reject) => {
    if (appData.playerEventHistoryChart) {
      appData.playerEventHistoryChart.data.datasets = []
      appData.playerEventHistoryChart.data.labels = []
      appData.playerEventHistoryChart.update()
    }
    $("#event-usage-loading").css("display", "block")
    let token = loginCheck()
    $.ajax({
      url: `${API_URL}/api/event-history`,
      headers: {token: token},
      success: function(data) {
        $("#event-usage-loading").css("display", "none")
        appData.playerEventHistoryData = data
        resolve(appData.playerEventHistoryData)
      },
      error: function(err) {
        if (err.status == 401) {
          cookies.erase("token")
          document.location.href = "/login"
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $("#event-usage-loading").css("display", "none")
        reject(err)
      }
    })
  })
}

var getDeckCount = function() {
  let token = loginCheck()
  let url = `${API_URL}/api/decks/count`

  $.ajax({
    url: url,
    headers: {token: token},
    success: function(data) {
      appData.totalDecks = data.numDecks;
    },
    error: function(err) {
      if (err.status == 401) {
        cookies.erase("token")
        document.location.href = "/login"
      }
    }
  })
}

var getTimeStats = function() {
  let token = loginCheck()
  let url = `${API_URL}/api/time-stats`

  $.ajax({
    url: url,
    headers: {token: token},
    success: function(data) {
      $("#player-stats-loading").css("display", "none")
      appData.totalTimeSeconds = data.timeStats.totalTimeSeconds;
      appData.longestGameLengthSeconds = data.timeStats.maxTimeSeconds;
      appData.averageGameLengthSeconds = data.timeStats.avgTimeSeconds;
    },
    error: function(err) {
      if (err.status == 401) {
        cookies.erase("token")
        document.location.href = "/login"
      }
    }
  })
}

var getOverallWinLoss = function() {
  return new Promise((resolve, reject) => {
    if (appData.overallWinLossChart) {
      appData.overallWinLossChart.data.datasets[0].data = [0,0]
      appData.overallWinLossChart.update()
    }
    $("#overall-wl-loading").css("display", "block")
    let token = loginCheck()
    $.ajax({
      url: `${API_URL}/api/win-loss`,
      headers: {token: token},
      success: function(data) {
        console.log(data)
        $("#overall-wl-loading").css("display", "none")
        appData.overallWinLoss = [
          data.wins,
          data.losses
        ]
        appData.totalGamesPlayed = data.wins + data.losses;
        resolve(appData.overallWinLoss)
      },
      error: function(err) {
        if (err.status == 401) {
          cookies.erase("token")
          document.location.href = "/login"
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $("#overall-wl-loading").css("display", "none")
        reject(err)
      }
    })
  })
}


var getDrafts = function(perPage) {
  if (perPage === undefined) {
    perPage = 10;
  }
  $("#drafts-loading").css("display", "block")
  let token = loginCheck()
  let url = `${API_URL}/api/drafts?per_page=${perPage}`
  $.ajax({
    url: url,
    headers: {token: token},
    success: function(data) {
      $("#drafts-loading").css("display", "none")
      appData.homeDraftList = []
      $.each(data.docs, function(key, value) {
        value.link = `/draft/?draftID=${value._id}`
        value.draftName = value.draftID.split(':')[1]
        let draftNameSplit = value.draftName.split("_")
        if (draftNameSplit.length == 3) {  // for drafts like QuickDraft_M19_08262018 => M19
          value.draftName = draftNameSplit[1] + " " + draftNameSplit[0]
        }
        value.timeago = timeago().format(value.date)
        appData.homeDraftList.push(value)
      })
    },
    error: function(err) {
      if (err.status == 401) {
        cookies.erase("token")
        document.location.href = "/login"
      } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
        appData.homeDraftList.push({
          draftName: "Your account has been locked!",
          wins: "?",
          losses: "?",
          link: "https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md#inspector-says-my-account-is-locked-what-gives",
        })
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeDraftList.push({
          draftName: "No game records found :(",
          wins: "?",
          losses: "?",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements",
        })
      }
      $("#drafts-loading").css("display", "none")
    }
  })
}


var getDecks = function(includeHidden) {
  $("#decks-loading").css("display", "block")
  let token = loginCheck()
  let url = `${API_URL}/api/decks`
  if (includeHidden) {
    url += "?includeHidden=true"
  }
  $.ajax({
    url: url,
    headers: {token: token},
    success: function(data) {
      $("#decks-loading").css("display", "none")
      appData.homeDeckList = []
      $.each(data, function(key, value){
        value.link = `/deck/?deckID=${value.deckID}`
        value.wins = value.wins.length
        value.losses = value.losses.length
        value.winPercent = Math.round((value.wins / (value.wins + value.losses)) * 100)
        appData.homeDeckList.unshift(value)
      })
    },
    error: function(err) {
      if (err.status == 401) {
        cookies.erase("token")
        document.location.href = "/login"
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeDeckList.push({
          deckName: "No game records found :( Have you authorized MTGATracker?",
          wins: "?",
          losses: "?",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements",
        })
      }
      $("#decks-loading").css("display", "none")
    }
  })
}

var hideDeck = function(deckID, button) {
  if (button) {
    $(button).prop('disabled', true);
  }
  console.log("hideDeck called")
  let token = loginCheck()
  let url = `${API_URL}/api/deck/${deckID}/hide`
  $.ajax({
    url: url,
    method: "POST",
    headers: {token: token},
    success: function(data) {
      if (button) {
        $(button).prop('disabled', false);
      }
      console.log("success, hidden")
      appData.homeDeckList.forEach(deck => {
        if (deck.deckID == deckID) {
          deck.hidden = true;
        }
      })
    },
    error: function(err) {
      if (button) {
        $(button).prop('disabled', false);
      }
      console.log("err didn't hide :(")
      if (err.status == 401) {
        cookies.erase("token")
        document.location.href = "/login"
      } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
        appData.homeDeckList.push({
          deckName: "Your account has been locked!",
          wins: "?",
          losses: "?",
          link: "https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md#inspector-says-my-account-is-locked-what-gives",
        })
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeDeckList.push({
          deckName: "No game records found :(",
          wins: "?",
          losses: "?",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements",
        })
      }
    }
  })
}

var unHideDeck = function(deckID, button) {
  if (button) {
    $(button).prop('disabled', true);
  }
  console.log("unHideDeck called")
  let token = loginCheck()
  let url = `${API_URL}/api/deck/${deckID}/unhide`
  $.ajax({
    url: url,
    method: "POST",
    headers: {token: token},
    success: function(data) {
      if (button) {
        $(button).prop('disabled', false);
      }
      console.log("success, unhidden")
      appData.homeDeckList.forEach(deck => {
        if (deck.deckID == deckID) {
          deck.hidden = false;
        }
      })
    },
    error: function(err) {
      if (button) {
        $(button).prop('disabled', false);
      }
      console.log("err didn't unhide :(")
      if (err.status == 401) {
        cookies.erase("token")
        document.location.href = "/login"
      } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
        appData.homeDeckList.push({
          deckName: "Your account has been locked!",
          wins: "?",
          losses: "?",
          link: "https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md#inspector-says-my-account-is-locked-what-gives",
        })
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeDeckList.push({
          deckName: "No game records found :(",
          wins: "?",
          losses: "?",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements",
        })
      }
    }
  })
}

var getGames = function(page, opts) {
  console.log("getting games... " + JSON.stringify(opts))
  $("#more-games-button").removeClass("btn-info").addClass("btn-primary").val("Loading games...").prop('disabled', true)
  appData.homeGameListPage += 1;
  if (page === undefined) page = 1;
  let token = loginCheck()
  let url = `${API_URL}/api/games?page=${page}`
  if (opts && opts.deckID)
    url += `&deckID=${opts.deckID}`
  if (opts && opts.opponent)
    url += `&opponent=${opts.opponent}`
  if (opts && opts.removeOld)
    appData.homeGameList = []
  $.ajax({
    url: url,
    headers: {token: token},
    success: function(data) {
      if(data.totalPages > page) {
        $("#more-games-button").removeClass("btn-primary").addClass("btn-info").val(`Load more (${page}/${data.totalPages})`).prop('disabled', false)
      } else {
        $("#more-games-button").removeClass("btn-info").addClass("btn-primary").val("No more to load!").prop('disabled', true)
      }
      $("#timeline-loading").css("display", "none")
      if (opts && opts.setCurrentDeckName)
        appData.currentDeckName = data.docs[0].players[0].deck.poolName
      $.each(data.docs, function(idx, val) {
        let heroColors = cardUtils.cardsColors(Object.keys(val.players[0].deck.cards).map(x => parseInt(x, 10)))
        let opponentColors = cardUtils.cardsColors(Object.keys(val.players[1].deck.cards).map(x => parseInt(x, 10)))
        Promise.all([heroColors, opponentColors]).then(res => {
          let newVal = {}
          newVal.hero = val.hero
          newVal.heroDeck = val.players[0].deck.cards
          newVal.heroDeckColors = res[0]
          newVal.opponent = val.opponent
          newVal.opponentDeck = val.players[1].deck.cards
          newVal.heroDeckName = val.players[0].deck.poolName
          newVal.deckLink = `/deck/?deckID=${val.players[0].deck.deckID}`
          newVal.opponentDeckName = val.players[1].deck.poolName
          newVal.opponentDeckColors = res[1]
          newVal.timeago = timeago().format(val.date)
          newVal.won = val.winner == val.hero
          newVal.link = `/game/?gameID=${val._id}`
          newVal.winner = val.winner

          appData.homeGameList.push(newVal)
        })
      })
    },
    error: function(err) {
      console.log(err)
      if (err.status == 401) {
        cookies.erase("token")
        document.location.href = "/login"
      } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
        appData.homeGameList.push({
          heroDeckName: "Your account has been locked!",
          timeago: "Click here for more info",
          hero: "unknown",
          opponent: "unknown",
          winner: "unknown",
          link: "https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md#inspector-says-my-account-is-locked-what-gives",
        })
      } else if (err.responseJSON.error && err.responseJSON.error == "no records") {
        appData.homeGameList.push({
          heroDeckName: "No game records found :( Have you authorized MTGATracker?",
          timeago: "Click here for more info",
          hero: "unknown",
          opponent: "unknown",
          winner: "unknown",
          link: "https://blog.mtgatracker.com/new-sign-in-requirements",
        })
      }
      $("#timeline-loading").css("display", "none")
    }
  })
}

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
  API_URL: API_URL,
}
