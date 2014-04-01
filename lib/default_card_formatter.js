/* jshint esnext:true */

var DelimitedTextFormatter = require('./delimited_text_formatter');
var cardUtils = require('./card_utils');

class DefaultCardFormatter extends DelimitedTextFormatter {
  constructor() {
    super(' ');
  }

  hasDelimiterAtIndex(index) {
    return index === 4 || index === 9 || index === 14;
  }

  parse(text, error) {
    var value = this._valueFromText(text);
    if (typeof error === 'function') {
      if (!cardUtils.validCardLength(value)) {
        error('card-formatter.number-too-short');
      }
      if (!cardUtils.luhnCheck(value)) {
        error('card-formatter.invalid-number');
      }
    }
    return super(text, error);
  }

  _valueFromText(text) {
    return super((text || '').replace(/[^\d]/g, ''));
  }
}

DefaultCardFormatter.prototype.maximumLength = 16 + 3;

module.exports = DefaultCardFormatter;
