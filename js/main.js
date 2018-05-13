var cookies = require('browser-cookies')
window.ncookies = cookies

var cardUtils = require('./mtga/cardUtils.js')
var page = require('page')
var spaRouter = require('./spaRouter')

const { getGames } = require('./api')

window.page = page
window.cardUtils = cardUtils

var appData = {
  username: "unknown",
  currentDeckName: "",
  homeDeckList: [],
  homeGameList: [],
  homeGameListPage: 1,
  winLossColors: [0, 0, 0, 0, 0],
  winLossColorChart: null,
  bound: null,
}

window.appData = appData

rivets.binders.multimana = (el, value) => {
  el.innerHTML = "";
  let ih = ""
  if (value === undefined)
    value = []
  value.forEach(val => {
    if (val == "Blue") val = "u"
    val = val[0].toLowerCase()
    if (val != "c") {
      ih += `<i class="mi mi-mana mi-shadow mi-${val}"></i>`
    }
  })
  el.innerHTML = ih;
}

rivets.binders.mana = function(el, value) {
    if (value == "Blue") value = "u"
    value = value[0].toLowerCase()
    let mi_class = "mi-" + value.toLowerCase()
    el.classList.remove("mi-w")
    el.classList.remove("mi-b")
    el.classList.remove("mi-g")
    el.classList.remove("mi-u")
    el.classList.remove("mi-r")
    el.classList.remove("mi-1")
    el.classList.remove("mi-2")
    el.classList.remove("mi-3")
    el.classList.remove("mi-4")
    el.classList.remove("mi-5")
    el.classList.remove("mi-6")
    el.classList.remove("mi-7")
    el.classList.remove("mi-8")
    el.classList.remove("mi-9")
    el.classList.remove("mi-10")
    el.classList.remove("mi-x")
    el.classList.add(mi_class)
}

rivets.binders.linegame = function(el, val) {
  $(el).removeClass("danger").removeClass("success")
  if (val) {
    if (!val.won) {
      $(el).addClass("danger")
      el.innerHTML = '<i class="fa fa-exclamation-circle"></i>'
    } else {
      $(el).addClass("success")
      el.innerHTML = '<i class="fa fa-check-circle"></i>'
    }
  }
}

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $("#token-req-button").click(authRequest)
    $("#token-submit-button").click(authAttempt)
    $("#logout-button").click(logout)
    $('#side-menu').metisMenu();
    var username = cookies.get("username")
    $("#username").val(username)
    appData.username = username;
    $(window).bind("load resize", function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function() {
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

var logout = function() {
  cookies.erase("username")
  cookies.erase("token")
  document.location.href = "/login/"
}

var authAttempt = function() {
  $("#auth-loading").css("opacity", "1")
  $("#token-submit-button").addClass("btn-primary").removeClass("btn-success").val("Attempting to log in...").prop('disabled', true)
  let username = $("#username").val()
  let accessCode = $("#access-code").val()
  $.ajax({
    url: "https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/public-api/auth-attempt",
    type: "POST",
    data: JSON.stringify({"username": username, "accessCode": accessCode}),
    dataType: "json",
    contentType: "application/json",
    success: function(data) {
      cookies.set("token", data.token, {expires: 6})
      window.location.href = "/"
    },
    error: function(xhr, status, err) {
      $("#token-submit-button").removeClass("btn-primary").addClass("btn-success").val("Log in").prop('disabled', false)
      $("#auth-loading").css("opacity", "0")
      $('#access-code').pincodeInput().data('plugin_pincodeInput').clear()
      console.log("error! " + status)
      console.log(xhr)
      console.log(status)
      console.log(err)
      if (xhr.responseJSON.error.includes("auth_error")) {
        toastr.error("Incorrect code, try again")
      } else {
        toastr.error("An unknown error occurred, please try again")
      }
    }
  })
}


var authRequest = function() {
  $("#token-loading").css("opacity", "1")
  $("#token-req-button").addClass("btn-primary").removeClass("btn-success").val("Sending token...").prop('disabled', true)
  let username = $("#username").val()
  $.ajax({
    url: "https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/public-api/auth-request",
    type: "POST",
    data: JSON.stringify({"username": username}),
    dataType: "json",
    contentType: "application/json",
    success: function(data) {
      $("#username").val(data.username)
      cookies.set("username", data.username, {expires: 6})
      $("#auth-container").slideDown()
      $('#access-code').pincodeInput({
        hideDigits:false,
        keydown : function(e){console.log(e)},
        inputs:6,
        // callback when all inputs are filled in (keyup event)
        complete:function(value, e, errorElement) {
          authAttempt()
        }
      });
      $("#token-req-button").addClass("btn-primary").removeClass("btn-success").val("Token Sent").prop('disabled', true)
      $("#token-loading").css("opacity", "0")
    },
    error: function(xhr, status, err) {
      $("#token-loading").css("opacity", "0")
      console.log("error! " + status)
      console.log(xhr)
      console.log(status)
      console.log(err)
      if (xhr.responseJSON.error.includes("no user found")) {
        $("#token-req-button").removeClass("btn-primary").addClass("btn-success").val("Request Token").prop('disabled', false)
        toastr.error("User not found.<br>Note that you must have used MTGATracker to track at least one game in order to log in!")
      } else if (xhr.responseJSON.error.includes("discord mapping not found")) {
        $("#token-req-button").addClass("btn-primary").removeClass("btn-success").val("Redirecting...").prop('disabled', true)
        window.stop()
        window.location.href = 'https://github.com/shawkinsl/mtga-tracker/blob/master/logging_in.md';
      } else {
        $("#token-req-button").removeClass("btn-primary").addClass("btn-success").val("Request Token").prop('disabled', false)
        toastr.error("An unknown error occurred, please try again")
      }
    }
  })
}
