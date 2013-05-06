(function() {
  var DelimitedTextFormatter, ExpiryDateFormatter, interpretTwoDigitYear, zpad2, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DelimitedTextFormatter = require('./delimited_text_formatter');

  zpad2 = function(n) {
    var result;

    result = "" + n;
    while (result.length < 2) {
      result = "0" + result;
    }
    return result;
  };

  interpretTwoDigitYear = function(year) {
    var centuries, thisCentury, thisYear;

    thisYear = new Date().getFullYear();
    thisCentury = thisYear - (thisYear % 100);
    centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort(function(a, b) {
      return Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b));
    });
    return year + centuries[0];
  };

  ExpiryDateFormatter = (function(_super) {
    __extends(ExpiryDateFormatter, _super);

    function ExpiryDateFormatter() {
      _ref = ExpiryDateFormatter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ExpiryDateFormatter.prototype.delimiter = '/';

    ExpiryDateFormatter.prototype.maximumLength = 5;

    ExpiryDateFormatter.prototype.hasDelimiterAtIndex = function(index) {
      return index === 2;
    };

    ExpiryDateFormatter.prototype.format = function(value) {
      var month, year;

      if (!value) {
        return '';
      }
      month = value.month, year = value.year;
      year = year % 100;
      return ExpiryDateFormatter.__super__.format.call(this, zpad2(month) + zpad2(year));
    };

    ExpiryDateFormatter.prototype.parse = function(text, error) {
      var match, month, year;

      text = ExpiryDateFormatter.__super__.parse.call(this, text);
      if (match = text.match(/^(0?[1-9]|1\d)(\d\d)$/)) {
        month = Number(match[1]);
        year = interpretTwoDigitYear(Number(match[2]));
        return {
          month: month,
          year: year
        };
      } else {
        error('expiry-date-formatter.invalid-date');
        return null;
      }
    };

    ExpiryDateFormatter.prototype.isChangeValid = function(change, error) {
      var isBackspace, match, newText;

      isBackspace = change.proposed.text.length < change.current.text.length;
      newText = change.proposed.text;
      if (isBackspace) {
        if (change.deleted.text === this.delimiter) {
          newText = newText[0];
        }
        if (newText === '0') {
          newText = '';
        }
      } else if (change.inserted.text === this.delimiter && change.current.text === '1') {
        newText = "01" + this.delimiter;
      } else if (change.inserted.text.length > 0 && !/^\d$/.test(change.inserted.text)) {
        error('expiry-date-formatter.only-digits-allowed');
        return false;
      } else {
        if (/^[2-9]$/.test(newText)) {
          newText = '0' + newText;
        }
        if (/^1[3-9]$/.test(newText)) {
          error('expiry-date-formatter.invalid-month');
          return false;
        }
        if (newText === '00') {
          error('expiry-date-formatter.invalid-month');
          return false;
        }
        if (/^(0[1-9]|1[0-2])$/.test(newText)) {
          newText += this.delimiter;
        }
        if ((match = newText.match(/^(\d\d)(.)(\d\d?).*$/)) && match[2] === this.delimiter) {
          newText = match[1] + this.delimiter + match[3];
        }
      }
      change.proposed.text = newText;
      change.proposed.selectedRange = {
        start: newText.length,
        length: 0
      };
      return true;
    };

    return ExpiryDateFormatter;

  })(DelimitedTextFormatter);

  module.exports = ExpiryDateFormatter;

}).call(this);
