import Formatter from './formatter';

class NumberFormatterSettings {
  constructor() {
    /** @type boolean */
    this.alwaysShowsDecimalSeparator = false;

    /** @type number */
    this.groupingSize = 0;

    /** @type number */
    this.maximumFractionDigits = 0;

    /** @type number */
    this.minimumFractionDigits = 0;

    /** @type number */
    this.minimumIntegerDigits = 0;

    /** @type string */
    this.prefix = '';

    /** @type string */
    this.suffix = '';

    /** @type boolean */
    this.usesGroupingSeparator = false;
  }
}

/**
 * Returns a string composed of the given character repeated `length` times.
 *
 * @param {string} character
 * @param {number} length
 * @returns {string}
 * @private
 */
function chars(character, length) {
  return new Array(length + 1).join(character);
}

/**
 * @const
 * @private
 */
const DIGIT = '#';

/**
 * @const
 * @private
 */
const PADDING = '0';

/**
 * @const
 * @private
 */
const DECIMAL_SEPARATOR = '.';

/**
 * @const
 * @private
 */
const GROUPING_SEPARATOR = ',';

class NumberFormatterSettingsFormatter extends Formatter {
  /**
   * @param {NumberFormatterSettings} settings
   * @returns {string}
   */
  format(settings) {
    let result = '';

    const minimumIntegerDigits = settings.minimumIntegerDigits;
    if (minimumIntegerDigits !== 0) {
      result += chars(PADDING, minimumIntegerDigits);
    }

    result = DIGIT + result;

    if (settings.usesGroupingSeparator) {
      while (result.length <= settings.groupingSize) {
        result = DIGIT + result;
      }

      result = result.slice(0, -settings.groupingSize) +
        GROUPING_SEPARATOR +
        result.slice(-settings.groupingSize);
    }

    const minimumFractionDigits = settings.minimumFractionDigits;
    const maximumFractionDigits = settings.maximumFractionDigits;
    const hasFractionalPart = settings.alwaysShowsDecimalSeparator ||
      minimumFractionDigits > 0 ||
      maximumFractionDigits > 0;

    if (hasFractionalPart) {
      result += DECIMAL_SEPARATOR;
      for (let i = 0, length = maximumFractionDigits; i < length; i++) {
        result += (i < minimumFractionDigits) ? PADDING : DIGIT;
      }
    }

    return settings.prefix + result + settings.suffix;
  }

  /**
   * @param {string} string
   * @returns {?NumberFormatterSettings}
   */
  parse(string) {
    const result = new NumberFormatterSettings();

    let hasPassedPrefix = false;
    let hasStartedSuffix = false;
    let decimalSeparatorIndex = null;
    let groupingSeparatorIndex = null;
    let lastIntegerDigitIndex = null;

    for (var i = 0, length = string.length; i < length; i++) {
      const c = string[i];

      switch (c) {
        case DIGIT:
          if (hasStartedSuffix) { return null; }
          hasPassedPrefix = true;
          if (decimalSeparatorIndex !== null) {
            result.maximumFractionDigits++;
          }
          break;

        case PADDING:
          if (hasStartedSuffix) { return null; }
          hasPassedPrefix = true;
          if (decimalSeparatorIndex === null) {
            result.minimumIntegerDigits++;
          } else {
            result.minimumFractionDigits++;
            result.maximumFractionDigits++;
          }
          break;

        case DECIMAL_SEPARATOR:
          if (hasStartedSuffix) { return null; }
          hasPassedPrefix = true;
          decimalSeparatorIndex = i;
          lastIntegerDigitIndex = i - 1;
          break;

        case GROUPING_SEPARATOR:
          if (hasStartedSuffix) { return null; }
          hasPassedPrefix = true;
          groupingSeparatorIndex = i;
          break;

        default:
          if (hasPassedPrefix) {
            hasStartedSuffix = true;
            result.suffix += c;
          } else {
            result.prefix += c;
          }
      }
    }

    if (decimalSeparatorIndex === null) {
      lastIntegerDigitIndex = length - 1;
    }

    if (decimalSeparatorIndex === length - 1) {
      result.alwaysShowsDecimalSeparator = true;
    }

    if (groupingSeparatorIndex !== null) {
      result.groupingSize = lastIntegerDigitIndex - groupingSeparatorIndex;
      result.usesGroupingSeparator = true;
    }

    return result;
  }
}

export default NumberFormatterSettingsFormatter;
