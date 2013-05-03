(function() {
  var DefaultCardFormatter, DelimitedTextFormatter, luhnCheck, validCardLength, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DelimitedTextFormatter = require('./delimited_text_formatter');

  _ref = require('./card_utils'), validCardLength = _ref.validCardLength, luhnCheck = _ref.luhnCheck;

  DefaultCardFormatter = (function(_super) {
    __extends(DefaultCardFormatter, _super);

    function DefaultCardFormatter() {
      _ref1 = DefaultCardFormatter.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    DefaultCardFormatter.prototype.delimiter = ' ';

    DefaultCardFormatter.prototype.maximumLength = 16 + 3;

    DefaultCardFormatter.prototype.hasDelimiterAtIndex = function(index) {
      return index === 4 || index === 9 || index === 14;
    };

    DefaultCardFormatter.prototype.parse = function(text, error) {
      var value;

      value = this._valueFromText(text);
      if (!validCardLength(value)) {
        if (typeof error === "function") {
          error('card-formatter.number-too-short');
        }
      }
      if (!luhnCheck(value)) {
        if (typeof error === "function") {
          error('card-formatter.invalid-number');
        }
      }
      return DefaultCardFormatter.__super__.parse.call(this, text, error);
    };

    DefaultCardFormatter.prototype._valueFromText = function(text) {
      return DefaultCardFormatter.__super__._valueFromText.call(this, (text != null ? text : '').replace(/[^\d]/g, ''));
    };

    return DefaultCardFormatter;

  })(DelimitedTextFormatter);

  module.exports = DefaultCardFormatter;

}).call(this);
