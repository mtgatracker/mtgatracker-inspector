const { getGames, getDecks } = require('./api')
const cookies = require('browser-cookies')

let homeRoute = () => {
  console.log("CALLED FROM /")
  if (!cookies.get("token")) {
    window.stop();
    window.location.href = "/login/"
  }

  if (appData.bound)
    bound.unbind()
  console.log("unbind home")
  $("#edit-decks").unbind("change")

  $(function() {
    $("#page-wrapper").load('/templates/home-inner.html', loaded => {
      $("#more-games-button").unbind("click")
      rivets.bind($('#app'), {data: appData})
      $("#more-games-button").click(() => {getGames(appData.homeGameListPage)})
      appData.homeGameListPage = 1
      getDecks()
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