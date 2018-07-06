"use strict";

var _require = require("./api"),
    API_URL = _require.API_URL;

var _require2 = require("./conf"),
    pagePrefix = _require2.pagePrefix;

var appData = {
  username: "unknown",
  currentDeckName: "",

  currentGameWinner: "loading ...",
  currentGameName: "",
  currentGameHero: "",
  currentGameHeroDeck: [],
  currentGameHeroDeckName: "loading ...",
  currentGameOpponent: "",
  currentGameOpponentDeck: [],
  currentGameOpponentDeckName: "loading ...",

  homeDeckList: [],
  homeGameList: [],
  homeGameListPage: 1,
  winLossColors: [0, 0, 0, 0, 0],
  winLossColorChart: null,
  bound: null,
  pagePrefix: pagePrefix

  // do this very first to try to avoid FouC
};var darkModeEnabled = localStorage.getItem("dark-mode") == "true" || false;
var enableDarkMode = function enableDarkMode(noTransition) {
  if (noTransition) {
    $(".themeable").addClass("notransition");
  }
  $(".themeable").addClass("dark-mode");
  if (appData.winLossColorChart) {
    appData.winLossColorChart.options.scales.yAxes[0].gridLines.color = "#5d5d5d";
    appData.winLossColorChart.options.scales.xAxes[0].gridLines.color = "#5d5d5d";
    appData.winLossColorChart.options.scales.yAxes[0].ticks.fontColor = "#dedede";
    appData.winLossColorChart.options.scales.xAxes[0].ticks.fontColor = "#dedede";
    appData.winLossColorChart.options.title.fontColor = "#dedede";
    appData.winLossColorChart.data.datasets[0].backgroundColor = ["#005429", "#004ba5", "#940400", "#8c8c51", "#6d6d6d"];
    appData.winLossColorChart.update();
  }
  $(".themeable").removeClass("notransition");
  setTimeout(function () {
    // after it has been long enough for any transitions to complete, flip the toggle
    // in case this is the first load, and the toggle is blank
    $("#dark-mode").prop("checked", true);
  }, 300);
};
window.enableDarkMode = enableDarkMode;
var disableDarkMode = function disableDarkMode() {
  $(".themeable").removeClass("dark-mode");
  if (appData.winLossColorChart) {
    appData.winLossColorChart.options.scales.yAxes[0].gridLines.color = "#d5d5d5";
    appData.winLossColorChart.options.scales.xAxes[0].gridLines.color = "#d5d5d5";
    appData.winLossColorChart.options.scales.xAxes[0].ticks.fontColor = "#696969";
    appData.winLossColorChart.options.scales.yAxes[0].ticks.fontColor = "#696969";
    appData.winLossColorChart.options.title.fontColor = "#696969";
    appData.winLossColorChart.data.datasets[0].backgroundColor = ["#c4d3ca", "#b3ceea", "#e47777", "#f8e7b9", "#a69f9d"];
    appData.winLossColorChart.update();
  }
};
var toggleDarkMode = function toggleDarkMode() {
  darkModeEnabled = !darkModeEnabled;
  localStorage.setItem("dark-mode", darkModeEnabled);
  if (darkModeEnabled) {
    enableDarkMode();
  } else {
    disableDarkMode();
  }
};

window.toggleDarkMode = toggleDarkMode;
if (localStorage.getItem("dark-mode") == "true") enableDarkMode(true);

var cookies = require('browser-cookies');
window.ncookies = cookies;

var cardUtils = require('mtga');
window.cardUtils = cardUtils;

var page = require('page');
window.page = page;
var spaRouter = require('./spaRouter');

var _require3 = require('./api'),
    getGames = _require3.getGames,
    hideDeck = _require3.hideDeck,
    unHideDeck = _require3.unHideDeck;

window.appData = appData;

rivets.binders.fixhref = function (el, value) {
  if (!el.href.includes(pagePrefix)) {
    var hrefStart = el.href.split("/").slice(0, 3).join("/");
    var hrefEnd = el.href.split("/").slice(3).join("/");
    el.href = "" + hrefStart + pagePrefix + "/" + hrefEnd;
  }
};

rivets.binders.multimana = function (el, value) {
  el.innerHTML = "";
  var ih = "";
  if (value === undefined) value = [];
  value.forEach(function (val) {
    if (val == "Blue") val = "u";
    val = val[0].toLowerCase();
    if (val != "c") {
      ih += "<i class=\"mi mi-mana mi-shadow mi-" + val + "\"></i>";
    }
  });
  el.innerHTML = ih;
};

rivets.binders.mana = function (el, value) {
  if (value == "Blue") value = "u";
  value = value[0].toLowerCase();
  var mi_class = "mi-" + value.toLowerCase();
  el.classList.remove("mi-w");
  el.classList.remove("mi-b");
  el.classList.remove("mi-g");
  el.classList.remove("mi-u");
  el.classList.remove("mi-r");
  el.classList.remove("mi-1");
  el.classList.remove("mi-2");
  el.classList.remove("mi-3");
  el.classList.remove("mi-4");
  el.classList.remove("mi-5");
  el.classList.remove("mi-6");
  el.classList.remove("mi-7");
  el.classList.remove("mi-8");
  el.classList.remove("mi-9");
  el.classList.remove("mi-10");
  el.classList.remove("mi-x");
  el.classList.add(mi_class);
};

rivets.binders.hideifnotcorrecttype = function (el, val) {
  var expectedType = $(el).attr("type-check");
  if (val != expectedType) {
    el.style.display = 'none';
  }
};

