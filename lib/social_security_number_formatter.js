/*! jshint esnext:true, undef:true, unused:true */

import DelimitedTextFormatter from './delimited_text_formatter';
var DIGITS_PATTERN = /^\d*$/;

/**
 * - extends [DelimitedTextFormatter](delimited_text_formatter.md)
 *
 * @class SocialSecurityNumberFormatter
 * @extends DelimitedTextFormatter
 * @public
 */
class SocialSecurityNumberFormatter extends DelimitedTextFormatter {
  /**
   * Sets the delimiter to `'-'` and max length to 11.
   *
   * @constructor
   */
  constructor() {
    super('-');
    this.maximumLength = 9 + 2;
  }


  /**
   * @method hasDelimiterAtIndex
   *
   * @param {Number} index
   * @return {Boolean}
   */
  hasDelimiterAtIndex(index) {
    return index === 3 || index === 6;
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
    if (DIGITS_PATTERN.test(change.inserted.text)) {
      return super(change, error);
    } else {
      return false;
    }
  }
}

export default SocialSecurityNumberFormatter;
