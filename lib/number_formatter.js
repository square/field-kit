/** jshint esnext:true, undef:true, unused:true */

/**
 * @TODO Finish documenting
 */

import Formatter from './formatter';
import { isDigits, startsWith, endsWith, trim, forEach } from './utils';
import { modes, shiftParts, round } from 'stround';

// Style
var NONE = 0;
var CURRENCY = 1;
var PERCENT = 2;

var DEFAULT_LOCALE = 'en-US';
var DEFAULT_COUNTRY = 'US';

/**
 * @param {string} locale
 * @returns {Object} {lang: lang, country: country}
 * @private
 */
function splitLocaleComponents(locale) {
  var match = locale.match(/^([a-z][a-z])(?:[-_]([a-z][a-z]))?$/i);
  if (match) {
    var lang = match[1] && match[1].toLowerCase();
    var country = match[2] && match[2].toLowerCase();
    return { lang: lang, country: country };
  }
}

/**
 * This simple property getter assumes that properties will never be functions
 * and so attempts to run those functions using the given args.
 *
 * @private
 */
function get(object, key, ...args) {
  if (object) {
    var value = object[key];
    if (typeof value === 'function') {
      return value(...args);
    } else {
      return value;
    }
  }
}

/**
 * @extends Formatter
 */
class NumberFormatter extends Formatter {
  constructor() {
    super();
    this._locale = 'en';
    this.setNumberStyle(NONE);
  }

  /**
   * Gets whether this formatter will parse float number values. This value does
   * not apply to formatting. To prevent formatting floats, set
   * maximumFractionDigits to 0.
   *
   * @returns {boolean}
   */
  allowsFloats() {
    return this._get('allowsFloats');
  }

  /**
   * Sets whether this formatter will parse float number values.
   *
   * @param {boolean} allowsFloats
   * @returns {NumberFormatter}
   */
  setAllowsFloats(allowsFloats) {
    this._allowsFloats = allowsFloats;
    return this;
  }

  /**
   * Gets whether this formatter should show the decimal separator.
   *
   * @returns {boolean}
   */
  alwaysShowsDecimalSeparator() {
    return this._get('alwaysShowsDecimalSeparator');
  }

  /**
   * Sets whether this formatter will show the decimal separator.
   *
   * @param {boolean} alwaysShowsDecimalSeparator
   * @returns {NumberFormatter}
   */
  setAlwaysShowsDecimalSeparator(alwaysShowsDecimalSeparator) {
    this._alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator;
    return this;
  }

  /**
   * Gets the country code for formatter.
   *
   * @returns {string}
   */
  countryCode() {
    return this._countryCode || DEFAULT_COUNTRY;
  }

  /**
   * Sets the country code for formatter.
   *
   * @param {string} countryCode
   * @returns {NumberFormatter}
   */
  setCountryCode(countryCode) {
    this._countryCode = countryCode;
    return this;
  }

  /**
   * Gets the currency code for formatter.
   *
   * @returns {string}
   */
  currencyCode() {
    return this._get('currencyCode');
  }

  /**
   * Sets the currency code for formatter.
   *
   * @param {string} currencyCode
   * @returns {NumberFormatter}
   */
  setCurrencyCode(currencyCode) {
    this._currencyCode = currencyCode;
    return this;
  }

  /**
   * Gets the currency symbol for formatter.
   *
   * @returns {string}
   */
  currencySymbol() {
    if (this._shouldShowNativeCurrencySymbol()) {
      return this._get('currencySymbol');
    } else {
      return this._get('internationalCurrencySymbol');
    }
  }

  /**
   * Sets the currency symbol for formatter.
   *
   * @param {string} currencySymbol
   * @returns {NumberFormatter}
   */
  setCurrencySymbol(currencySymbol) {
    this._currencySymbol = currencySymbol;
    return this;
  }

  /**
   * @returns {boolean}
   * @private
   */
  _shouldShowNativeCurrencySymbol() {
    var regionDefaultCurrencyCode = this._regionDefaults().currencyCode;
    if (typeof regionDefaultCurrencyCode === 'function') {
      regionDefaultCurrencyCode = regionDefaultCurrencyCode();
    }
    return this.currencyCode() === regionDefaultCurrencyCode;
  }

