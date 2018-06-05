"use strict";

var cookies = require('browser-cookies');

var _require = require("./deck"),
    deckRoute = _require.deckRoute;

var _require2 = require("./decks"),
    decksRoute = _require2.decksRoute;

var _require3 = require("./game"),
    gameRoute = _require3.gameRoute;

var _require4 = require("./home"),
    homeRoute = _require4.homeRoute;

var _require5 = require("./api"),
    getDecks = _require5.getDecks,
    getGames = _require5.getGames;

var parseQuerystring = function parseQuerystring(ctx, next) {
  var cleanQuerystring = ctx.querystring.split("#")[0];
  var args = cleanQuerystring.split("&");
  var params = {};
  args.forEach(function (arg) {
    if (arg.includes("=")) {
      var parts = arg.split("=");
      var key = parts[0];
      var value = parts[1];
      params[key] = value;
    } else {
      params[arg] = true;
    }
  });
  Object.assign(ctx.params, params);
  next();
};

$(function () {
  page('/', homeRoute);
  page('/login/', function (c, n) {
    console.log("CALLED FROM /login/");
    if (cookies.get("token")) {
      window.stop();
      window.location.href = "/";
    }
  });
  page('/deck/', parseQuerystring, deckRoute);
  page('/decks/', parseQuerystring, decksRoute);
  page('/game/', parseQuerystring, gameRoute);
  page();
});