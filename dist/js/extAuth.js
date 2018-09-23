'use strict';

var _require = require('./api'),
    API_URL = _require.API_URL;

var _require2 = require("./conf"),
    pagePrefix = _require2.pagePrefix;

var cookies = require('browser-cookies');

var _require3 = require('./conf'),
    loginCheck = _require3.loginCheck;

var extAuthAttempt = function extAuthAttempt(provider, code) {
  $.ajax({
    url: API_URL + '/public-api/' + provider + '-auth-attempt',
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
      appData.loginError = "API error";
      appData.loginErrorDescription = xhr.responseText;
      $("#auth-loading").slideUp();
      $("#auth-error").slideDown();
      console.log("error! " + status);
      console.log(xhr);
      console.log(status);
      console.log(err);
    }
  });
};

var extAuthRoute = function extAuthRoute(provider) {
  return function (c, n) {
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
          console.log('time to handle ext auth with code: ' + c.params.code + ' ' + c.params.scope);
          extAuthAttempt(provider, c.params.code);
        }
      });
    });
  };
};

var trackerAuthAttempt = function trackerAuthAttempt(code) {
  var token = loginCheck();
  $.ajax({
    url: API_URL + '/api/authorize-token',
    type: "POST",
    headers: { token: token },
    data: JSON.stringify({ "trackerID": code }),
    dataType: "json",
    contentType: "application/json",
    success: function success(data) {
      // TODO: promisify this?
      console.log('got some data');
      console.log(data);
      $("#auth-loading").slideUp();
      $("#auth-success").slideDown();
      setTimeout(function () {
        window.location.href = pagePrefix + '/';
      }, 1000);
    },
    error: function error(xhr, status, err) {
      appData.loginError = "API error";
      appData.loginErrorDescription = xhr.responseText;
      $("#auth-loading").slideUp();
      $("#auth-error").slideDown();
      console.log("error! " + status);
      console.log(xhr);
      console.log(status);
      console.log(err);
    }
  });
};

var trackerAuthRoute = function trackerAuthRoute(ctx, next) {
  $(function () {
    $("#auth-wrapper").load(pagePrefix + '/templates/ext-auth-inner.html?v=1.3.0', function (loaded) {
      rivets.bind($('#app'), { data: appData });
      console.log("trackerAuthRoute");
      if (!ctx.params.code) {
        appData.loginError = "No error, no code";
        appData.loginErrorDescription = "Nothing helpful here :(";
        $("#auth-loading").slideUp();
        $("#auth-error").slideDown();
      } else {
        console.log('time to handle tracker auth with code: ' + ctx.params.code);
        trackerAuthAttempt(ctx.params.code);
      }
    });
  });
};

module.exports = { extAuthRoute: extAuthRoute, trackerAuthRoute: trackerAuthRoute };