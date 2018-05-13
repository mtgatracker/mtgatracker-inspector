var cookies = require('browser-cookies');
const { deckRoute } = require("./deck")
const { homeRoute } = require("./home")
const { getDecks, getGames } = require("./api")

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

$(function() {
    page('/', homeRoute)
    page('/login/', (c, n) => {
      console.log("CALLED FROM /login/")
      if (cookies.get("token")) {
        window.stop();
        window.location.href = "/"
      }
    })
    page('/deck/', parseQuerystring, deckRoute)
    page()
})