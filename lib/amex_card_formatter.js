/* jshint esnext:true */

var DefaultCardFormatter = require('./default_card_formatter');

class AmexCardFormatter extends DefaultCardFormatter {
  hasDelimiterAtIndex(index) {
    return index === 4 || index === 11;
  }
}

AmexCardFormatter.prototype.maximumLength = 15 + 2;

module.exports = AmexCardFormatter;
