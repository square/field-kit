import AmexCardFormatter from './amex_card_formatter';
import DefaultCardFormatter from './default_card_formatter';
import { determineCardType, AMEX } from './card_utils';

/**
 * AdaptiveCardFormatter will decide if it needs to use
 * {@link AmexCardFormatter} or {@link DefaultCardFormatter}.
 */
class AdaptiveCardFormatter {
  constructor() {
    /** @private */
    this.amexCardFormatter = new AmexCardFormatter();
    /** @private */
    this.defaultCardFormatter = new DefaultCardFormatter();
    /** @private */
    this.formatter = this.defaultCardFormatter;
  }

  /**
   * Will pick the right formatter based on the `pan` and will return the
   * formatted string.
   *
   * @param {string} pan
   * @returns {string} formatted string
   */
  format(pan) {
    return this._formatterForPan(pan).format(pan);
  }

  /**
   * Will call parse on the formatter.
   *
   * @param {string} text
   * @param {function(string)} error
   * @returns {string} returns value with delimiters removed
   */
  parse(text, error) {
    return this.formatter.parse(text, error);
  }

  /**
   * Determines whether the given change should be allowed and, if so, whether
   * it should be altered.
   *
   * @param {TextFieldStateChange} change
   * @param {function(!string)} error
   * @returns {boolean}
   */
  isChangeValid(change, error) {
    this.formatter = this._formatterForPan(change.proposed.text);
    return this.formatter.isChangeValid(change, error);
  }

  /**
   * Decides which formatter to use.
   *
   * @param {string} pan
   * @returns {Formatter}
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
