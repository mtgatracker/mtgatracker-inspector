"use strict";

var cookies = require('browser-cookies');

var _require = require("./deck"),
    deckRoute = _require.deckRoute;

var _require2 = require("./game"),
    gameRoute = _require2.gameRoute;

var _require3 = require("./home"),
    homeRoute = _require3.homeRoute;

var _require4 = require("./api"),
    getDecks = _require4.getDecks,
    getGames = _require4.getGames;

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
  page('/game/', parseQuerystring, gameRoute);
  page();
});