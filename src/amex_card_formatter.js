import DefaultCardFormatter from './default_card_formatter';

/**
 * Amex credit card formatter.
 *
 * @extends DefaultCardFormatter
 */
class AmexCardFormatter extends DefaultCardFormatter {
  /**
   * @override
   */
  hasDelimiterAtIndex(index) {
    return index === 4 || index === 11;
  }

  /**
   * @override
   */
  get maximumLength() {
    return 15 + 2;
  }
}

export default AmexCardFormatter;
