/* jshint esnext:true */

var DelimitedTextFormatter = require('./delimited_text_formatter');

// (415) 555-1212
var NANP_PHONE_DELIMITERS = {
  0: '(',
  4: ')',
  5: ' ',
  9: '-'
};

// 1 (415) 555-1212
var NANP_PHONE_DELIMITERS_WITH_1 = {
  1:  ' ',
  2:  '(',
  6:  ')',
  7:  ' ',
  11: '-'
};

// +1 (415) 555-1212
var NANP_PHONE_DELIMITERS_WITH_PLUS = {
  2:  ' ',
  3:  '(',
  7:  ')',
  8:  ' ',
  12: '-'
};

// This should match any characters in the maps above.
var DELIMITER_PATTERN = /[-\(\) ]/g;

class PhoneFormatter extends DelimitedTextFormatter {
  constructor() {
    if (arguments.length !== 0) {
      throw new Error('were you trying to set a delimiter ('+arguments[0]+')?');
    }
  }

  isDelimiter(chr) {
    var map = this.delimiterMap;
    for (var index in map) {
      if (map.hasOwnProperty(index)) {
        if (map[index] === chr) {
          return true;
        }
      }
    }
    return false;
  }

  delimiterAt(index) {
    return this.delimiterMap[index];
  }

  hasDelimiterAtIndex(index) {
    var delimiter = this.delimiterAt(index);
    return delimiter !== undefined && delimiter !== null;
  }

  parse(text, error) {
    if (!error) { error = function(){}; }
    var digits = this.digitsWithoutCountryCode(text);
    // Source: http://en.wikipedia.org/wiki/North_American_Numbering_Plan
    //
    // Area Code
    if (text.length < 10) {
      error('phone-formatter.number-too-short');
    }
    if (digits[0] === '0') {
      error('phone-formatter.area-code-zero');
    }
    if (digits[0] === '1') {
      error('phone-formatter.area-code-one');
    }
    if (digits[1] === '9') {
      error('phone-formatter.area-code-n9n');
    }
    // Central Office Code
    if (digits[3] === '1') {
      error('phone-formatter.central-office-one');
    }
    if (digits.slice(4, 6) === '11') {
      error('phone-formatter.central-office-n11');
    }
    return super(text, error);
  }

  format(value) {
    this.guessFormatFromText(value);
    return super(this.removeDelimiterMapChars(value));
  }

  isChangeValid(change, error) {
    this.guessFormatFromText(change.proposed.text);

    if (change.inserted.text.length > 1) {
      // handle pastes
      var text = change.current.text;
      var selectedRange = change.current.selectedRange;
      var toInsert = change.inserted.text;

      // Replace the selection with the new text, remove non-digits, then format.
      var formatted = this.format((
        text.slice(0, selectedRange.start) +
        toInsert +
        text.slice(selectedRange.start+selectedRange.length)
      ).replace(/[^\d]/g, ''));

      change.proposed = {
        text: formatted,
        selectedRange: {
          start: formatted.length - (text.length - (selectedRange.start + selectedRange.length)),
          length: 0
        }
      };

      return super(change, error);
    }

    if (/^\d*$/.test(change.inserted.text) || change.proposed.text.indexOf('+') === 0) {
      return super(change, error);
    } else {
      return false;
    }
  }

  /**
   * Re-configures this formatter to use the delimiters appropriate
   * for the given text.
   *
   * @param {string} text A potentially formatted string containing a phone number.
   * @private
   */
  guessFormatFromText(text) {
    if (text && text[0] === '+') {
      this.delimiterMap = NANP_PHONE_DELIMITERS_WITH_PLUS;
      this.maximumLength = 1 + 1 + 10 + 5;
    } else if (text && text[0] === '1') {
      this.delimiterMap = NANP_PHONE_DELIMITERS_WITH_1;
      this.maximumLength = 1 + 10 + 5;
    } else {
      this.delimiterMap = NANP_PHONE_DELIMITERS;
      this.maximumLength = 10 + 4;
    }
  }

  /**
   * Gives back just the phone number digits as a string without the
   * country code. Future-proofing internationalization where the country code
   * isn't just +1.
   *
   * @private
   */
  digitsWithoutCountryCode(text) {
    var digits = (text || '').replace(/[^\d]/g, '');
    var extraDigits = digits.length - 10;
    if (extraDigits > 0) {
      digits = digits.substr(extraDigits);
    }
    return digits;
  }

  /**
   * Removes characters from the phone number that will be added
   * by the formatter.
   *
   * @private
   */
  removeDelimiterMapChars(text) {
    return (text || '').replace(DELIMITER_PATTERN, '');
  }
}

module.exports = PhoneFormatter;
