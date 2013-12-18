(function() {
  var DelimitedTextFormatter, NANP_PHONE_DELIMITERS, NANP_PHONE_DELIMITERS_WITH_1, NANP_PHONE_DELIMITERS_WITH_PLUS, PhoneFormatter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  DelimitedTextFormatter = require('./delimited_text_formatter');

  NANP_PHONE_DELIMITERS = {
    0: '(',
    4: ')',
    5: ' ',
    9: '-'
  };

  NANP_PHONE_DELIMITERS_WITH_1 = {
    1: ' ',
    2: '(',
    6: ')',
    7: ' ',
    11: '-'
  };

  NANP_PHONE_DELIMITERS_WITH_PLUS = {
    2: ' ',
    3: '(',
    7: ')',
    8: ' ',
    12: '-'
  };

  PhoneFormatter = (function(_super) {
    __extends(PhoneFormatter, _super);

    PhoneFormatter.prototype.maximumLength = null;

    PhoneFormatter.prototype.delimiterMap = null;

    function PhoneFormatter() {
      if (arguments.length !== 0) {
        throw new Error("were you trying to set a delimiter (" + arguments[0] + ")?");
      }
    }

    PhoneFormatter.prototype.isDelimiter = function(chr) {
      var delimiter, index;
      return __indexOf.call((function() {
        var _ref, _results;
        _ref = this.delimiterMap;
        _results = [];
        for (index in _ref) {
          delimiter = _ref[index];
          _results.push(delimiter);
        }
        return _results;
      }).call(this), chr) >= 0;
    };

    PhoneFormatter.prototype.delimiterAt = function(index) {
      return this.delimiterMap[index];
    };

    PhoneFormatter.prototype.hasDelimiterAtIndex = function(index) {
      return this.delimiterAt(index) != null;
    };

    PhoneFormatter.prototype.parse = function(text, error) {
      var digits;
      digits = this.digitsWithoutCountryCode(text);
      if (!(text.length >= 10)) {
        if (typeof error === "function") {
          error('phone-formatter.number-too-short');
        }
      }
      if (digits[0] === '0') {
        if (typeof error === "function") {
          error('phone-formatter.area-code-zero');
        }
      }
      if (digits[0] === '1') {
        if (typeof error === "function") {
          error('phone-formatter.area-code-one');
        }
      }
      if (digits[1] === '9') {
        if (typeof error === "function") {
          error('phone-formatter.area-code-n9n');
        }
      }
      if (digits[3] === '1') {
        if (typeof error === "function") {
          error('phone-formatter.central-office-one');
        }
      }
      if (digits.slice(4, 6) === '11') {
        if (typeof error === "function") {
          error('phone-formatter.central-office-n11');
        }
      }
      return PhoneFormatter.__super__.parse.call(this, text, error);
    };

    PhoneFormatter.prototype.format = function(value) {
      this.guessFormatFromText(value);
      return PhoneFormatter.__super__.format.call(this, value);
    };

    PhoneFormatter.prototype.isChangeValid = function(change, error) {
      var formatted, selectedRange, text, toInsert, _ref;
      this.guessFormatFromText(change.proposed.text);
      if (change.inserted.text.length > 1) {
        _ref = change.current, text = _ref.text, selectedRange = _ref.selectedRange;
        toInsert = change.inserted.text;
        formatted = this.format((text.slice(0, selectedRange.start) + toInsert + text.slice(selectedRange.start + selectedRange.length)).replace(/[^\d]/g, ''));
        change.proposed = {
          text: formatted,
          selectedRange: {
            start: formatted.length - (text.length - (selectedRange.start + selectedRange.length)),
            length: 0
          }
        };
        return PhoneFormatter.__super__.isChangeValid.call(this, change, error);
      }
      if (/^\d*$/.test(change.inserted.text) || change.proposed.text.indexOf('+') === 0) {
        return PhoneFormatter.__super__.isChangeValid.call(this, change, error);
      } else {
        return false;
      }
    };

    PhoneFormatter.prototype.guessFormatFromText = function(text) {
      if (text[0] === '+') {
        this.delimiterMap = NANP_PHONE_DELIMITERS_WITH_PLUS;
        return this.maximumLength = 1 + 1 + 10 + 5;
      } else if (text[0] === '1') {
        this.delimiterMap = NANP_PHONE_DELIMITERS_WITH_1;
        return this.maximumLength = 1 + 10 + 5;
      } else {
        this.delimiterMap = NANP_PHONE_DELIMITERS;
        return this.maximumLength = 10 + 4;
      }
    };

    PhoneFormatter.prototype.digitsWithoutCountryCode = function(text) {
      var digits, extraDigits;
      digits = (text != null ? text : '').replace(/[^\d]/g, '');
      extraDigits = digits.length - 10;
      if (extraDigits > 0) {
        digits = digits.substr(extraDigits);
      }
      return digits;
    };

    return PhoneFormatter;

  })(DelimitedTextFormatter);

  module.exports = PhoneFormatter;

}).call(this);
