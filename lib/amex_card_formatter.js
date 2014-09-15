/*! jshint esnext:true, undef:true, unused:true */

import DefaultCardFormatter from './default_card_formatter';

/**
 * - extends [DefaultCardFormatter](default_card_formatter.md)
 *
 * Amex credit card formatter.
 *
 * @class AmexCardFormatter
 * @extends DefaultCardFormatter
 * @public
 */
class AmexCardFormatter extends DefaultCardFormatter {
  /**
   * Changes the maximumLength to `17`
   *
   * @constructor
   */
  constructor() {
    super();
    this.maximumLength = 15 + 2;
  }

  /**
   * @method hasDelimiterAtIndex
   *
   * @param {Number} index
   * @return {Boolean}
   * @public
   */
  hasDelimiterAtIndex(index) {
    return index === 4 || index === 11;
  }
}

export default AmexCardFormatter;
