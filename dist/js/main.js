/*!
 * Start Bootstrap - SB Admin 2 v3.3.7+1 (http://startbootstrap.com/template-overviews/sb-admin-2)
 * Copyright 2013-2018 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap/blob/gh-pages/LICENSE)
 */
$(function() {
    $('#side-menu').metisMenu();
});

var appData = {
  username: "unknown",
  homeDeckList: [],
}

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    var username = getCookie("username")
    $("#username").val(username)
    appData.username = username;
    rivets.bind($('#app'), {data: appData})
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

var getCookie = function(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var logout = function() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
  document.location.href = "login.html"
}

var authAttempt = function() {
  $("#auth-loading").css("opacity", "1")
  $("#token-submit-button").addClass("btn-primary").removeClass("btn-success").val("Attempting to log in...").prop('disabled', true)
  username = $("#username").val()
  accessCode = $("#access-code").val()
  $.ajax({
    url: "https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/public-api/auth-attempt",
    type: "POST",
    data: JSON.stringify({"username": username, "accessCode": accessCode}),
    dataType: "json",
    contentType: "application/json",
    success: function(data) {
      document.cookie = "token=" + data.token;
      document.location.href = ".."
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
  username = $("#username").val()
  document.cookie = "username = " + username;
  console.log(username)
  $.ajax({
    url: "https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/public-api/auth-request",
    type: "POST",
    data: JSON.stringify({"username": username}),
    dataType: "json",
    contentType: "application/json",
    success: function(data) {
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
      console.log(data.request)
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
        window.location.href = 'https://github.com/shawkinsl/mtga-tracker/blob/user/shawkins/inspector/logging_in.md';
      } else {
        $("#token-req-button").removeClass("btn-primary").addClass("btn-success").val("Request Token").prop('disabled', false)
        toastr.error("An unknown error occurred, please try again")
      }
    }
  })
}

var getDecks = function() {
  $("#decks-loading").css("display", "block")
  token = getCookie("token")
  if (!token) return
  $.ajax({
    url: "https://wt.mtgatracker.com/wt-bd90f3fae00b1572ed028d0340861e6a-0/mtgatracker-prod-EhDvLyq7PNb/api/decks",
    headers: {token: token},
    success: function(data) {
      $("#decks-loading").css("display", "none")
      appData.homeDeckList = []
      $.each(data, function(key, value){
        appData.homeDeckList.push(value)
      })
    }
  })
}
