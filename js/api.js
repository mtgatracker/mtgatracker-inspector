var cookies = require('browser-cookies');

var getGame = function(gameID) {
  return new Promise((resolve, reject) => {
    $(".game-loading").css("display", "block")
    let token = cookies.get("token")
    if (!token) {
      document.location.href = "/login"
    }
    $.ajax({
      url: `https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/api/game/_id/${gameID}`,
      headers: {token: token},
      success: function(data) {
        $(".game-loading").css("display", "none")
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
    let token = cookies.get("token")
    if (!token) {
      document.location.href = "/login"
    }
    $.ajax({
      url: `https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/api/deck/${deckID}/winloss-colors`,
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

var getDecks = function() {
  $("#decks-loading").css("display", "block")
  let token = cookies.get("token")
  if (!token) {
    document.location.href = "/login"
  }
  $.ajax({
    url: "https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/api/decks",
    headers: {token: token},
    success: function(data) {
      $("#decks-loading").css("display", "none")
      appData.homeDeckList = []
      $.each(data, function(key, value){
        value.link = `/deck/?deckID=${value.deckID}`
        appData.homeDeckList.push(value)
      })
    },
    error: function(err) {
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
      }
      $("#decks-loading").css("display", "none")
    }
  })
}

var getGames = function(page, opts) {
  console.log("getting games... " + JSON.stringify(opts))
  $("#more-games-button").removeClass("btn-info").addClass("btn-primary").val("Loading games...").prop('disabled', true)
  appData.homeGameListPage += 1;
  if (page === undefined) page = 1;
  let token = cookies.get("token")
  if (!token) {
    document.location.href = "/login"
  }
  let url = `https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/api/games?page=${page}`
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
      $("#more-games-button").removeClass("btn-primary").addClass("btn-info").val("Load more games").prop('disabled', false)
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
}