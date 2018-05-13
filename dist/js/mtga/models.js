"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var backbone = require('backbone');

var Card = backbone.Model.extend({
  validate: function validate(attr) {
    err = [];
    if (attr.cardType === undefined) err.push("must have cardType");
    if (attr.mtgaID === undefined) err.push("must have mtgaID");
    if (attr.name === undefined) err.push("must have name");
    if (attr.prettyName === undefined) err.push("must have prettyName");
    if (attr.set === undefined) err.push("must have set");
    if (attr.setNumber === undefined) err.push("must have setNumber");
    if (attr.subTypes === undefined) err.push("must have subTypes");
    if (!Array.isArray(attr.colorIdentity)) err.push("must have a colorIdentity");
    if (!Array.isArray(attr.colors)) err.push("must have a colors");
    if (!Array.isArray(attr.cost)) err.push("must have a cost");
    if (err.length) return err; // checkpoint
  }
});

var CardPool = backbone.Model.extend({
  validate: function validate(attr) {
    err = [];
    if (attr.name === undefined) err.push("must have name");
    if (!Array.isArray(attr.cards)) err.push("must have a cards");
    if (err.length) return err; // checkpoint
  },
  findCard: function findCard(mtgaID) {
    return this.get("cards").find(function (ci) {
      return ci && ci.get("mtgaID") == mtgaID;
    });
  },
  addCard: function addCard(card) {
    this.get("cards").push(card);
  },
  addCards: function addCards(cards) {
    var me = this;
    cards.forEach(function (card) {
      var _me$get;

      (_me$get = me.get("cards")).push.apply(_me$get, _toConsumableArray(cards));
    });
  }
});

module.exports = {
  Card: Card,
  CardPool: CardPool
};