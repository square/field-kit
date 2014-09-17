/*! jshint esnext:true, undef:true, unused:true */

import DefaultCardFormatter from './default_card_formatter';

/**
 * Amex credit card formatter.
 *
 * @extends DefaultCardFormatter
 */
class AmexCardFormatter extends DefaultCardFormatter {
  constructor() {
    super();
    this.maximumLength = 15 + 2;
  }

  /**
   * @param {number} index
   * @return {boolean}
   */
  hasDelimiterAtIndex(index) {
    return index === 4 || index === 11;
  }
}

export default AmexCardFormatter;