  /**
   * Gets the decimal separator for formatter.
   *
   * @returns {string}
   */
  decimalSeparator() {
    return this._get('decimalSeparator');
  }

  /**
   * Sets the decimal separator for formatter.
   *
   * @param {string} decimalSeparator
   * @returns {NumberFormatter}
   */
  setDecimalSeparator(decimalSeparator) {
    this._decimalSeparator = decimalSeparator;
    return this;
  }

  /**
   * Gets the number of decimal places to shift numbers before formatting.
   *
   * @returns {string}
   */
  exponent() {
    return this._get('exponent');
  }

  /**
   * Sets the number of decimal places to shift numbers before formatting.
   *
   * @param exponent
   * @returns {NumberFormatter}
   */
  setExponent(exponent) {
    this._exponent = exponent;
    return this;
  }

  groupingSeparator() {
    return this._get('groupingSeparator');
  }

  /**
   * @param {string} groupingSeparator
   * @returns {NumberFormatter}
   */
  setGroupingSeparator(groupingSeparator) {
    this._groupingSeparator = groupingSeparator;
    return this;
  }

  /**
   * Gets the grouping size for formatter.
   *
   * @returns {number}
   */
  groupingSize() {
    return this._get('groupingSize');
  }

  /**
   * @param {number} groupingSize
   * @returns {NumberFormatter}
   */
  setGroupingSize(groupingSize) {
    this._groupingSize = groupingSize;
    return this;
  }

  /**
   * @returns {string}
   */
  internationalCurrencySymbol() {
    return this._get('internationalCurrencySymbol');
  }

  /**
   * @param {string} internationalCurrencySymbol
   * @returns {NumberFormatter}
   */
  setInternationalCurrencySymbol(internationalCurrencySymbol) {
    this._internationalCurrencySymbol = internationalCurrencySymbol;
    return this;
  }

  /**
   * @returns {boolean}
   */
  isLenient() {
    return this._lenient;
  }

  /**
   * @param {boolean} lenient
   * @returns {NumberFormatter}
   */
  setLenient(lenient) {
    this._lenient = lenient;
    return this;
  }

  /**
   * @returns {string}
   */
  locale() {
    return this._locale || DEFAULT_LOCALE;
  }

  /**
   * @param {string} locale
   * @returns {NumberFormatter}
   */
  setLocale(locale) {
    this._locale = locale;
    return this;
  }

  /**
   * @returns {number}
   */
  maximum() {
    return this._maximum;
  }

  /**
   * @param {number} max
   * @returns {NumberFormatter}
   */
  setMaximum(max) {
    this._maximum = max;
    return this;
  }

  /**
   * @returns {number}
   */
  minimum() {
    return this._minimum;
  }

  /**
   * @param {number} min
   * @returns {NumberFormatter}
   */
  setMinimum(min) {
    this._minimum = min;
    return this;
  }

  /**
   * @returns {number}
   */
  maximumFractionDigits() {
    var result = this._get('maximumFractionDigits');
    var minimumFractionDigits = this._minimumFractionDigits;
    if (result !== null && result !== undefined &&
        minimumFractionDigits !== null && minimumFractionDigits !== undefined &&
        minimumFractionDigits > result) {
      result = minimumFractionDigits;
    }
    return result;
  }

  /**
   * @param {number} maximumFractionDigits
   * @returns {NumberFormatter}
   */
  setMaximumFractionDigits(maximumFractionDigits) {
    this._maximumFractionDigits = maximumFractionDigits;
    return this;
  }

  /**
   * @returns {number}
   */
  minimumFractionDigits() {
    var result = this._get('minimumFractionDigits');
    var maximumFractionDigits = this._maximumFractionDigits;
    if (result !== null && result !== undefined &&
        maximumFractionDigits !== null && maximumFractionDigits !== undefined &&
        maximumFractionDigits < result) {
      result = maximumFractionDigits;
    }
    return result;
  }

  /**
   * @param {number} minimumFractionDigits
   * @returns {NumberFormatter}
   */
  setMinimumFractionDigits(minimumFractionDigits) {
    this._minimumFractionDigits = minimumFractionDigits;
    return this;
  }

