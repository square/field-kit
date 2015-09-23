import DelimitedTextFormatter from './delimited_text_formatter';
import { validCardLength, luhnCheck } from './card_utils';

/**
 * A generic credit card formatter.
 *
 * @extends DelimitedTextFormatter
 */
class DefaultCardFormatter extends DelimitedTextFormatter {
  constructor() {
    super(' ');
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */
  hasDelimiterAtIndex(index) {
    return index === 4 || index === 9 || index === 14;
  }

  /**
   * Will call parse on the formatter.
   *
   * @param {string} text
   * @param {function(string)} error
   * @returns {string} returns value with delimiters removed
   */
  parse(text, error) {
    const value = this._valueFromText(text);
    if (typeof error === 'function') {
      if (!validCardLength(value)) {
        error('card-formatter.number-too-short');
      }
      if (!luhnCheck(value)) {
        error('card-formatter.invalid-number');
      }
    }
    return super.parse(text, error);
  }

  /**
   * Parses the given text by removing delimiters.
   *
   * @param {?string} text
   * @returns {string}
   * @private
   */
  _valueFromText(text) {
    return super._valueFromText((text || '').replace(/[^\d]/g, ''));
  }

  /**
   * Gets the maximum length of a formatted default card number.
   *
   * @returns {number}
   */
  get maximumLength() {
    return 16 + 3;
  }
}

export default DefaultCardFormatter;
