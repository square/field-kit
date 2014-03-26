var AmexCardFormatter = require('./amex_card_formatter');
var DefaultCardFormatter = require('./default_card_formatter');
var cardUtils = require('./card_utils');

function AdaptiveCardFormatter() {
  this.amexCardFormatter = new AmexCardFormatter();
  this.defaultCardFormatter = new DefaultCardFormatter();
  this.formatter = this.defaultCardFormatter;
}

AdaptiveCardFormatter.prototype.format = function(pan) {
  return this._formatterForPan(pan).format(pan);
};


AdaptiveCardFormatter.prototype.parse = function(text, error) {
  return this.formatter.parse(text, error);
};

AdaptiveCardFormatter.prototype.isChangeValid = function(change) {
  this.formatter = this._formatterForPan(change.proposed.text);
  return this.formatter.isChangeValid(change);
};

AdaptiveCardFormatter.prototype._formatterForPan = function(pan) {
  if (cardUtils.determineCardType(pan.replace(/[^\d]+/g, '')) === cardUtils.AMEX) {
    return this.amexCardFormatter;
  } else {
    return this.defaultCardFormatter;
  }
};

module.exports = AdaptiveCardFormatter;