  /**
   * @returns {number}
   */
  maximumIntegerDigits() {
    var result = this._get('maximumIntegerDigits');
    var minimumIntegerDigits = this._minimumIntegerDigits;
    if (result !== null && result !== undefined &&
        minimumIntegerDigits !== null && minimumIntegerDigits !== undefined &&
        minimumIntegerDigits > result) {
      result = minimumIntegerDigits;
    }
    return result;
  }

  /**
   * @param {number} maximumIntegerDigits
   * @returns {NumberFormatter}
   */
  setMaximumIntegerDigits(maximumIntegerDigits) {
    this._maximumIntegerDigits = maximumIntegerDigits;
    return this;
  }

  /**
   * @returns {number}
   */
  minimumIntegerDigits() {
    var result = this._get('minimumIntegerDigits');
    var maximumIntegerDigits = this._maximumIntegerDigits;
    if (result !== null && result !== undefined &&
        maximumIntegerDigits !== null && maximumIntegerDigits !== undefined &&
        maximumIntegerDigits < result) {
      result = maximumIntegerDigits;
    }
    return result;
  }

  /**
   * @param {number} minimumIntegerDigits
   * @returns {NumberFormatter}
   */
  setMinimumIntegerDigits(minimumIntegerDigits) {
    this._minimumIntegerDigits = minimumIntegerDigits;
    return this;
  }

  /**
   * Gets the minus sign used for negative numbers in some locales.
   *
   * @returns {?string}
   */
  minusSign() {
    return this._get('minusSign');
  }

  /**
   * Sets the minus sign used for negative numbers in some locales.
   *
   * @param {?string} minusSign
   * @returns {NumberFormatter}
   */
  setMinusSign(minusSign) {
    this._minusSign = minusSign;
    return this;
  }

  /**
   * @returns {number}
   */
  negativeInfinitySymbol() {
    return this._get('negativeInfinitySymbol');
  }

  /**
   * @param {number} negativeInfinitySymbol
   * @returns {NumberFormatter}
   */
  setNegativeInfinitySymbol(negativeInfinitySymbol) {
    this._negativeInfinitySymbol = negativeInfinitySymbol;
    return this;
  }

  /**
   * @returns {string}
   */
  negativePrefix() {
    return this._get('negativePrefix');
  }

  /**
   * @param {string} prefix
   * @returns {NumberFormatter}
   */
  setNegativePrefix(prefix) {
    this._negativePrefix = prefix;
    return this;
  }

  /**
   * @returns {string}
   */
  negativeSuffix() {
    return this._get('negativeSuffix');
  }

  /**
   * @param {string} prefix
   * @returns {NumberFormatter}
   */
  setNegativeSuffix(prefix) {
    this._negativeSuffix = prefix;
    return this;
  }

  /**
   * @returns {string}
   */
  notANumberSymbol() {
    return this._get('notANumberSymbol');
  }

  /**
   * @param {string} notANumberSymbol
   * @returns {NumberFormatter}
   */
  setNotANumberSymbol(notANumberSymbol) {
    this._notANumberSymbol = notANumberSymbol;
    return this;
  }

  /**
   * @returns {string}
   */
  nullSymbol() {
    return this._get('nullSymbol');
  }

  /**
   * @param {string} nullSymbol
   * @returns {NumberFormatter}
   */
  setNullSymbol(nullSymbol) {
    this._nullSymbol = nullSymbol;
    return this;
  }

  /**
   * @returns {string}
   */
  numberStyle() {
    return this._numberStyle;
  }

  /**
   * @param {string} numberStyle
   * @returns {NumberFormatter}
   */
  setNumberStyle(numberStyle) {
    this._numberStyle = numberStyle;
    switch (this._numberStyle) {
      case NONE:
        this._styleDefaults = StyleDefaults.NONE;
        break;
      case PERCENT:
        this._styleDefaults = StyleDefaults.PERCENT;
        break;
      case CURRENCY:
        this._styleDefaults = StyleDefaults.CURRENCY;
        break;
      default:
        this._styleDefaults = null;
    }
    return this;
  }

  /**
   * @returns {string}
   */
  percentSymbol() {
    return this._get('percentSymbol');
  }

