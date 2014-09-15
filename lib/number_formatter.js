/*! jshint esnext:true, undef:true, unused:true */
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
 * @function splitLocaleComponents
 *
 * @param {String} locale
 * @return {Object} {lang: lang, country: country}
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
 * - extends [Formatter](formatter.md)
 *
 * @class NumberFormatter
 * @extends Formatter
 * @public
 */
class NumberFormatter extends Formatter {
  /**
   * @constructor
   * @public
   */
  constructor() {
    super();
    this._locale = 'en';
    this.setNumberStyle(NONE);
  }

  /**
   * @method allowsFloats
   *
   * Gets whether this formatter will parse float number values. This value does
   * not apply to formatting. To prevent formatting floats, set
   * maximumFractionDigits to 0.
   *
   * @return {Boolean}
   * @public
   */
  allowsFloats() {
    return this._get('allowsFloats');
  }

  /**
   * @method setAllowsFloats
   *
   * Sets whether this formatter will parse float number values.
   *
   * @param {Boolean} allowsFloats
   * @return {NumberFormatter}
   * @public
   */
  setAllowsFloats(allowsFloats) {
    this._allowsFloats = allowsFloats;
    return this;
  }

  /**
   * @method alwaysShowsDecimalSeparator
   *
   * Gets whether this formatter should show the decimal separator.
   *
   * @return {Boolean}
   * @public
   */
  alwaysShowsDecimalSeparator() {
    return this._get('alwaysShowsDecimalSeparator');
  }

  /**
   * @method setAlwaysShowsDecimalSeparator
   *
   * Sets whether this formatter will show the decimal separator.
   *
   * @param {Boolean} alwaysShowsDecimalSeparator
   * @return {NumberFormatter}
   * @public
   */
  setAlwaysShowsDecimalSeparator(alwaysShowsDecimalSeparator) {
    this._alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator;
    return this;
  }

  /**
   * @method countryCode
   *
   * Gets the country code for formatter.
   *
   * @return {String}
   * @public
   */
  countryCode() {
    return this._countryCode || DEFAULT_COUNTRY;
  }

  /**
   * @method setCountryCode
   *
   * Sets the country code for formatter.
   *
   * @param {String} countryCode
   * @return {NumberFormatter}
   * @public
   */
  setCountryCode(countryCode) {
    this._countryCode = countryCode;
    return this;
  }

  /**
   * @method currencyCode
   *
   * Gets the currency code for formatter.
   *
   * @return {String}
   * @public
   */
  currencyCode() {
    return this._get('currencyCode');
  }

  /**
   * @method setCurrencyCode
   *
   * Sets the currency code for formatter.
   *
   * @param {String} currencyCode
   * @return {NumberFormatter}
   * @public
   */
  setCurrencyCode(currencyCode) {
    this._currencyCode = currencyCode;
    return this;
  }

  /**
   * @method currencySymbol
   *
   * Gets the currency symbol for formatter.
   *
   * @return {String}
   * @public
   */
  currencySymbol() {
    if (this._shouldShowNativeCurrencySymbol()) {
      return this._get('currencySymbol');
    } else {
      return this._get('internationalCurrencySymbol');
    }
  }

  /**
   * @method setCurrencySymbol
   *
   * Sets the currency symbol for formatter.
   *
   * @param {String} currencySymbol
   * @return {NumberFormatter}
   * @public
   */
  setCurrencySymbol(currencySymbol) {
    this._currencySymbol = currencySymbol;
    return this;
  }

  /**
   * @method _shouldShowNativeCurrencySymbol
   *
   * @return {Boolean}
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
   * @method decimalSeparator
   *
   * Gets the decimal spearator for formatter.
   *
   * @return {String}
   * @public
   */
  decimalSeparator() {
    return this._get('decimalSeparator');
  }

  /**
   * @method setDecimalSeparator
   *
   * Sets the decimal spearator for formatter.
   *
   * @param {String} decimalSeparator
   * @return {NumberFormatter}
   * @public
   */
  setDecimalSeparator(decimalSeparator) {
    this._decimalSeparator = decimalSeparator;
    return this;
  }

  /**
   * @method groupingSeparator
   *
   * @return {String}
   * @public
   */
  groupingSeparator() {
    return this._get('groupingSeparator');
  }

  /**
   * @method setGroupingSeparator
   *
   * @param {String} groupingSeparator
   * @return {NumberFormatter}
   * @public
   */
  setGroupingSeparator(groupingSeparator) {
    this._groupingSeparator = groupingSeparator;
    return this;
  }