rivets.binders.linegame = function (el, val) {
  $(el).removeClass("danger").removeClass("success");
  if (val) {
    if (!val.won) {
      $(el).addClass("danger");
      el.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
    } else {
      $(el).addClass("success");
      el.innerHTML = '<i class="fa fa-check-circle"></i>';
    }
  }
};

rivets.binders.hidedeck = function (el, deckid) {
  console.log("attempting to bind...");
  $(el).click(function () {
    console.log("sliding up: " + '[deckid="' + deckid + '"]');
    $('[deckid="' + deckid + '"]').slideUp();
    hideDeck(deckid, el);
  });
};

rivets.binders.softhidedeck = function (el, deckid) {
  $(el).click(function () {
    console.log("softhiding deck " + deckid);
    hideDeck(deckid, el);
  });
};

rivets.binders.unhidedeck = function (el, deckid) {
  $(el).click(function () {
    console.log("softhiding deck " + deckid);
    unHideDeck(deckid, el);
  });
};

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function () {
  if (localStorage.getItem("dark-mode") == "true") enableDarkMode(true);
  $("#token-req-button").click(authRequest);
  $("#token-submit-button").click(authAttempt);
  $("#logout-button").click(logout);
  $('#side-menu').metisMenu();
  var username = cookies.get("username");
  $("#username").val(username);
  appData.username = username;
  $(window).bind("load resize", function () {
    var topOffset = 50;
    var width = this.window.innerWidth > 0 ? this.window.innerWidth : this.screen.width;
    if (width < 768) {
      $('div.navbar-collapse').addClass('collapse');
      topOffset = 100; // 2-row-menu
    } else {
      $('div.navbar-collapse').removeClass('collapse');
    }

    var height = (this.window.innerHeight > 0 ? this.window.innerHeight : this.screen.height) - 1;
    height = height - topOffset;
    if (height < 1) height = 1;
    if (height > topOffset) {
      $("#page-wrapper").css("min-height", height + "px");
    }
  });

  var url = window.location;
  var element = $('ul.nav a').filter(function () {
    return this.href == url;
  }).addClass('active').parent();

  while (true) {
    if (element.is('li')) {
      element = element.parent().addClass('in').parent();
    } else {
      break;
    }
  }
});

var logout = function logout() {
  cookies.erase("username");
  cookies.erase("token");
  document.location.href = pagePrefix + "/login/";
};

var authAttempt = function authAttempt() {
  $("#auth-loading").css("opacity", "1");
  $("#token-submit-button").addClass("btn-primary").removeClass("btn-success").val("Attempting to log in...").prop('disabled', true);
  var username = $("#username").val();
  var accessCode = $("#access-code").val();
  $.ajax({
    url: API_URL + "/public-api/auth-attempt",
    type: "POST",
    data: JSON.stringify({ "username": username, "accessCode": accessCode }),
    dataType: "json",
    contentType: "application/json",
    success: function success(data) {
      cookies.set("token", data.token, { expires: 6 });
      window.location.href = pagePrefix + "/";
    },
    error: function error(xhr, status, err) {
      $("#token-submit-button").removeClass("btn-primary").addClass("btn-success").val("Log in").prop('disabled', false);
      $("#auth-loading").css("opacity", "0");
      $('#access-code').pincodeInput().data('plugin_pincodeInput').clear();
      console.log("error! " + status);
      console.log(xhr);
      console.log(status);
      console.log(err);
      if (xhr.responseJSON.error.includes("auth_error")) {
        toastr.error("Incorrect code, try again");
      } else {
        toastr.error("An unknown error occurred, please try again");
      }
    }
  });
};

var authRequest = function authRequest() {
  $("#token-loading").css("opacity", "1");
  $("#token-req-button").addClass("btn-primary").removeClass("btn-success").val("Sending token...").prop('disabled', true);
  var username = $("#username").val();
  $.ajax({
    url: API_URL + "/public-api/auth-request",
    type: "POST",
    data: JSON.stringify({ "username": username }),
    dataType: "json",
    contentType: "application/json",
    success: function success(data) {
      $("#username").val(data.username);
      cookies.set("username", data.username, { expires: 6 });
      $("#auth-container").slideDown();
      $('#access-code').pincodeInput({
        hideDigits: false,
        keydown: function keydown(e) {
          console.log(e);
        },
        inputs: 6,
        // callback when all inputs are filled in (keyup event)
        complete: function complete(value, e, errorElement) {
          authAttempt();
        }
      });
      $("#token-req-button").addClass("btn-primary").removeClass("btn-success").val("Token Sent").prop('disabled', true);
      $("#token-loading").css("opacity", "0");
    },
    error: function error(xhr, status, err) {
      $("#token-loading").css("opacity", "0");
      console.log("error! " + status);
      console.log(xhr);
      console.log(status);
      console.log(err);
      if (xhr.responseJSON.error.includes("no user found")) {
        $("#token-req-button").removeClass("btn-primary").addClass("btn-success").val("Request Token").prop('disabled', false);
        toastr.error("User not found.<br><br>Note that you must have used MTGATracker to track at least one game in order to log in!<br><br><br><a href='https://mtgatracker.com'>Click here to get MTGATracker!</a>");
      } else if (xhr.responseJSON.error.includes("discord mapping not found")) {
        $("#token-req-button").addClass("btn-primary").removeClass("btn-success").val("Redirecting...").prop('disabled', true);
        window.stop();
        window.location.href = 'https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md';
      } else {
        $("#token-req-button").removeClass("btn-primary").addClass("btn-success").val("Request Token").prop('disabled', false);
        toastr.error("An unknown error occurred, please try again");
      }
    }
  });
};