  /**
   * @param {string} percentSymbol
   * @returns {NumberFormatter}
   */
  setPercentSymbol(percentSymbol) {
    this._percentSymbol = percentSymbol;
    return this;
  }

  /**
   * Gets the plus sign used in positive numbers in some locales.
   *
   * @returns {string}
   */
  plusSign() {
    return this._get('plusSign');
  }

  /**
   * Sets the plus sign used in positive numbers in some locales.
   *
   * @param {?string} plusSign
   * @returns {NumberFormatter}
   */
  setPlusSign(plusSign) {
    this._plusSign = plusSign;
    return this;
  }

  positiveInfinitySymbol() {
    return this._get('positiveInfinitySymbol');
  }

  /**
   * @param {string} positiveInfinitySymbol
   * @returns {NumberFormatter}
   */
  setPositiveInfinitySymbol(positiveInfinitySymbol) {
    this._positiveInfinitySymbol = positiveInfinitySymbol;
    return this;
  }

  /**
   * @returns {string}
   */
  positivePrefix() {
    return this._get('positivePrefix');
  }

  /**
   * @param {string} prefix
   * @returns {NumberFormatter}
   */
  setPositivePrefix(prefix) {
    this._positivePrefix = prefix;
    return this;
  }

  /**
   * @returns {string}
   */
  positiveSuffix() {
    return this._get('positiveSuffix');
  }

  /**
   * @param {string} prefix
   * @returns {NumberFormatter}
   */
  setPositiveSuffix(prefix) {
    this._positiveSuffix = prefix;
    return this;
  }

  /**
   * @returns {Function}
   */
  roundingMode() {
    return this._get('roundingMode');
  }

  /**
   * @param {Function} roundingMode
   * @returns {NumberFormatter}
   */
  setRoundingMode(roundingMode) {
    this._roundingMode = roundingMode;
    return this;
  }

  /**
   * @returns {boolean}
   */
  usesGroupingSeparator() {
    return this._get('usesGroupingSeparator');
  }

  /**
   * @param {boolean} usesGroupingSeparator
   * @returns {NumberFormatter}
   */
  setUsesGroupingSeparator(usesGroupingSeparator) {
    this._usesGroupingSeparator = usesGroupingSeparator;
    return this;
  }

  /**
   * @returns {string}
   */
  zeroSymbol() {
    return this._get('zeroSymbol');
  }

  /**
   * @param {string} zeroSymbol
   * @returns {NumberFormatter}
   */
  setZeroSymbol(zeroSymbol) {
    this._zeroSymbol = zeroSymbol;
    return this;
  }

  /**
   * @param {string} attr
   * @returns {*}
   * @private
   */
  _get(attr) {
    var value = this['_' + attr];
    if (value !== null && value !== undefined) {
      return value;
    }
    var styleDefaults = this._styleDefaults;
    var localeDefaults = this._localeDefaults();
    var regionDefaults = this._regionDefaults();
    value = get(styleDefaults, attr, this, localeDefaults);
    if (value !== null && value !== undefined) {
      return value;
    }
    value = get(localeDefaults, attr, this, styleDefaults);
    if (value !== null && value !== undefined) {
      return value;
    }
    value = get(regionDefaults, attr, this, styleDefaults);
    if (value !== null && value !== undefined) {
      return value;
    }
    value = get(this._currencyDefaults(), attr, this, localeDefaults);
    if (value !== null && value !== undefined) {
      return value;
    }
    return null;
  }