  /**
   * @method groupingSize
   *
   * Gets the grouping size for formatter.
   *
   * @return {Number}
   * @public
   */
  groupingSize() {
    return this._get('groupingSize');
  }

  /**
   * @method setGroupingSize
   *
   * @param {Number} groupingSize
   * @return {NumberFormatter}
   * @public
   */
  setGroupingSize(groupingSize) {
    this._groupingSize = groupingSize;
    return this;
  }

  /**
   * @method internationalCurrencySymbol
   *
   * @return {String}
   * @public
   */
  internationalCurrencySymbol() {
    return this._get('internationalCurrencySymbol');
  }

  /**
   * @method setInternationalCurrencySymbol
   *
   * @param {String} internationalCurrencySymbol
   * @return {NumberFormatter}
   * @public
   */
  setInternationalCurrencySymbol(internationalCurrencySymbol) {
    this._internationalCurrencySymbol = internationalCurrencySymbol;
    return this;
  }

  /**
   * @method isLenient
   *
   * @return {Boolean}
   * @public
   */
  isLenient() {
    return this._lenient;
  }

  /**
   * @method setLenient
   *
   * @param {Boolean} lenient
   * @return {NumberFormatter}
   * @public
   */
  setLenient(lenient) {
    this._lenient = lenient;
    return this;
  }

  /**
   * @method locale
   *
   * @return {String}
   * @public
   */
  locale() {
    return this._locale || DEFAULT_LOCALE;
  }

  /**
   * @method setLocale
   *
   * @param {String} locale
   * @return {NumberFormatter}
   * @public
   */
  setLocale(locale) {
    this._locale = locale;
    return this;
  }

  /**
   * @method maximum
   *
   * @return {Number}
   * @public
   */
  maximum() {
    return this._maximum;
  }

  /**
   * @method setMaximum
   *
   * @param {Number} max
   * @return {NumberFormatter}
   * @public
   */
  setMaximum(max) {
    this._maximum = max;
    return this;
  }

  /**
   * @method minimum
   *
   * @return {Number}
   * @public
   */
  minimum() {
    return this._minimum;
  }

  /**
   * @method setMinimum
   *
   * @param {Number} min
   * @return {NumberFormatter}
   * @public
   */
  setMinimum(min) {
    this._minimum = min;
    return this;
  }

  /**
   * @method maximumFractionDigits
   *
   * @return {Number}
   * @public
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
   * @method setMaximumFractionDigits
   *
   * @param {Number} maximumFractionDigits
   * @return {NumberFormatter}
   * @public
   */
  setMaximumFractionDigits(maximumFractionDigits) {
    this._maximumFractionDigits = maximumFractionDigits;
    return this;
  }

  /**
   * @method minimumFractionDigits
   *
   * @return {Number}
   * @public
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
   * @method setMinimumFractionDigits
   *
   * @param {Number} minimumFractionDigits
   * @return {NumberFormatter}
   * @public
   */
  setMinimumFractionDigits(minimumFractionDigits) {
    this._minimumFractionDigits = minimumFractionDigits;
    return this;
  }

  /**
   * @method maximumIntegerDigits
   *
   * @return {Number}
   * @public
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
   * @method setMaximumIntegerDigits
   *
   * @param {Number} maximumIntegerDigits
   * @return {NumberFormatter}
   * @public
   */
  setMaximumIntegerDigits(maximumIntegerDigits) {
    this._maximumIntegerDigits = maximumIntegerDigits;
    return this;
  }

  /**
   * @method minimumIntegerDigits
   *
   * @return {Number}
   * @public
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
   * @method setMinimumIntegerDigits
   *
   * @param {Number} minimumIntegerDigits
   * @return {NumberFormatter}
   * @public
   */
  setMinimumIntegerDigits(minimumIntegerDigits) {
    this._minimumIntegerDigits = minimumIntegerDigits;
    return this;
  }

  /**
   * @method exponent
   *
   * @return {Number}
   * @public
   */
  exponent() {
    return this._get('exponent');
  }

  /**
   * @method setExponent
   *
   * @param {Number} exponent
   * @return {NumberFormatter}
   * @public
   */
  setExponent(exponent) {
    this._exponent = exponent;
    return this;
  }

  /**
   * @method negativeInfinitySymbol
   *
   * @return {Number}
   * @public
   */
  negativeInfinitySymbol() {
    return this._get('negativeInfinitySymbol');
  }

  /**
   * @method setNegativeInfinitySymbol
   *
   * @param {Number} negativeInfinitySymbol
   * @return {NumberFormatter}
   * @public
   */
  setNegativeInfinitySymbol(negativeInfinitySymbol) {
    this._negativeInfinitySymbol = negativeInfinitySymbol;
    return this;
  }

