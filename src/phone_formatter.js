import DelimitedTextFormatter from './delimited_text_formatter';

/**
 * @const
 * @private
 */
const NANPPhoneDelimiters = {
  name: 'NANPPhoneDelimiters',
  0: '(',
  4: ')',
  5: ' ',
  9: '-'
};

/**
 * @const
 * @private
 */
const NANPPhoneDelimitersWithOne = {
  name: 'NANPPhoneDelimitersWithOne',
  1:  ' ',
  2:  '(',
  6:  ')',
  7:  ' ',
  11: '-'
};

/**
 * @const
 * @private
 */
const NANPPhoneDelimitersWithPlus = {
  name: 'NANPPhoneDelimitersWithPlus',
  2:  ' ',
  3:  '(',
  7:  ')',
  8:  ' ',
  12: '-'
};

/**
 * This should match any characters in the maps above.
 *
 * @const
 * @private
 */
const DELIMITER_PATTERN = /[-\(\) ]/g;

/**
 * @extends DelimitedTextFormatter
 */
class PhoneFormatter extends DelimitedTextFormatter {
  /**
   * @throws {Error} if anything is passed in
   * @param {Array} args
   */
  constructor(...args) {
    super();

    if (args.length !== 0) {
      throw new Error('were you trying to set a delimiter ('+args[0]+')?');
    }
  }

  /**
   * @param {string} chr
   * @returns {boolean}
   */
  isDelimiter(chr) {
    const map = this.delimiterMap;
    for (let index in map) {
      if (map.hasOwnProperty(index)) {
        if (map[index] === chr) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * @param {number} index
   * @returns {?string}
   */
  delimiterAt(index) {
    return this.delimiterMap[index];
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */
  hasDelimiterAtIndex(index) {
    const delimiter = this.delimiterAt(index);
    return delimiter !== undefined && delimiter !== null;
  }

  /**
   * Will call parse on the formatter.
   *
   * @param {string} text
   * @param {function(string)} error
   * @returns {string} returns value with delimiters removed
   */
  parse(text, error) {
    if (!error) { error = function(){}; }
    const digits = this.digitsWithoutCountryCode(text);
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
    return super.parse(text, error);
  }

  /**
   * @param {string} value
   * @returns {string}
   */
  format(value) {
    this.guessFormatFromText(value);
    return super.format(this.removeDelimiterMapChars(value));
  }

  /**
   * Determines whether the given change should be allowed and, if so, whether
   * it should be altered.
   *
   * @param {TextFieldStateChange} change
   * @param {function(string)} error
   * @returns {boolean}
   */
  isChangeValid(change, error) {
    this.guessFormatFromText(change.proposed.text);

    if (change.inserted.text.length > 1) {
      // handle pastes
      const text = change.current.text;
      const selectedRange = change.current.selectedRange;
      const toInsert = change.inserted.text;

      // Replace the selection with the new text, remove non-digits, then format.
      const formatted = this.format((
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

      return super.isChangeValid(change, error);
    }

    if (/^\d*$/.test(change.inserted.text) || change.proposed.text.indexOf('+') === 0) {
      // We need to store the change and current format guess so that if the isChangeValid
      // call to super changes the proposed text such that the format we thought is no longer
      // valid. If that does happen we actually just rerun it through with the correct format
      const _isChangeValid = super.isChangeValid(change, error);
      const formatName = this.delimiterMap.name;
      this.guessFormatFromText(change.proposed.text);
      return formatName === this.delimiterMap.name ?
        _isChangeValid :
        super.isChangeValid(change, error);
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
      this.delimiterMap = NANPPhoneDelimitersWithPlus;
      this.maximumLength = 1 + 1 + 10 + 5;
    } else if (text && text[0] === '1') {
      this.delimiterMap = NANPPhoneDelimitersWithOne;
      this.maximumLength = 1 + 10 + 5;
    } else if (text && text[0] === ' ') {
      this.delimiterMap = NANPPhoneDelimiters;
      this.maximumLength = 10 + 5;
    } else {
      this.delimiterMap = NANPPhoneDelimiters;
      this.maximumLength = 10 + 4;
    }
  }

  /**
   * Gives back just the phone number digits as a string without the
   * country code. Future-proofing internationalization where the country code
   * isn't just +1.
   *
   * @param {string} text
   * @private
   */
  digitsWithoutCountryCode(text) {
    let digits = (text || '').replace(/[^\d]/g, '');
    const extraDigits = digits.length - 10;
    if (extraDigits > 0) {
      digits = digits.substr(extraDigits);
    }
    return digits;
  }

  /**
   * Removes characters from the phone number that will be added
   * by the formatter.
   *
   * @param {string} text
   * @private
   */
  removeDelimiterMapChars(text) {
    return (text || '').replace(DELIMITER_PATTERN, '');
  }
}

export default PhoneFormatter;