  /**
   * @param {number} number
   * @returns {string}
   */
  format(number) {
    if (number === '') {
      return '';
    }

    var zeroSymbol = this.zeroSymbol();
    if (zeroSymbol !== undefined && zeroSymbol !== null && number === 0) {
      return zeroSymbol;
    }

    var nullSymbol = this.nullSymbol();
    if (nullSymbol !== undefined && nullSymbol !== null && number === null) {
      return nullSymbol;
    }

    var notANumberSymbol = this.notANumberSymbol();
    if (notANumberSymbol !== undefined && notANumberSymbol !== null && isNaN(number)) {
      return notANumberSymbol;
    }

    var positiveInfinitySymbol = this.positiveInfinitySymbol();
    if (positiveInfinitySymbol !== undefined && positiveInfinitySymbol !== null && number === Infinity) {
      return positiveInfinitySymbol;
    }

    var negativeInfinitySymbol = this.negativeInfinitySymbol();
    if (negativeInfinitySymbol !== undefined && negativeInfinitySymbol !== null && number === -Infinity) {
      return negativeInfinitySymbol;
    }

    var negative = number < 0;

    var parts = (''+Math.abs(number)).split('.');
    var integerPart = parts[0];
    var fractionPart = parts[1] || '';

    var exponent = this.exponent();
    if (exponent !== undefined && exponent !== null) {
      var shifted = shiftParts([negative, integerPart, fractionPart], exponent);
      negative = shifted[0];
      integerPart = shifted[1];
      fractionPart = shifted[2];
      while (integerPart[0] === '0') {
        integerPart = integerPart.slice(1);
      }
    }

    // round fraction part to the maximum length
    var maximumFractionDigits = this.maximumFractionDigits();
    if (fractionPart.length > maximumFractionDigits) {
      var unrounded = `${integerPart}.${fractionPart}`;
      var rounded = this._round(negative ? `-${unrounded}` : unrounded);
      if (rounded[0] === '-') {
        rounded = rounded.slice(1);
      }
      parts = rounded.split('.');
      integerPart = parts[0];
      fractionPart = parts[1] || '';
    }

    // right-pad fraction zeros up to the minimum length
    var minimumFractionDigits = this.minimumFractionDigits();
    while (fractionPart.length < minimumFractionDigits) {
      fractionPart += '0';
    }

    // left-pad integer zeros up to the minimum length
    var minimumIntegerDigits = this.minimumIntegerDigits();
    while (integerPart.length < minimumIntegerDigits) {
      integerPart = '0' + integerPart;
    }

    // eat any unneeded trailing zeros
    while (fractionPart.length > minimumFractionDigits && fractionPart.slice(-1) === '0') {
      fractionPart = fractionPart.slice(0, -1);
    }

    // left-truncate any integer digits over the maximum length
    var maximumIntegerDigits = this.maximumIntegerDigits();
    if (maximumIntegerDigits !== undefined && maximumIntegerDigits !== null && integerPart.length > maximumIntegerDigits) {
      integerPart = integerPart.slice(-maximumIntegerDigits);
    }

    // add the decimal separator
    if (fractionPart.length > 0 || this.alwaysShowsDecimalSeparator()) {
      fractionPart = this.decimalSeparator() + fractionPart;
    }

    if (this.usesGroupingSeparator()) {
      var integerPartWithGroupingSeparators = '';
      var copiedCharacterCount = 0;

      for (var i = integerPart.length - 1; i >= 0; i--) {
        if (copiedCharacterCount > 0 && copiedCharacterCount % this.groupingSize() === 0) {
          integerPartWithGroupingSeparators = this.groupingSeparator() + integerPartWithGroupingSeparators;
        }
        integerPartWithGroupingSeparators = integerPart[i] + integerPartWithGroupingSeparators;
        copiedCharacterCount++;
      }
      integerPart = integerPartWithGroupingSeparators;
    }

    var result = integerPart + fractionPart;

    // surround with the appropriate prefix and suffix
    if (negative) {
      result = this.negativePrefix() + result + this.negativeSuffix();
    } else {
      result = this.positivePrefix() + result + this.positiveSuffix();
    }
    return result;
  }

  /**
   * @param {number} number
   * @returns {number}
   * @private
   */
  _round(number) {
    return round(number, this.maximumFractionDigits(), this.roundingMode());
  }

