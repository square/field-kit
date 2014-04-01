/* jshint esnext:true */

var DelimitedTextFormatter = require('./delimited_text_formatter');
var DIGITS_PATTERN = /^\d*$/;

class SocialSecurityNumberFormatter extends DelimitedTextFormatter {
  constructor() {
    super('-');
    this.maximumLength = 9 + 2;
  }

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

module.exports = SocialSecurityNumberFormatter;
