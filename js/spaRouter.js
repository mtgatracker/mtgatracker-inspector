var cookies = require('browser-cookies');

const { deckRoute } = require("./deck")
const { decksRoute } = require("./decks")
const { draftRoute } = require("./draft")
const { draftsRoute } = require("./drafts")
const { profileRoute } = require("./profile")
const { gameRoute } = require("./game")
const { homeRoute } = require("./home")
const { extAuthRoute, trackerAuthRoute } = require("./extAuth")
const { getDecks, getGames } = require("./api")
const { pagePrefix } = require('./conf.js')

let parseQuerystring = (ctx, next) => {
  let cleanQuerystring = ctx.querystring.split("#")[0]
  let args = cleanQuerystring.split("&")
  let params = {}
  args.forEach(arg => {
    if (arg.includes("=")) {
      let parts = arg.split("=")
      let key = parts[0]
      let value = parts[1]
      params[key] = value
    } else {
      params[arg] = true
    }
  })
  Object.assign(ctx.params, params)
  next()
}

let scrollTop = (ctx, next) => {
  window.scrollTo(0,0);
  next()
}

$(function() {
    page(`${pagePrefix}/`, scrollTop, homeRoute)
    page(`${pagePrefix}/login/`, scrollTop, (c, n) => {
      console.log("CALLED FROM /login/")
      if (cookies.get("token")) {
        window.stop();
        window.location.href = `${pagePrefix}/`
      }
    })
    page(`${pagePrefix}/deck/`, scrollTop, parseQuerystring, deckRoute)
    page(`${pagePrefix}/decks/`, scrollTop, parseQuerystring, decksRoute)
    page(`${pagePrefix}/draft/`, scrollTop, parseQuerystring, draftRoute)
    page(`${pagePrefix}/profile/`, scrollTop, parseQuerystring, profileRoute)
    page(`${pagePrefix}/drafts/`, scrollTop, parseQuerystring, draftsRoute)
    page(`${pagePrefix}/game/`, scrollTop, parseQuerystring, gameRoute)
    page(`${pagePrefix}/twitchAuth/`, scrollTop, parseQuerystring, extAuthRoute('twitch'))
    page(`${pagePrefix}/discordAuth/`, scrollTop, parseQuerystring, extAuthRoute('discord'))
    page(`${pagePrefix}/trackerAuth/`, scrollTop, parseQuerystring, trackerAuthRoute)
    page()
})