  /**
   * Will call parse on the formatter.
   * @param {string} string
   * @param {function(string)} error
   * @returns {string} returns value with delimiters removed
   */
  parse(string, error) {
    var result;
    var positivePrefix = this.positivePrefix();
    var negativePrefix = this.negativePrefix();
    var positiveSuffix = this.positiveSuffix();
    var negativeSuffix = this.negativeSuffix();

    if (this.isLenient()) {
      string = string.replace(/\s/g, '');
      positivePrefix = trim(positivePrefix);
      negativePrefix = trim(negativePrefix);
      positiveSuffix = trim(positiveSuffix);
      negativeSuffix = trim(negativeSuffix);
    }

    var zeroSymbol;
    var nullSymbol;
    var notANumberSymbol;
    var positiveInfinitySymbol;
    var negativeInfinitySymbol;
    var innerString;

    if ((zeroSymbol = this.zeroSymbol()) !== undefined && zeroSymbol !== null && string === zeroSymbol) {
      result = 0;
    } else if ((nullSymbol = this.nullSymbol()) !== undefined && nullSymbol !== null && string === nullSymbol) {
      result = null;
    } else if ((notANumberSymbol = this.notANumberSymbol()) !== undefined && notANumberSymbol !== null && string === notANumberSymbol) {
      result = NaN;
    } else if ((positiveInfinitySymbol = this.positiveInfinitySymbol()) !== undefined && positiveInfinitySymbol !== null && string === positiveInfinitySymbol) {
      result = Infinity;
    } else if ((negativeInfinitySymbol = this.negativeInfinitySymbol()) !== undefined && negativeInfinitySymbol !== null && string === negativeInfinitySymbol) {
      result = -Infinity;
    } else {
      var hasNegativePrefix = startsWith(negativePrefix, string);
      var hasNegativeSuffix = endsWith(negativeSuffix, string);
      if (hasNegativePrefix && (this.isLenient() || hasNegativeSuffix)) {
        innerString = string.slice(negativePrefix.length);
        if (hasNegativeSuffix) {
          innerString = innerString.slice(0, innerString.length - negativeSuffix.length);
        }
        result = this._parseAbsoluteValue(innerString, error);
        if (result !== undefined && result !== null) {
          result *= -1;
        }
      } else {
        var hasPositivePrefix = startsWith(positivePrefix, string);
        var hasPositiveSuffix = endsWith(positiveSuffix, string);
        if (this.isLenient() || (hasPositivePrefix && hasPositiveSuffix)) {
          innerString = string;
          if (hasPositivePrefix) {
            innerString = innerString.slice(positivePrefix.length);
          }
          if (hasPositiveSuffix) {
            innerString = innerString.slice(0, innerString.length - positiveSuffix.length);
          }
          result = this._parseAbsoluteValue(innerString, error);
        } else {
          if (typeof error === 'function') {
            error('number-formatter.invalid-format');
          }
          return null;
        }
      }
    }

    if (result !== undefined && result !== null) {
      var minimum = this.minimum();
      if (minimum !== undefined && minimum !== null && result < minimum) {
        if (typeof error === 'function') {
          error('number-formatter.out-of-bounds.below-minimum');
        }
        return null;
      }

      var maximum = this.maximum();
      if (maximum !== undefined && maximum !== null && result > maximum) {
        if (typeof error === 'function') {
          error('number-formatter.out-of-bounds.above-maximum');
        }
        return null;
      }
    }

    return result;
  }

  /**
   * @param {string} string
   * @param {function(string)} error
   * @returns {?Number} returns value with delimiters removed
   * @private
   */
  _parseAbsoluteValue(string, error) {
    var number;
    if (string.length === 0) {
      if (typeof error === 'function') {
        error('number-formatter.invalid-format');
      }
      return null;
    }

    var parts = string.split(this.decimalSeparator());
    if (parts.length > 2) {
      if (typeof error === 'function') {
        error('number-formatter.invalid-format');
      }
      return null;
    }

    var integerPart = parts[0];
    var fractionPart = parts[1] || '';

    if (this.usesGroupingSeparator()) {
      var groupingSize = this.groupingSize();
      var groupParts = integerPart.split(this.groupingSeparator());

      if (!this.isLenient()) {
        if (groupParts.length > 1) {
          // disallow 1000,000
          if (groupParts[0].length > groupingSize) {
            if (typeof error === 'function') {
              error('number-formatter.invalid-format.grouping-size');
            }
            return null;
          }

          // disallow 1,00
          var groupPartsTail = groupParts.slice(1);
          for (var i = 0, l = groupPartsTail.length; i < l; i++) {
            if (groupPartsTail[i].length !== groupingSize) {
              if (typeof error === 'function') {
                error('number-formatter.invalid-format.grouping-size');
              }
              return null;
            }
          }
        }
      }

      // remove grouping separators
      integerPart = groupParts.join('');
    }

    if (!isDigits(integerPart) || !isDigits(fractionPart)) {
      if (typeof error === 'function') {
        error('number-formatter.invalid-format');
      }
      return null;
    }

    var exponent = this.exponent();
    if (exponent !== undefined && exponent !== null) {
      var shifted = shiftParts([false, integerPart, fractionPart], -exponent);
      integerPart = shifted[1];
      fractionPart = shifted[2];
    }

    number = Number(integerPart) + Number('.' + (fractionPart || '0'));

    if (!this.allowsFloats() && number !== ~~number) {
      if (typeof error === 'function') {
        error('number-formatter.floats-not-allowed');
      }
      return null;
    }

    return number;
  }

