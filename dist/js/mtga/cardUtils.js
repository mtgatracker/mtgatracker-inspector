"use strict";

var _require = require("./models.js"),
    CardPool = _require.CardPool;

var _require2 = require("./akh"),
    amonkhet = _require2.amonkhet;

var _require3 = require("./hou"),
    hour_of_devastation = _require3.hour_of_devastation;

var _require4 = require("./dom"),
    dominaria = _require4.dominaria;

var _require5 = require('./rix'),
    rivals_of_ixalan = _require5.rivals_of_ixalan;

var _require6 = require("./xln"),
    ixalan = _require6.ixalan;

var allCards = new CardPool({ cards: [], name: "all_cards" });

allCards.addCards(amonkhet.get("cards"));
allCards.addCards(hour_of_devastation.get("cards"));
allCards.addCards(dominaria.get("cards"));
allCards.addCards(rivals_of_ixalan.get("cards"));
allCards.addCards(ixalan.get("cards"));

var cardColors = function cardColors(cardID) {
  var card = allCards.findCard(cardID);
  if (!card) {
    console.log("UNKNOWN CARD ID: " + cardID);
    return [];
  }
  return card.get("colors");
};

var cardsColors = function cardsColors(cardIDs) {
  return new Promise(function (resolve, reject) {
    var colors = new Set();
    cardIDs.filter(function (cardID) {
      return cardID != -1;
    }).forEach(function (cardID) {
      cardColors(cardID).forEach(function (color) {
        return colors.add(color);
      });
    });
    resolve(colors);
  });
};

module.exports = {
  cardColors: cardColors,
  cardsColors: cardsColors,
  allCards: allCards
};