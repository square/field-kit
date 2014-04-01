/* jshint esnext:true */

var DefaultCardFormatter = require('./default_card_formatter');

class AmexCardFormatter extends DefaultCardFormatter {
  constructor() {
    super();
    this.maximumLength = 15 + 2;
  }

  hasDelimiterAtIndex(index) {
    return index === 4 || index === 11;
  }
}

module.exports = AmexCardFormatter;