  /**
   * Gets defaults.
   *
   * @returns {Array}
   * @private
   */
  _currencyDefaults() {
    var result = {};

    forEach(CurrencyDefaults['default'], function(value, key) {
      result[key] = value;
    });

    forEach(CurrencyDefaults[this.currencyCode()], function(value, key) {
      result[key] = value;
    });

    return result;
  }

  /**
   * Gets defaults.
   *
   * @returns {Array}
   * @private
   */
  _regionDefaults() {
    var result = {};

    forEach(RegionDefaults.default, function(value, key) {
      result[key] = value;
    });

    forEach(RegionDefaults[this.countryCode()], function(value, key) {
      result[key] = value;
    });

    return result;
  }

  /**
   * Gets defaults.
   *
   * @returns {Array}
   * @private
   */
  _localeDefaults() {
    var locale      = this.locale();
    var countryCode = this.countryCode();
    var lang = splitLocaleComponents(locale).lang;
    var result = {};

    var defaultFallbacks = [
      RegionDefaults.default,
      LocaleDefaults.default,
      RegionDefaults[countryCode],  // CA
      LocaleDefaults[lang],         // fr
      LocaleDefaults[locale]        // fr-CA
    ];

    forEach(defaultFallbacks, function(defaults) {
      forEach(defaults, function(value, key) {
        result[key] = value;
      });
    });

    return result;
  }
}

/**
 * Defaults
 */

/** @private */
NumberFormatter.prototype._allowsFloats = null;
/** @private */
NumberFormatter.prototype._alwaysShowsDecimalSeparator = null;
/** @private */
NumberFormatter.prototype._countryCode = null;
/** @private */
NumberFormatter.prototype._currencyCode = null;
/** @private */
NumberFormatter.prototype._exponent = null;
/** @private */
NumberFormatter.prototype._groupingSeparator = null;
/** @private */
NumberFormatter.prototype._groupingSize = null;
/** @private */
NumberFormatter.prototype._lenient = false;
/** @private */
NumberFormatter.prototype._locale = null;
/** @private */
NumberFormatter.prototype._internationalCurrencySymbol = null;
/** @private */
NumberFormatter.prototype._maximumFractionDigits = null;
/** @private */
NumberFormatter.prototype._minimumFractionDigits = null;
/** @private */
NumberFormatter.prototype._maximumIntegerDigits = null;
/** @private */
NumberFormatter.prototype._minimumIntegerDigits = null;
/** @private */
NumberFormatter.prototype._maximum = null;
/** @private */
NumberFormatter.prototype._minimum = null;
/** @private */
NumberFormatter.prototype._notANumberSymbol = null;
/** @private */
NumberFormatter.prototype._nullSymbol = null;
/** @private */
NumberFormatter.prototype._numberStyle = null;
/** @private */
NumberFormatter.prototype._roundingMode = null;
/** @private */
NumberFormatter.prototype._usesGroupingSeparator = null;
/** @private */
NumberFormatter.prototype._zeroSymbol = null;

/**
 * Aliases
 */

NumberFormatter.prototype.stringFromNumber = NumberFormatter.prototype.format;
NumberFormatter.prototype.numberFromString = NumberFormatter.prototype.parse;

NumberFormatter.Rounding = modes;

/**
 * @enum {number}
 * @readonly
 */
