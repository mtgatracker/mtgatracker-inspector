'use strict';

var _require = require('./api'),
    API_URL = _require.API_URL;

var _require2 = require("./conf"),
    pagePrefix = _require2.pagePrefix;

var cookies = require('browser-cookies');

var discordAuthAttempt = function discordAuthAttempt(code) {
  $.ajax({
    url: API_URL + '/public-api/discord-auth-attempt',
    type: "POST",
    data: JSON.stringify({ "code": code }),
    dataType: "json",
    contentType: "application/json",
    success: function success(data) {
      // TODO: promisify this?
      console.log('got some data');
      console.log(data);
      cookies.set("token", data.token, { expires: 6 });
      cookies.set("username", data.decoded.preferred_username, { expires: 6 });
      $("#auth-loading").slideUp();
      $("#auth-success").slideDown();
      setTimeout(function () {
        window.location.href = pagePrefix + '/';
      }, 1000);
    },
    error: function error(xhr, status, err) {
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

var discordAuthRoute = function discordAuthRoute(c, n) {
  $(function () {
    $("#auth-wrapper").load(pagePrefix + '/templates/ext-auth-inner.html?v=1.3.0', function (loaded) {
      rivets.bind($('#app'), { data: appData });
      if (c.params.error) {
        appData.loginError = c.params.error;
        appData.loginErrorDescription = c.params.error_description;
        $("#auth-loading").slideUp();
        $("#auth-error").slideDown();
      } else if (!c.params.code) {
        appData.loginError = "No error, no code";
        appData.loginErrorDescription = "Nothing helpful here :(";
        $("#auth-loading").slideUp();
        $("#auth-error").slideDown();
      } else {
        console.log('time to handle discord auth with code: ' + c.params.code + ' ' + c.params.scope);
        discordAuthAttempt(c.params.code);
      }
    });
  });
};

module.exports = { discordAuthRoute: discordAuthRoute };