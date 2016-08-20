import DelimitedTextFormatter from './delimited_text_formatter';

/**
 * @const
 * @private
 */
const DIGITS_PATTERN = /^\d*$/;

/**
 * @extends DelimitedTextFormatter
 */
class ZipCodeFormatter extends DelimitedTextFormatter {
  constructor() {
    super('-', true);
    this.maximumLength = 9 + 1;
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */
  hasDelimiterAtIndex(index) {
    return index === 5;
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
    if (DIGITS_PATTERN.test(change.inserted.text)) {
      return super.isChangeValid(change, error);
    } else {
      return false;
    }
  }
}

export default ZipCodeFormatter;
