'use strict';

var cookies = require('browser-cookies');

var pagePrefix = '';
if (window.location.hostname == "mtgatracker.github.io") {
  console.log("hey, hostname is github.io, setting pagePrefix");
  pagePrefix = '/mtgatracker-inspector';
}

window.pagePrefix = pagePrefix;

var loginCheck = function loginCheck() {
  var token = cookies.get("token");
  if (!token) {
    window.stop();
    window.location.href = pagePrefix + '/login/';
  }
  return token;
};

module.exports = {
  pagePrefix: pagePrefix,
  loginCheck: loginCheck
};