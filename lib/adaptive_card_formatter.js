/* jshint esnext:true */

var AmexCardFormatter = require('./amex_card_formatter');
var DefaultCardFormatter = require('./default_card_formatter');
var cardUtils = require('./card_utils');

class AdaptiveCardFormatter {
  constructor() {
    this.amexCardFormatter = new AmexCardFormatter();
    this.defaultCardFormatter = new DefaultCardFormatter();
    this.formatter = this.defaultCardFormatter;
  }

  format(pan) {
    return this._formatterForPan(pan).format(pan);
  }

  parse(text, error) {
    return this.formatter.parse(text, error);
  }

  isChangeValid(change) {
    this.formatter = this._formatterForPan(change.proposed.text);
    return this.formatter.isChangeValid(change);
  }

  _formatterForPan(pan) {
    if (cardUtils.determineCardType(pan.replace(/[^\d]+/g, '')) === cardUtils.AMEX) {
      return this.amexCardFormatter;
    } else {
      return this.defaultCardFormatter;
    }
  }
}

module.exports = AdaptiveCardFormatter;
