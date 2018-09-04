const { getGames, getDecks, getDrafts } = require('./api')
const cookies = require('browser-cookies')
const { pagePrefix, loginCheck } = require('./conf')

console.log(`got pagePrefix ${pagePrefix} from spaRouter`)

let homeRoute = () => {
  console.log("CALLED FROM /")
  loginCheck()

  if (appData.bound)
    bound.unbind()
  console.log("unbind home")
  $("#edit-decks").unbind("change")

  $(function() {
    $("#page-wrapper").load(`${pagePrefix}/templates/home-inner.html?v=1.3.0`, loaded => {
      $("#more-games-button").unbind("click")
      rivets.bind($('#app'), {data: appData})
      $("#more-games-button").click(() => {getGames(appData.homeGameListPage)})
      appData.homeGameListPage = 1
      getDecks()
      getDrafts(10)
      getGames(1, {removeOld: true})

      $("#edit-decks").change((e) => {
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

module.exports = {
  homeRoute: homeRoute
}