// /game/_id/:_id
// 5af804c72088d900069b283a

const { getGame, getDecks } = require('./api')
const { pagePrefix } = require('./conf')
const allTypes = [
  'Creature',
  'Sorcery',
  'Instant',
  'Enchantment',
  'Planeswalker',
  'Artifact',
  'Land'
]

let gameRoute = (c, n) => {
  console.log("CALLED FROM /game/")
  appData.currentGameWinner = "loading ..."
  appData.currentGameName = ""
  appData.currentGameHero = ""
  appData.currentGameHeroDeck = []
  appData.currentGameHeroDeckName = "loading ..."
  appData.currentGameOpponent = ""
  appData.currentGameOpponentDeck = []
  appData.currentGameOpponentDeckName = "loading ..."
  if (appData.bound)
    bound.unbind()

  $("#edit-decks").unbind("change")

  $(function() {
    $("#page-wrapper").load(`${pagePrefix}/templates/game-inner.html`, loaded => {
      rivets.bind($('#app'), {data: appData})
      getDecks()
      getGame(c.params.gameID).then(game => {
        appData.currentGameName = `${game.hero} vs ${game.opponent}`
        appData.currentGameHero = game.hero
        appData.currentGameWinner = game.winner
        appData.currentGameOpponent = game.opponent
        appData.currentGameHeroDeck = []
        console.log(Object.keys(game.players[0].deck.cards).length)
        Object.keys(game.players[0].deck.cards).forEach(cardID => {
          let card = cardUtils.allCards.findCard(cardID)
          if (card) {
            console.log(`hello ${card.get("prettyName")}, type ${card.get("cardType").split(" ").slice(-1)[0]}`)
            let cardObj = {
              count: game.players[0].deck.cards[cardID],
              colors: card.get("colors"),
              cost: card.get("cost"),
              name: card.get("prettyName"),
              cardType: card.get("cardType").split(" ").slice(-1)[0] // "Legendary Creature" => "Creature"
            }
            appData.currentGameHeroDeck.push(cardObj)
          } else {
            console.log(`NO NO NO ${cardID}`)
          }
        })
        appData.currentGameHeroDeckName = `${game.hero}'s deck: ${game.players[0].deck.poolName}`
        appData.currentGameOpponentDeckName = game.players[1].deck.poolName
        appData.currentGameOpponentDeck = []
        Object.keys(game.players[1].deck.cards).forEach(cardID => {
          let card = cardUtils.allCards.findCard(cardID)
          if (card) {
            let cardObj = {
              count: game.players[1].deck.cards[cardID],
              colors: card.get("colors"),
              cost: card.get("cost"),
              name: card.get("prettyName"),
              cardType: card.get("cardType").split(" ").slice(-1)[0] // "Legendary Creature" => "Creature"
            }
            appData.currentGameOpponentDeck.push(cardObj)
          }
        })
      })

      $("#edit-decks").change((e) => {
        console.log("edit decks")
        if (e.target.checked) {
          $(".hide-deck").slideDown()
        } else {
          $(".hide-deck").slideUp()
          $(".deckhidden").slideUp()
        }
      })
    })
  })
}

module.exports = {gameRoute:gameRoute}
