var DelimitedTextFormatter = require('./delimited_text_formatter');
var cardUtils = require('./card_utils');

function DefaultCardFormatter() {
  DelimitedTextFormatter.apply(this, arguments);
}

DefaultCardFormatter.prototype = Object.create(DelimitedTextFormatter.prototype);

DefaultCardFormatter.prototype.delimiter = ' ';

DefaultCardFormatter.prototype.maximumLength = 16 + 3;

DefaultCardFormatter.prototype.hasDelimiterAtIndex = function(index) {
  return index === 4 || index === 9 || index === 14;
};

DefaultCardFormatter.prototype.parse = function(text, error) {
  var value = this._valueFromText(text);
  if (typeof error === 'function') {
    if (!cardUtils.validCardLength(value)) {
      error('card-formatter.number-too-short');
    }
    if (!cardUtils.luhnCheck(value)) {
      error('card-formatter.invalid-number');
    }
  }
  return DelimitedTextFormatter.prototype.parse.call(this, text, error);
};

DefaultCardFormatter.prototype._valueFromText = function(text) {
  return DelimitedTextFormatter.prototype._valueFromText.call(
    this,
    (text || '').replace(/[^\d]/g, '')
  );
};

module.exports = DefaultCardFormatter;
