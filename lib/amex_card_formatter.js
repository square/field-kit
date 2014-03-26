var DefaultCardFormatter = require('./default_card_formatter');

function AmexCardFormatter() {
  DefaultCardFormatter.apply(this, arguments);
}

AmexCardFormatter.prototype = Object.create(DefaultCardFormatter.prototype);

AmexCardFormatter.prototype.maximumLength = 15 + 2;

AmexCardFormatter.prototype.hasDelimiterAtIndex = function(index) {
  return index === 4 || index === 11;
};

module.exports = AmexCardFormatter;