NumberFormatter.Style = {
  NONE: NONE,
  CURRENCY: CURRENCY,
  PERCENT: PERCENT
};

/**
 * @namespace StyleDefaults
 */
var StyleDefaults = {
  NONE: {
    usesGroupingSeparator: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    minimumIntegerDigits: 0
  },
  PERCENT: {
    usesGroupingSeparator: false,
    exponent: 2,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    minimumIntegerDigits: 1,
    positiveSuffix: formatter => formatter.percentSymbol(),
    negativeSuffix: formatter => formatter.percentSymbol()
  },
  CURRENCY: {
    positivePrefix: function(formatter, locale) {
      return get(locale, 'positiveCurrencyPrefix', formatter, this);
    },
    positiveSuffix: function(formatter, locale) {
      return get(locale, 'positiveCurrencySuffix', formatter, this);
    },
    negativePrefix: function(formatter, locale) {
      return get(locale, 'negativeCurrencyPrefix', formatter, this);
    },
    negativeSuffix: function(formatter, locale) {
      return get(locale, 'negativeCurrencySuffix', formatter, this);
    }
  }
};

/**
 * @namespace LocaleDefaults
 */
var LocaleDefaults = {
  'default': {
    allowsFloats: true,
    alwaysShowsDecimalSeparator: false,
    decimalSeparator: '.',
    groupingSeparator: ',',
    groupingSize: 3,
    minusSign: '-',
    negativeInfinitySymbol: formatter => formatter.minusSign() + '∞',
    negativePrefix: formatter => formatter.minusSign(),
    negativeSuffix: '',
    notANumberSymbol: 'NaN',
    nullSymbol: '',
    percentSymbol: '%',
    positiveInfinitySymbol: formatter => formatter.plusSign() + '∞',
    positivePrefix: '',
    positiveSuffix: '',
    plusSign: '+',
    roundingMode: NumberFormatter.Rounding.HALF_EVEN,
    positiveCurrencyPrefix: formatter => formatter.currencySymbol(),
    positiveCurrencySuffix: '',
    negativeCurrencyPrefix: formatter => '(' + formatter.currencySymbol(),
    negativeCurrencySuffix: ')'
  },
  fr: {
    decimalSeparator: ',',
    groupingSeparator: ' ',
    percentSymbol: ' %',
    positiveCurrencyPrefix: '',
    positiveCurrencySuffix: formatter => ' ' + formatter.currencySymbol(),
    negativeCurrencyPrefix: '(',
    negativeCurrencySuffix: formatter => ' ' + formatter.currencySymbol() + ')'
  },
  ja: {
    negativeCurrencyPrefix: formatter => formatter.minusSign() + formatter.currencySymbol(),
    negativeCurrencySuffix: ''
  },
  'en-GB': {
    negativeCurrencyPrefix: formatter => formatter.minusSign() + formatter.currencySymbol(),
    negativeCurrencySuffix: ''
  }
};

/**
 * @namespace RegionDefaults
 */
var RegionDefaults = {
  CA: {
    currencyCode: 'CAD'
  },
  DE: {
    currencyCode: 'EUR'
  },
  ES: {
    currencyCode: 'EUR'
  },
  FR: {
    currencyCode: 'EUR'
  },
  GB: {
    currencyCode: 'GBP'
  },
  JP: {
    currencyCode: 'JPY'
  },
  US: {
    currencyCode: 'USD'
  }
};

/**
 * @namespace CurrencyDefaults
 */
var CurrencyDefaults = {
  'default': {
    currencySymbol: formatter => formatter.currencyCode(),
    internationalCurrencySymbol: formatter => formatter.currencyCode(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    minimumIntegerDigits: 1,
    usesGroupingSeparator: true
  },
  CAD: {
    currencySymbol: '$',
    internationalCurrencySymbol: 'CA$'
  },
  EUR: {
    currencySymbol: '€'
  },
  GBP: {
    currencySymbol: '£',
    internationalCurrencySymbol: 'GB£'
  },
  JPY: {
    currencySymbol: '¥',
    internationalCurrencySymbol: 'JP¥',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  USD: {
    currencySymbol: '$',
    internationalCurrencySymbol: 'US$'
  }
};

export default NumberFormatter;
