/*! jshint esnext:true, undef:true, unused:true */

import DelimitedTextFormatter from './delimited_text_formatter';
import { validCardLength, luhnCheck } from './card_utils';

/**
 * - extends [DelimitedTextFormatter](delimited_text_formatter.md)
 *
 * A generic credit card formatter.
 *
 * @class DefaultCardFormatter
 * @extends DelimitedTextFormatter
 * @public
 */
class DefaultCardFormatter extends DelimitedTextFormatter {
  /**
   * Sets the Delimitor to `' '`
   *
   * @constructor
   */
  constructor() {
    super(' ');
  }

  /**
   * @method hasDelimiterAtIndex
   *
   * @param {Number} index
   * @return {Boolean}
   * @public
   */
  hasDelimiterAtIndex(index) {
    return index === 4 || index === 9 || index === 14;
  }

  /**
   * @method parse
   *
   * Will call parse on the formatter.
   *
   * @param {String} text
   * @param {Function(String)} error
   * @return {String} returns value with delimiters removed
   * @public
   */
  parse(text, error) {
    var value = this._valueFromText(text);
    if (typeof error === 'function') {
      if (!validCardLength(value)) {
        error('card-formatter.number-too-short');
      }
      if (!luhnCheck(value)) {
        error('card-formatter.invalid-number');
      }
    }
    return super(text, error);
  }

  /**
   * @method _valueFromText
   *
   * Parses the given text by removing delimiters.
   *
   * @param {?String} text
   * @return {String}
   * @private
   */
  _valueFromText(text) {
    return super((text || '').replace(/[^\d]/g, ''));
  }
}

DefaultCardFormatter.prototype.maximumLength = 16 + 3;

export default DefaultCardFormatter;