  /**
   * @method negativePrefix
   *
   * @return {String}
   * @public
   */
  negativePrefix() {
    return this._get('negativePrefix');
  }

  /**
   * @method setNegativePrefix
   *
   * @param {String} prefix
   * @return {NumberFormatter}
   * @public
   */
  setNegativePrefix(prefix) {
    this._negativePrefix = prefix;
    return this;
  }

  /**
   * @method negativeSuffix
   *
   * @return {String}
   * @public
   */
  negativeSuffix() {
    return this._get('negativeSuffix');
  }

  /**
   * @method setNegativeSuffix
   *
   * @param {String} prefix
   * @return {NumberFormatter}
   * @public
   */
  setNegativeSuffix(prefix) {
    this._negativeSuffix = prefix;
    return this;
  }

  /**
   * @method notANumberSymbol
   *
   * @return {String}
   * @public
   */
  notANumberSymbol() {
    return this._get('notANumberSymbol');
  }

  /**
   * @method setNotANumberSymbol
   *
   * @param {String} notANumberSymbol
   * @return {NumberFormatter}
   * @public
   */
  setNotANumberSymbol(notANumberSymbol) {
    this._notANumberSymbol = notANumberSymbol;
    return this;
  }

  /**
   * @method nullSymbol
   *
   * @return {String}
   * @public
   */
  nullSymbol() {
    return this._get('nullSymbol');
  }

  /**
   * @method setNullSymbol
   *
   * @param {String} nullSymbol
   * @return {NumberFormatter}
   * @public
   */
  setNullSymbol(nullSymbol) {
    this._nullSymbol = nullSymbol;
    return this;
  }

  /**
   * @method numberStyle
   *
   * @return {String}
   * @public
   */
  numberStyle() {
    return this._numberStyle;
  }

  /**
   * @method setNumberStyle
   *
   * @param {String} numberStyle
   * @return {NumberFormatter}
   * @public
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
   * @method percentSymbol
   *
   * @return {String}
   * @public
   */
  percentSymbol() {
    return this._get('percentSymbol');
  }

  /**
   * @method setPercentSymbol
   *
   * @param {String} percentSymbol
   * @return {NumberFormatter}
   * @public
   */
  setPercentSymbol(percentSymbol) {
    this._percentSymbol = percentSymbol;
    return this;
  }

  /**
   * @method positiveInfinitySymbol
   *
   * @return {String}
   * @public
   */
  positiveInfinitySymbol() {
    return this._get('positiveInfinitySymbol');
  }

  /**
   * @method setPositiveInfinitySymbol
   *
   * @param {String} positiveInfinitySymbol
   * @return {NumberFormatter}
   * @public
   */
  setPositiveInfinitySymbol(positiveInfinitySymbol) {
    this._positiveInfinitySymbol = positiveInfinitySymbol;
    return this;
  }

  /**
   * @method positivePrefix
   *
   * @return {String}
   * @public
   */
  positivePrefix() {
    return this._get('positivePrefix');
  }

  /**
   * @method setPositivePrefix
   *
   * @param {String} prefix
   * @return {NumberFormatter}
   * @public
   */
  setPositivePrefix(prefix) {
    this._positivePrefix = prefix;
    return this;
  }

  /**
   * @method positiveSuffix
   *
   * @return {String}
   * @public
   */
  positiveSuffix() {
    return this._get('positiveSuffix');
  }

  /**
   * @method setPositiveSuffix
   *
   * @param {String} prefix
   * @return {NumberFormatter}
   * @public
   */
  setPositiveSuffix(prefix) {
    this._positiveSuffix = prefix;
    return this;
  }

  /**
   * @method roundingMode
   *
   * @return {Function}
   * @public
   */
  roundingMode() {
    return this._get('roundingMode');
  }

  /**
   * @method setRoundingMode
   *
   * @param {Function} roundingMode
   * @return {NumberFormatter}
   * @public
   */
  setRoundingMode(roundingMode) {
    this._roundingMode = roundingMode;
    return this;
  }

  /**
   * @method usesGroupingSeparator
   *
   * @return {Boolean}
   * @public
   */
  usesGroupingSeparator() {
    return this._get('usesGroupingSeparator');
  }

  /**
   * @method setUsesGroupingSeparator
   *
   * @param {Boolean} usesGroupingSeparator
   * @return {NumberFormatter}
   * @public
   */
  setUsesGroupingSeparator(usesGroupingSeparator) {
    this._usesGroupingSeparator = usesGroupingSeparator;
    return this;
  }

