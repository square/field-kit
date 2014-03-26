var DelimitedTextFormatter = require('./delimited_text_formatter');
var DIGITS_PATTERN = /^\d*$/;

function SocialSecurityNumberFormatter() {
  DelimitedTextFormatter.apply(this, arguments);
}

SocialSecurityNumberFormatter.prototype = Object.create(DelimitedTextFormatter.prototype);

SocialSecurityNumberFormatter.prototype.delimiter = '-';

SocialSecurityNumberFormatter.prototype.maximumLength = 9 + 2;

SocialSecurityNumberFormatter.prototype.hasDelimiterAtIndex = function(index) {
  return index === 3 || index === 6;
};

SocialSecurityNumberFormatter.prototype.isChangeValid = function(change) {
  if (DIGITS_PATTERN.test(change.inserted.text)) {
    return DelimitedTextFormatter.prototype.isChangeValid.call(this, change);
  } else {
    return false;
  }
};

module.exports = SocialSecurityNumberFormatter;
