/*! jshint esnext:true, undef:true, unused:true */

import AmexCardFormatter from './amex_card_formatter';
import DefaultCardFormatter from './default_card_formatter';
import { determineCardType, AMEX } from './card_utils';

/**
 * AdaptiveCardFormatter will decide if it needs to use
 * [AmexCardFormatter](amex_card_formatter.md) or [DefaultCardFormatter](default_card_formatter.md).
 *
 * @class AdaptiveCardFormatter
 * @public
 */
class AdaptiveCardFormatter {
  /**
   * @constructor
   */
  constructor() {
    this.amexCardFormatter = new AmexCardFormatter();
    this.defaultCardFormatter = new DefaultCardFormatter();
    this.formatter = this.defaultCardFormatter;
  }

  /**
   * @method format
   *
   * Will pick the right formatter based on the `pan` and
   * will return the formatted string.
   *
   * @param {String} pan
   * @return {String} formatted string
   * @public
   */
  format(pan) {
    return this._formatterForPan(pan).format(pan);
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
    return this.formatter.parse(text, error);
  }

  /**
   * @method isChangeValid
   *
   * Determines whether the given change should be allowed and, if so, whether
   * it should be altered.
   *
   * @param {TextFieldStateChange} change
   * @param {Function(!String)} error
   * @return {Boolean}
   * @public
   */
  isChangeValid(change, error) {
    this.formatter = this._formatterForPan(change.proposed.text);
    return this.formatter.isChangeValid(change, error);
  }

  /**
   * @method _formatterForPan
   *
   * Decides which formatter to use.
   *
   * @param {String} pan
   * @return {Formatter}
   * @private
   */
  _formatterForPan(pan) {
    if (determineCardType(pan.replace(/[^\d]+/g, '')) === AMEX) {
      return this.amexCardFormatter;
    } else {
      return this.defaultCardFormatter;
    }
  }
}

export default AdaptiveCardFormatter;