  /**
   * @method zeroSymbol
   *
   * @return {String}
   * @public
   */
  zeroSymbol() {
    return this._get('zeroSymbol');
  }

  /**
   * @method setZeroSymbol
   *
   * @param {String} zeroSymbol
   * @return {NumberFormatter}
   * @public
   */
  setZeroSymbol(zeroSymbol) {
    this._zeroSymbol = zeroSymbol;
    return this;
  }

  /**
   * @method _get
   *
   * @param {String} attr
   * @return {*}
   * @public
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
   * @method format
   *
   * @param {Number} number
   * @return {String}
   * @public
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
   * @method _round
   *
   * @param {Number} number
   * @return {Number}
   * @private
   */
  _round(number) {
    return round(number, this.maximumFractionDigits(), this.roundingMode());
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
   * @method _parseAbsoluteValue
   *
   * @param {String} text
   * @param {Function(String)} error
   * @return {?Number} returns value with delimiters removed
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
   * @method _currencyDefaults
   *
   * Gets defaults.
   *
   * @return {Array}
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
   * @method _regionDefaults
   *
   * Gets defaults.
   *
   * @return {Array}
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
   * @method _localeDefaults
   *
   * Gets defaults.
   *
   * @return {Array}
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

NumberFormatter.prototype._allowsFloats = null;
NumberFormatter.prototype._alwaysShowsDecimalSeparator = null;
NumberFormatter.prototype._countryCode = null;
NumberFormatter.prototype._currencyCode = null;
NumberFormatter.prototype._exponent = null;
NumberFormatter.prototype._groupingSeparator = null;
NumberFormatter.prototype._groupingSize = null;
NumberFormatter.prototype._lenient = false;
NumberFormatter.prototype._locale = null;
NumberFormatter.prototype._internationalCurrencySymbol = null;
NumberFormatter.prototype._maximumFractionDigits = null;
NumberFormatter.prototype._minimumFractionDigits = null;
NumberFormatter.prototype._maximumIntegerDigits = null;
NumberFormatter.prototype._minimumIntegerDigits = null;
NumberFormatter.prototype._maximum = null;
NumberFormatter.prototype._minimum = null;
NumberFormatter.prototype._notANumberSymbol = null;
NumberFormatter.prototype._nullSymbol = null;
NumberFormatter.prototype._numberStyle = null;
NumberFormatter.prototype._roundingMode = null;
NumberFormatter.prototype._usesGroupingSeparator = null;
NumberFormatter.prototype._zeroSymbol = null;

/**
 * Aliases
 */

NumberFormatter.prototype.stringFromNumber = NumberFormatter.prototype.format;
NumberFormatter.prototype.numberFromString = NumberFormatter.prototype.parse;
NumberFormatter.prototype.minusSign = NumberFormatter.prototype.negativePrefix;
NumberFormatter.prototype.setMinusSign = NumberFormatter.prototype.setNegativePrefix;
NumberFormatter.prototype.plusSign = NumberFormatter.prototype.positivePrefix;
NumberFormatter.prototype.setPlusSign = NumberFormatter.prototype.setPositivePrefix;

NumberFormatter.Rounding = modes;

/**
 * @enum {Number}
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
    negativeInfinitySymbol: '-∞',
    negativePrefix: '-',
    negativeSuffix: '',
    notANumberSymbol: 'NaN',
    nullSymbol: '',
    percentSymbol: '%',
    positiveInfinitySymbol: '+∞',
    positivePrefix: '',
    positiveSuffix: '',
    roundingMode: NumberFormatter.Rounding.HALF_EVEN,
    positiveCurrencyPrefix: formatter => formatter.currencySymbol(),
    positiveCurrencySuffix: '',
    negativeCurrencyPrefix: formatter => '(' + formatter.currencySymbol(),
    negativeCurrencySuffix: () => ')'
  },
  fr: {
    decimalSeparator: ',',
    groupingSeparator: ' ',
    percentSymbol: ' %',
    positiveCurrencyPrefix: '',
    positiveCurrencySuffix: formatter => ' ' + formatter.currencySymbol(),
    negativeCurrencyPrefix: () => '(',
    negativeCurrencySuffix: formatter => ' ' + formatter.currencySymbol() + ')'
  },
  ja: {
    negativeCurrencyPrefix: formatter => '-' + formatter.currencySymbol(),
    negativeCurrencySuffix: ''
  },
  'en-GB': {
    negativeCurrencyPrefix: formatter => '-' + formatter.currencySymbol(),
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
