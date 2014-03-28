/* jshint esnext:true */

var DelimitedTextFormatter = require('./delimited_text_formatter');
var DIGITS_PATTERN = /^\d*$/;

class SocialSecurityNumberFormatter extends DelimitedTextFormatter {
  hasDelimiterAtIndex(index) {
    return index === 3 || index === 6;
  }

  isChangeValid(change) {
    if (DIGITS_PATTERN.test(change.inserted.text)) {
      return super(change);
    } else {
      return false;
    }
  }
}

SocialSecurityNumberFormatter.prototype.delimiter = '-';
SocialSecurityNumberFormatter.prototype.maximumLength = 9 + 2;

module.exports = SocialSecurityNumberFormatter;
