/*! jshint esnext:true, undef:true, unused:true */

import DelimitedTextFormatter from './delimited_text_formatter';

/**
 * @enum {String}
 *
 * ### Example
 *     (415) 555-1212
 * @readonly
 */
var NANPPhoneDelimiters = {
  0: '(',
  4: ')',
  5: ' ',
  9: '-'
};

/**
 * @enum {String}
 *
 * ### Example
 *     1 (415) 555-1212
 * @readonly
 */
var NANPPhoneDelimitersWithOne = {
  1:  ' ',
  2:  '(',
  6:  ')',
  7:  ' ',
  11: '-'
};

/**
 * @enum {String}
 *
 * ### Example
 *     +1 (415) 555-1212
 * @readonly
 */
var NANPPhoneDelimitersWithPlus = {
  2:  ' ',
  3:  '(',
  7:  ')',
  8:  ' ',
  12: '-'
};

// This should match any characters in the maps above.
var DELIMITER_PATTERN = /[-\(\) ]/g;

/**
 * - extends [DelimitedTextFormatter](delimited_text_formatter.md)
 *
 * @class PhoneFormatter
 * @extends DelimitedTextFormatter
 */
class PhoneFormatter extends DelimitedTextFormatter {
  /**
   * @constructor
   * @throws {Error} if anything is passed in
   * @param {Array} args
   */
  constructor(...args) {
    if (args.length !== 0) {
      throw new Error('were you trying to set a delimiter ('+args[0]+')?');
    }
  }

  /**
   * @method isDelimiter
   *
   * @param {String} chr
   * @return {Boolean}
   * @public
   */
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

  /**
   * @method delimiterAt
   *
   * @param {Number} index
   * @return {?String}
   * @public
   */
  delimiterAt(index) {
    return this.delimiterMap[index];
  }

  /**
   * @method hasDelimiterAtIndex
   *
   * @param {Number} index
   * @return {Boolean}
   * @public
   */
  hasDelimiterAtIndex(index) {
    var delimiter = this.delimiterAt(index);
    return delimiter !== undefined && delimiter !== null;
  }

  /**
   * @method parse
   *
   * Will call parse on the formatter.
   * @param {String} text
   * @param {Function(String)} error
   * @return {String} returns value with delimiters removed
   * @public
   */
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

  /**
   * @method format
   *
   * @param {String} value
   * @return {String}
   * @public
   */
  format(value) {
    this.guessFormatFromText(value);
    return super(this.removeDelimiterMapChars(value));
  }

  /**
   * @method isChangeValid
   *
   * Determines whether the given change should be allowed and, if so, whether
   * it should be altered.
   *
   * @param {TextFieldStateChange} change
   * @param {Function(String)} error
   * @return {Boolean}
   * @public
   */
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
   * @method guessFormatFromText
   *
   * Re-configures this formatter to use the delimiters appropriate
   * for the given text.
   *
   * @param {string} text A potentially formatted string containing a phone number.
   * @private
   */
  guessFormatFromText(text) {
    if (text && text[0] === '+') {
      this.delimiterMap = NANPPhoneDelimitersWithPlus;
      this.maximumLength = 1 + 1 + 10 + 5;
    } else if (text && text[0] === '1') {
      this.delimiterMap = NANPPhoneDelimitersWithOne;
      this.maximumLength = 1 + 10 + 5;
    } else {
      this.delimiterMap = NANPPhoneDelimiters;
      this.maximumLength = 10 + 4;
    }
  }

  /**
   * @method digitsWithoutCountryCode
   *
   * Gives back just the phone number digits as a string without the
   * country code. Future-proofing internationalization where the country code
   * isn't just +1.
   *
   * @param {String} text
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
   * @method removeDelimiterMapChars
   *
   * Removes characters from the phone number that will be added
   * by the formatter.
   *
   * @param {String} text
   * @private
   */
  removeDelimiterMapChars(text) {
    return (text || '').replace(DELIMITER_PATTERN, '');
  }
}

export default PhoneFormatter;
