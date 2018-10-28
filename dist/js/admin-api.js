'use strict';

var _require = require('./api'),
    API_URL = _require.API_URL;

var cookies = require('browser-cookies');

var _require2 = require('./conf'),
    loginCheck = _require2.loginCheck;

var getClientVersions = function getClientVersions(gameID) {
  return new Promise(function (resolve, reject) {
    $("#client-versions-loading").css("display", "block");
    var token = loginCheck();
    $.ajax({
      url: API_URL + '/admin-api/users/client_versions',
      headers: { token: token },
      success: function success(data) {
        $("#client-versions-loading").css("display", "none");
        console.log(data);
        resolve(data);
      },
      error: function error(err) {
        if (err.status == 401) {
          cookies.erase("token");
          document.location.href = "/login";
        } else if (err.responseJSON.error && err.responseJSON.error == "your account has been locked") {
          // nothing to do
        }
        $("#client-versions-loading").css("display", "none");
        reject(err);
      }
    });
  });
};

module.exports = {
  getClientVersions: getClientVersions
};