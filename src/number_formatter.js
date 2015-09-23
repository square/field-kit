import Formatter from './formatter';
import NumberFormatterSettingsFormatter from './number_formatter_settings_formatter';
import { isDigits, startsWith, endsWith, trim, forEach } from './utils';
import { modes, shiftParts, round } from 'stround';

// Style
const NONE = 0;
const CURRENCY = 1;
const PERCENT = 2;

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_COUNTRY = 'US';

/**
 * @param {string} locale
 * @returns {Object} {lang: lang, country: country}
 * @private
 */
function splitLocaleComponents(locale) {
  const match = locale.match(/^([a-z][a-z])(?:[-_]([a-z][a-z]))?$/i);
  if (match) {
    const lang = match[1] && match[1].toLowerCase();
    const country = match[2] && match[2].toLowerCase();
    return { lang, country };
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
    const value = object[key];
    if (typeof value === 'function') {
      return value(...args);
    } else {
      return value;
    }
  }
}

/**
 * @param {string} string
 * @param {string} currencySymbol
 * @return {string}
 * @private
 */
function replaceCurrencySymbol(string, currencySymbol) {
  return string.replace(/¤/g, currencySymbol);
}

/**
 * @param {string} string
 * @param {string} plusSign
 * @returns {string}
 * @private
 */
function replacePlusSign(string, plusSign) {
  return string.replace(/\+/g, plusSign);
}
/**
 * @param {string} string
 * @param {string} minusSign
 * @returns {string}
 * @private
 */
function replaceMinusSign(string, minusSign) {
  return string.replace(/-/g, minusSign);
}

/**
 * Formats and parses numbers. There are many configuration options for how to
 * format numbers as strings, but for many users simply adjusting the
 * {@link NumberFormatter#numberStyle}, {@link NumberFormatter#locale},
 * {@link NumberFormatter#currencyCode}, and {@link NumberFormatter#countryCode}
 * values will be sufficient. NumberFormatter natively understands how to
 * format numbers, currencies, and percentages for a variety of locales.
 *
 * @example
 *
 *   // Configure a NumberFormatter to display currencies.
 *   var f = new FieldKit.NumberFormatter();
 *   f.setNumberStyle(FieldKit.NumberFormatter.Style.CURRENCY);
 *
 *   // Configure the current locale info.
 *   f.setLocale('en-US');
 *   f.setCountryCode('US');
 *   f.setCurrencyCode('USD');
 *
 *   // Showing USD in US uses abbreviated currency.
 *   f.format(6.17);  // '$6.17'
 *
 *   // Showing CAD in US uses fully-qualified currency.
 *   f.setCurrencyCode('CAD');
 *   f.format(6.17);  // 'CA$6.17'
 *
 *   // Showing CAD in CA again uses abbreviated currency.
 *   f.setLocale('en-CA');
 *   f.setCountryCode('CA');
 *   f.format(6.17);  // '$6.17'
 *
 *   // Showing CAD in CA to a French speaker uses correct formatting.
 *   f.setLocale('fr-CA');
 *   f.format(6.17);  // '6,17 $'
 *
 *   // You may customize the behavior of NumberFormatter to achieve whatever
 *   // number formatting you need using the setter methods for the various
 *   // settings, or you can use the {@link NumberFormatter#positiveFormat} and
 *   // {@link NumberFormatter#negativeFormat} shorthand templates.
 *
 *   var f = new FieldKit.NumberFormatter();
 *
 *   // Using this template string…
 *   f.setPositiveFormat('¤#0.00');
 *
 *   // …is equivalent to this:
 *   f.setPositivePrefix('¤');
 *   f.setPositiveSuffix('');
 *   f.setMinimumIntegerDigits(1);
 *   f.setMinimumFractionDigits(2);
 *   f.setMaximumFractionDigits(2);
 *
 *   // And you can determine what the template string is for however you've
 *   // configured the NumberFormatter:
 *   f.setUsesGroupingSeparator(true);
 *   f.setGroupingSize(2);
 *   f.positiveFormat(); // '¤#,#0.00'
 *
 * @extends Formatter
 */
class NumberFormatter extends Formatter {
  constructor() {
    super();
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
    let regionDefaultCurrencyCode = this._regionDefaults().currencyCode;
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
   * Gets the locale identifier for which this formatter is currently
   * configured to format strings. This setting controls default settings such
   * as the grouping separator character, decimal separator character, placement
   * of currency and percent symbols, etc.
   *
   * @returns {string}
   */
  locale() {
    return this._locale || DEFAULT_LOCALE;
  }

  /**
   * Sets the locale identifier used for default settings values.
   *
   * @see {@link NumberFormatter#locale}
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
    let result = this._get('maximumFractionDigits');
    const minimumFractionDigits = this._minimumFractionDigits;
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
    let result = this._get('minimumFractionDigits');
    const maximumFractionDigits = this._maximumFractionDigits;
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
    let result = this._get('maximumIntegerDigits');
    const minimumIntegerDigits = this._minimumIntegerDigits;
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
    let result = this._get('minimumIntegerDigits');
    const maximumIntegerDigits = this._maximumIntegerDigits;
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
   * Gets the negative number format string for the current settings. For
   * example, changing `minimumFractionDigits` from 0 to 3 would change this
   * value from "-#" to "-#.000".
   *
   * @return {string}
   */
  negativeFormat() {
    return this.numberFormatFormatter().format({
      alwaysShowsDecimalSeparator: this.alwaysShowsDecimalSeparator(),
      groupingSize: this.groupingSize(),
      maximumFractionDigits: this.maximumFractionDigits(),
      minimumFractionDigits: this.minimumFractionDigits(),
      minimumIntegerDigits: this.minimumIntegerDigits(),
      prefix: this._get('negativePrefix'),
      suffix: this._get('negativeSuffix'),
      usesGroupingSeparator: this.usesGroupingSeparator()
    });
  }

  /**
   * Configures this number formatter according to the given format string.
   * For most usages you should simply use
   * {@link NumberFormatter#setPositiveFormat} and configure the negative
   * prefix and suffix separately.
   *
   * @param negativeFormat
   */
  setNegativeFormat(negativeFormat) {
    const settings = this.numberFormatFormatter().parse(negativeFormat);
    this.setNegativePrefix(settings.prefix);
    this.setNegativeSuffix(settings.suffix);
    this.setGroupingSize(settings.groupingSize);
    this.setMaximumFractionDigits(settings.maximumFractionDigits);
    this.setMinimumFractionDigits(settings.minimumFractionDigits);
    this.setMinimumIntegerDigits(settings.minimumIntegerDigits);
    this.setUsesGroupingSeparator(settings.usesGroupingSeparator);
  }

  /**
   * @returns {string}
   */
  negativeInfinitySymbol() {
    return this._get('negativeInfinitySymbol');
  }

  /**
   * @param {string} negativeInfinitySymbol
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
    return replaceCurrencySymbol(
      replaceMinusSign(
        this._get('negativePrefix'),
        this._get('minusSign')
      ),
      this.currencySymbol()
    );
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
    return replaceCurrencySymbol(
      replaceMinusSign(
        this._get('negativeSuffix'),
        this._get('minusSign')
      ),
      this.currencySymbol()
    );
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
   * @return {NumberFormatterSettingsFormatter}
   * @private
   */
  numberFormatFormatter() {
    if (!this._numberFormatFormatter) {
      this._numberFormatFormatter = new NumberFormatterSettingsFormatter();
    }
    return this._numberFormatFormatter;
  }

  /**
   * Gets the number style used to configure various default setting values.
   *
   * @returns {NumberFormatter.Style}
   */
  numberStyle() {
    return this._numberStyle;
  }

  /**
   * Sets the number style used to configure various default setting values.
   *
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

  /**
   * Gets the positive number format string for the current settings. For
   * example, changing `minimumFractionDigits` from 0 to 3 would change this
   * value from "#" to "#.000".
   *
   * @return {string}
   */
  positiveFormat() {
    return this.numberFormatFormatter().format({
      alwaysShowsDecimalSeparator: this.alwaysShowsDecimalSeparator(),
      groupingSize: this.groupingSize(),
      maximumFractionDigits: this.maximumFractionDigits(),
      minimumFractionDigits: this.minimumFractionDigits(),
      minimumIntegerDigits: this.minimumIntegerDigits(),
      prefix: this._get('positivePrefix'),
      suffix: this._get('positiveSuffix'),
      usesGroupingSeparator: this.usesGroupingSeparator()
    });
  }

  /**
   * Configures this number formatter according to the given format string.
   *
   * @example
   *
   *   // Use '0' for padding, '.' for decimal separator.
   *   formatter.setPositiveFormat('00.000');
   *   formatter.format(2);     // '02.000'
   *   formatter.format(-5.03); // '-05.030'
   *   formatter.setLocale('fr-FR');
   *   formatter.format(2);     // '02,000'
   *
   *   // Use '#' for maximum fraction digits.
   *   formatter.setPositiveFormat('#.##');
   *   formatter.format(3.456); // '3.46'
   *
   *   // Use '¤' as the currency placeholder.
   *   formatter.setPositiveFormat('¤#0.00');
   *   formatter.format(1.23); // '$1.23'
   *   formatter.setCurrencyCode('JPY');
   *   formatter.format(81);   // 'JP¥81.00'
   *   formatter.setLocale('jp-JP');
   *   formatter.format(7);   // '¥7.00'
   *
   *   // Use ',' for grouping separator placement.
   *   formatter.setPositiveFormat('#,##');
   *   formatter.format(123); // '1,23'
   *
   * @param positiveFormat
   */
  setPositiveFormat(positiveFormat) {
    const settings = this.numberFormatFormatter().parse(positiveFormat);
    this.setPositivePrefix(settings.prefix);
    this.setPositiveSuffix(settings.suffix);
    this.setGroupingSize(settings.groupingSize);
    this.setMaximumFractionDigits(settings.maximumFractionDigits);
    this.setMinimumFractionDigits(settings.minimumFractionDigits);
    this.setMinimumIntegerDigits(settings.minimumIntegerDigits);
    this.setUsesGroupingSeparator(settings.usesGroupingSeparator);
  }

  /**
   * @returns {string}
   */
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
    return replaceCurrencySymbol(
      replacePlusSign(
        this._get('positivePrefix'),
        this._get('plusSign')
      ),
      this.currencySymbol()
    );
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
    return replaceCurrencySymbol(
      replacePlusSign(
        this._get('positiveSuffix'),
        this._get('plusSign')
      ),
      this.currencySymbol()
    );
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
    let value = this['_' + attr];
    if (value !== null && value !== undefined) {
      return value;
    }
    const styleDefaults = this._styleDefaults;
    const localeDefaults = this._localeDefaults();
    const regionDefaults = this._regionDefaults();
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
   * Formats the given number as a string according to the settings applied to
   * this formatter. This may cause the number to be truncated, rounded, or
   * otherwise differ from what you might expect.
   *
   * @example
   *
   *   // By default no fraction digits are shown.
   *   var f = new FieldKit.NumberFormatter();
   *   f.format(Math.PI);  // '3'
   *
   *   // Let's format as a currency.
   *   f.setNumberStyle(FieldKit.NumberFormatter.Style.CURRENCY);
   *   f.format(Math.PI);  // '$3.14'
   *
   *   // Or as a percentage, which illustrates usage of {@link NumberFormatter#exponent}.
   *   f.setNumberStyle(FieldKit.NumberFormatter.Style.PERCENT);
   *   f.format(Math.PI);  // '314%'
   *
   *   // For the rest of the examples we'll go back to normal.
   *   f.setNumberStyle(FieldKit.NumberFormatter.Style.NONE);
   *
   *   // The default rounding mode is {@link NumberFormatter.Rounding.HALF_EVEN}.
   *   f.setMaximumFractionDigits(4);
   *   f.format(Math.PI);  // '3.1416'
   *
   *   // And we can change the rounding mode if we like.
   *   f.setRoundingMode(FieldKit.NumberFormatter.Rounding.FLOOR);
   *   f.format(Math.PI);  // '3.1415'
   *
   * @param {number} number
   * @returns {string}
   */
  format(number) {
    if (number === '') {
      return '';
    }

    const zeroSymbol = this.zeroSymbol();
    if (zeroSymbol !== undefined && zeroSymbol !== null && number === 0) {
      return zeroSymbol;
    }

    const nullSymbol = this.nullSymbol();
    if (nullSymbol !== undefined && nullSymbol !== null && number === null) {
      return nullSymbol;
    }

    const notANumberSymbol = this.notANumberSymbol();
    if (notANumberSymbol !== undefined && notANumberSymbol !== null && isNaN(number)) {
      return notANumberSymbol;
    }

    const positiveInfinitySymbol = this.positiveInfinitySymbol();
    if (positiveInfinitySymbol !== undefined && positiveInfinitySymbol !== null && number === Infinity) {
      return positiveInfinitySymbol;
    }

    const negativeInfinitySymbol = this.negativeInfinitySymbol();
    if (negativeInfinitySymbol !== undefined && negativeInfinitySymbol !== null && number === -Infinity) {
      return negativeInfinitySymbol;
    }

    let negative = number < 0;

    let parts = (''+Math.abs(number)).split('.');
    let integerPart = parts[0];
    let fractionPart = parts[1] || '';

    const exponent = this.exponent();
    if (exponent !== undefined && exponent !== null) {
      const shifted = shiftParts([negative, integerPart, fractionPart], exponent);
      negative = shifted[0];
      integerPart = shifted[1];
      fractionPart = shifted[2];
      while (integerPart[0] === '0') {
        integerPart = integerPart.slice(1);
      }
    }

    // round fraction part to the maximum length
    const maximumFractionDigits = this.maximumFractionDigits();
    if (fractionPart.length > maximumFractionDigits) {
      const unrounded = `${integerPart}.${fractionPart}`;
      let rounded = this._round(negative ? `-${unrounded}` : unrounded);
      if (rounded[0] === '-') {
        rounded = rounded.slice(1);
      }
      parts = rounded.split('.');
      integerPart = parts[0];
      fractionPart = parts[1] || '';
    }

    // right-pad fraction zeros up to the minimum length
    const minimumFractionDigits = this.minimumFractionDigits();
    while (fractionPart.length < minimumFractionDigits) {
      fractionPart += '0';
    }

    // left-pad integer zeros up to the minimum length
    const minimumIntegerDigits = this.minimumIntegerDigits();
    while (integerPart.length < minimumIntegerDigits) {
      integerPart = '0' + integerPart;
    }

    // eat any unneeded trailing zeros
    while (fractionPart.length > minimumFractionDigits && fractionPart.slice(-1) === '0') {
      fractionPart = fractionPart.slice(0, -1);
    }

    // left-truncate any integer digits over the maximum length
    const maximumIntegerDigits = this.maximumIntegerDigits();
    if (maximumIntegerDigits !== undefined && maximumIntegerDigits !== null && integerPart.length > maximumIntegerDigits) {
      integerPart = integerPart.slice(-maximumIntegerDigits);
    }

    // add the decimal separator
    if (fractionPart.length > 0 || this.alwaysShowsDecimalSeparator()) {
      fractionPart = this.decimalSeparator() + fractionPart;
    }

    if (this.usesGroupingSeparator()) {
      let integerPartWithGroupingSeparators = '';
      let copiedCharacterCount = 0;

      for (let i = integerPart.length - 1; i >= 0; i--) {
        if (copiedCharacterCount > 0 && copiedCharacterCount % this.groupingSize() === 0) {
          integerPartWithGroupingSeparators = this.groupingSeparator() + integerPartWithGroupingSeparators;
        }
        integerPartWithGroupingSeparators = integerPart[i] + integerPartWithGroupingSeparators;
        copiedCharacterCount++;
      }
      integerPart = integerPartWithGroupingSeparators;
    }

    let result = integerPart + fractionPart;

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
   * Parses the given string according to the current formatting settings.
   * When parsing values with a guaranteed regular format you can simply
   * configure the formatter correctly and call this method. However, when
   * dealing with human input it is often useful to configure
   * {@link NumberFormatter#isLenient} to be true, allowing more leeway in what
   * may be parsed as a valid number.
   *
   * @example
   *
   *   var f = new FieldKit.NumberFormatter();
   *   f.parse('89'); // 89
   *
   * @param {string} string
   * @param {function(string)} error
   * @returns {?number}
   */
  parse(string, error) {
    let result;
    let positivePrefix = this.positivePrefix();
    let negativePrefix = this.negativePrefix();
    let positiveSuffix = this.positiveSuffix();
    let negativeSuffix = this.negativeSuffix();

    if (this.isLenient()) {
      string = string.replace(/\s/g, '');
      positivePrefix = trim(positivePrefix);
      negativePrefix = trim(negativePrefix);
      positiveSuffix = trim(positiveSuffix);
      negativeSuffix = trim(negativeSuffix);
    }

    let zeroSymbol;
    let nullSymbol;
    let notANumberSymbol;
    let positiveInfinitySymbol;
    let negativeInfinitySymbol;
    let innerString;

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
      const hasNegativePrefix = startsWith(negativePrefix, string);
      const hasNegativeSuffix = endsWith(negativeSuffix, string);
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
        const hasPositivePrefix = startsWith(positivePrefix, string);
        const hasPositiveSuffix = endsWith(positiveSuffix, string);
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
      const minimum = this.minimum();
      if (minimum !== undefined && minimum !== null && result < minimum) {
        if (typeof error === 'function') {
          error('number-formatter.out-of-bounds.below-minimum');
        }
        return null;
      }

      const maximum = this.maximum();
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
   * @returns {?number} returns value with delimiters removed
   * @private
   */
  _parseAbsoluteValue(string, error) {
    let number;
    if (string.length === 0) {
      if (typeof error === 'function') {
        error('number-formatter.invalid-format');
      }
      return null;
    }

    const parts = string.split(this.decimalSeparator());
    if (parts.length > 2) {
      if (typeof error === 'function') {
        error('number-formatter.invalid-format');
      }
      return null;
    }

    let integerPart = parts[0];
    let fractionPart = parts[1] || '';

    if (this.usesGroupingSeparator()) {
      const groupingSize = this.groupingSize();
      const groupParts = integerPart.split(this.groupingSeparator());

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
          const groupPartsTail = groupParts.slice(1);
          for (let i = 0, l = groupPartsTail.length; i < l; i++) {
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

    const exponent = this.exponent();
    if (exponent !== undefined && exponent !== null) {
      const shifted = shiftParts([false, integerPart, fractionPart], -exponent);
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
    const result = {};

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
    const result = {};

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
    const locale = this.locale();
    const countryCode = this.countryCode();
    const lang = splitLocaleComponents(locale).lang;
    const result = {};

    const defaultFallbacks = [
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
const StyleDefaults = {
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
 * Contains the default values for various number formatter settings, including
 * per-locale overrides. Some of these characters will not be used as-is and
 * instead serve as placeholders:
 *
 *   "¤"  placeholder for `currencySymbol()`.
 *   "-"  placeholder for `minusSign()`.
 *   "+"  placeholder for `plusSign()`.
 *
 * @namespace LocaleDefaults
 */
const LocaleDefaults = {
  'default': {
    allowsFloats: true,
    alwaysShowsDecimalSeparator: false,
    decimalSeparator: '.',
    groupingSeparator: ',',
    groupingSize: 3,
    minusSign: '-',
    negativeInfinitySymbol: '-∞',
    negativePrefix: '-',
    negativeSuffix: '',
    notANumberSymbol: 'NaN',
    nullSymbol: '',
    percentSymbol: '%',
    positiveInfinitySymbol: '+∞',
    positivePrefix: '',
    positiveSuffix: '',
    plusSign: '+',
    roundingMode: NumberFormatter.Rounding.HALF_EVEN,
    positiveCurrencyPrefix: '¤',
    positiveCurrencySuffix: '',
    negativeCurrencyPrefix: '(¤',
    negativeCurrencySuffix: ')'
  },
  fr: {
    decimalSeparator: ',',
    groupingSeparator: ' ',
    percentSymbol: ' %',
    positiveCurrencyPrefix: '',
    positiveCurrencySuffix: ' ¤',
    negativeCurrencyPrefix: '(',
    negativeCurrencySuffix: ' ¤)'
  },
  ja: {
    negativeCurrencyPrefix: '-¤',
    negativeCurrencySuffix: ''
  },
  'en-GB': {
    negativeCurrencyPrefix: '-¤',
    negativeCurrencySuffix: ''
  }
};

/**
 * @namespace RegionDefaults
 */
const RegionDefaults = {
  AE: {
    currencyCode: 'AED'
  },
  AG: {
    currencyCode: 'XCD'
  },
  AI: {
    currencyCode: 'XCD'
  },
  AL: {
    currencyCode: 'ALL'
  },
  AM: {
    currencyCode: 'AMD'
  },
  AO: {
    currencyCode: 'AOA'
  },
  AR: {
    currencyCode: 'ARS'
  },
  AT: {
    currencyCode: 'EUR'
  },
  AU: {
    currencyCode: 'AUD'
  },
  AW: {
    currencyCode: 'AWG'
  },
  AZ: {
    currencyCode: 'AZN'
  },
  BA: {
    currencyCode: 'BAM'
  },
  BB: {
    currencyCode: 'BBD'
  },
  BD: {
    currencyCode: 'BDT'
  },
  BE: {
    currencyCode: 'EUR'
  },
  BF: {
    currencyCode: 'XOF'
  },
  BG: {
    currencyCode: 'BGN'
  },
  BH: {
    currencyCode: 'BHD'
  },
  BJ: {
    currencyCode: 'XOF'
  },
  BM: {
    currencyCode: 'BMD'
  },
  BN: {
    currencyCode: 'BND'
  },
  BO: {
    currencyCode: 'BOB'
  },
  BR: {
    currencyCode: 'BRL'
  },
  BS: {
    currencyCode: 'BSD'
  },
  BT: {
    currencyCode: 'BTN'
  },
  BW: {
    currencyCode: 'BWP'
  },
  BY: {
    currencyCode: 'BYR'
  },
  BZ: {
    currencyCode: 'BZD'
  },
  CA: {
    currencyCode: 'CAD'
  },
  CG: {
    currencyCode: 'CDF'
  },
  CH: {
    currencyCode: 'CHF'
  },
  CI: {
    currencyCode: 'XOF'
  },
  CL: {
    currencyCode: 'CLP'
  },
  CM: {
    currencyCode: 'XAF'
  },
  CN: {
    currencyCode: 'CNY'
  },
  CO: {
    currencyCode: 'COP'
  },
  CR: {
    currencyCode: 'CRC'
  },
  CV: {
    currencyCode: 'CVE'
  },
  CY: {
    currencyCode: 'EUR'
  },
  CZ: {
    currencyCode: 'CZK'
  },
  DE: {
    currencyCode: 'EUR'
  },
  DK: {
    currencyCode: 'DKK'
  },
  DM: {
    currencyCode: 'XCD'
  },
  DO: {
    currencyCode: 'DOP'
  },
  DZ: {
    currencyCode: 'DZD'
  },
  EC: {
    currencyCode: 'USD'
  },
  EE: {
    currencyCode: 'EUR'
  },
  EG: {
    currencyCode: 'EGP'
  },
  ES: {
    currencyCode: 'EUR'
  },
  ET: {
    currencyCode: 'ETB'
  },
  FI: {
    currencyCode: 'EUR'
  },
  FJ: {
    currencyCode: 'FJD'
  },
  FM: {
    currencyCode: 'USD'
  },
  FR: {
    currencyCode: 'EUR'
  },
  GA: {
    currencyCode: 'XAF'
  },
  GB: {
    currencyCode: 'GBP'
  },
  GD: {
    currencyCode: 'XCD'
  },
  GE: {
    currencyCode: 'GEL'
  },
  GH: {
    currencyCode: 'GHS'
  },
  GI: {
    currencyCode: 'GIP'
  },
  GM: {
    currencyCode: 'GMD'
  },
  GR: {
    currencyCode: 'EUR'
  },
  GT: {
    currencyCode: 'GTQ'
  },
  GU: {
    currencyCode: 'USD'
  },
  GW: {
    currencyCode: 'XOF'
  },
  GY: {
    currencyCode: 'GYD'
  },
  HK: {
    currencyCode: 'HKD'
  },
  HN: {
    currencyCode: 'HNL'
  },
  HR: {
    currencyCode: 'HRK'
  },
  HT: {
    currencyCode: 'HTG'
  },
  HU: {
    currencyCode: 'HUF'
  },
  ID: {
    currencyCode: 'IDR'
  },
  IE: {
    currencyCode: 'EUR'
  },
  IL: {
    currencyCode: 'ILS'
  },
  IN: {
    currencyCode: 'INR'
  },
  IS: {
    currencyCode: 'ISK'
  },
  IT: {
    currencyCode: 'EUR'
  },
  JM: {
    currencyCode: 'JMD'
  },
  JO: {
    currencyCode: 'JOD'
  },
  JP: {
    currencyCode: 'JPY'
  },
  KE: {
    currencyCode: 'KES'
  },
  KG: {
    currencyCode: 'KGS'
  },
  KH: {
    currencyCode: 'KHR'
  },
  KN: {
    currencyCode: 'XCD'
  },
  KR: {
    currencyCode: 'KRW'
  },
  KW: {
    currencyCode: 'KWD'
  },
  KY: {
    currencyCode: 'KYD'
  },
  KZ: {
    currencyCode: 'KZT'
  },
  LA: {
    currencyCode: 'LAK'
  },
  LB: {
    currencyCode: 'LBP'
  },
  LC: {
    currencyCode: 'XCD'
  },
  LI: {
    currencyCode: 'CHF'
  },
  LK: {
    currencyCode: 'LKR'
  },
  LR: {
    currencyCode: 'LRD'
  },
  LT: {
    currencyCode: 'LTL'
  },
  LU: {
    currencyCode: 'EUR'
  },
  LV: {
    currencyCode: 'EUR'
  },
  MA: {
    currencyCode: 'MAD'
  },
  MD: {
    currencyCode: 'MDL'
  },
  MG: {
    currencyCode: 'MGA'
  },
  MK: {
    currencyCode: 'MKD'
  },
  ML: {
    currencyCode: 'XOF'
  },
  MM: {
    currencyCode: 'MMK'
  },
  MN: {
    currencyCode: 'MNT'
  },
  MO: {
    currencyCode: 'MOP'
  },
  MP: {
    currencyCode: 'USD'
  },
  MR: {
    currencyCode: 'MRO'
  },
  MS: {
    currencyCode: 'XCD'
  },
  MT: {
    currencyCode: 'EUR'
  },
  MU: {
    currencyCode: 'MUR'
  },
  MW: {
    currencyCode: 'MWK'
  },
  MX: {
    currencyCode: 'MXN'
  },
  MY: {
    currencyCode: 'MYR'
  },
  MZ: {
    currencyCode: 'MZN'
  },
  NA: {
    currencyCode: 'NAD'
  },
  NE: {
    currencyCode: 'XOF'
  },
  NG: {
    currencyCode: 'NGN'
  },
  NI: {
    currencyCode: 'NIO'
  },
  NL: {
    currencyCode: 'EUR'
  },
  NO: {
    currencyCode: 'NOK'
  },
  NP: {
    currencyCode: 'NPR'
  },
  NZ: {
    currencyCode: 'NZD'
  },
  OM: {
    currencyCode: 'OMR'
  },
  PA: {
    currencyCode: 'PAB'
  },
  PE: {
    currencyCode: 'PEN'
  },
  PG: {
    currencyCode: 'PGK'
  },
  PH: {
    currencyCode: 'PHP'
  },
  PK: {
    currencyCode: 'PKR'
  },
  PL: {
    currencyCode: 'PLN'
  },
  PR: {
    currencyCode: 'USD'
  },
  PT: {
    currencyCode: 'EUR'
  },
  PW: {
    currencyCode: 'USD'
  },
  PY: {
    currencyCode: 'PYG'
  },
  QA: {
    currencyCode: 'QAR'
  },
  RO: {
    currencyCode: 'RON'
  },
  RS: {
    currencyCode: 'RSD'
  },
  RU: {
    currencyCode: 'RUB'
  },
  RW: {
    currencyCode: 'RWF'
  },
  SA: {
    currencyCode: 'SAR'
  },
  SB: {
    currencyCode: 'SBD'
  },
  SC: {
    currencyCode: 'SCR'
  },
  SE: {
    currencyCode: 'SEK'
  },
  SG: {
    currencyCode: 'SGD'
  },
  SI: {
    currencyCode: 'EUR'
  },
  SK: {
    currencyCode: 'EUR'
  },
  SL: {
    currencyCode: 'SLL'
  },
  SN: {
    currencyCode: 'XOF'
  },
  SR: {
    currencyCode: 'SRD'
  },
  ST: {
    currencyCode: 'STD'
  },
  SV: {
    currencyCode: 'SVC'
  },
  SZ: {
    currencyCode: 'SZL'
  },
  TC: {
    currencyCode: 'USD'
  },
  TD: {
    currencyCode: 'XAF'
  },
  TG: {
    currencyCode: 'XOF'
  },
  TH: {
    currencyCode: 'THB'
  },
  TJ: {
    currencyCode: 'TJS'
  },
  TM: {
    currencyCode: 'TMT'
  },
  TN: {
    currencyCode: 'TND'
  },
  TR: {
    currencyCode: 'TRY'
  },
  TT: {
    currencyCode: 'TTD'
  },
  TW: {
    currencyCode: 'TWD'
  },
  TZ: {
    currencyCode: 'TZS'
  },
  UA: {
    currencyCode: 'UAH'
  },
  UG: {
    currencyCode: 'UGX'
  },
  US: {
    currencyCode: 'USD'
  },
  UY: {
    currencyCode: 'UYU'
  },
  UZ: {
    currencyCode: 'UZS'
  },
  VC: {
    currencyCode: 'XCD'
  },
  VE: {
    currencyCode: 'VEF'
  },
  VG: {
    currencyCode: 'USD'
  },
  VI: {
    currencyCode: 'USD'
  },
  VN: {
    currencyCode: 'VND'
  },
  YE: {
    currencyCode: 'YER'
  },
  ZA: {
    currencyCode: 'ZAR'
  },
  ZM: {
    currencyCode: 'ZMW'
  },
  ZW: {
    currencyCode: 'USD'
  }
};

/**
 * @namespace CurrencyDefaults
 */
const CurrencyDefaults = {
  'default': {
    currencySymbol: formatter => formatter.currencyCode(),
    internationalCurrencySymbol: formatter => formatter.currencyCode(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    minimumIntegerDigits: 1,
    usesGroupingSeparator: true
  },
  AED: {
    currencySymbol: 'د.إ',
    internationalCurrencySymbol: 'د.إ'
  },
  ALL: {
    currencySymbol: 'L',
    internationalCurrencySymbol: 'L'
  },
  AMD: {
    currencySymbol: 'դր.',
    internationalCurrencySymbol: 'դր.'
  },
  AOA: {
    currencySymbol: 'Kz',
    internationalCurrencySymbol: 'Kz'
  },
  ARS: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  AUD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  AWG: {
    currencySymbol: 'ƒ',
    internationalCurrencySymbol: 'ƒ'
  },
  AZN: {
    currencySymbol: '₼',
    internationalCurrencySymbol: '₼'
  },
  BAM: {
    currencySymbol: 'КМ',
    internationalCurrencySymbol: 'КМ'
  },
  BBD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  BDT: {
    currencySymbol: '৳',
    internationalCurrencySymbol: '৳'
  },
  BGN: {
    currencySymbol: 'лв',
    internationalCurrencySymbol: 'лв'
  },
  BHD: {
    currencySymbol: 'ب.د',
    internationalCurrencySymbol: 'ب.د',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  },
  BMD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  BND: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  BOB: {
    currencySymbol: 'Bs.',
    internationalCurrencySymbol: 'Bs.'
  },
  BRL: {
    currencySymbol: 'R$',
    internationalCurrencySymbol: 'R$'
  },
  BSD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  BTN: {
    currencySymbol: 'Nu.',
    internationalCurrencySymbol: 'Nu.'
  },
  BWP: {
    currencySymbol: 'P',
    internationalCurrencySymbol: 'P'
  },
  BYR: {
    currencySymbol: 'Br',
    internationalCurrencySymbol: 'Br'
  },
  BZD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  CAD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  CDF: {
    currencySymbol: 'Fr',
    internationalCurrencySymbol: 'Fr'
  },
  CHF: {
    currencySymbol: 'Fr',
    internationalCurrencySymbol: 'Fr'
  },
  CLP: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  CNY: {
    currencySymbol: '¥',
    internationalCurrencySymbol: '¥'
  },
  COP: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  CRC: {
    currencySymbol: '₡',
    internationalCurrencySymbol: '₡'
  },
  CVE: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  CZK: {
    currencySymbol: 'Kč',
    internationalCurrencySymbol: 'Kč'
  },
  DKK: {
    currencySymbol: 'kr',
    internationalCurrencySymbol: 'kr'
  },
  DOP: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  DZD: {
    currencySymbol: 'د.ج',
    internationalCurrencySymbol: 'د.ج'
  },
  EGP: {
    currencySymbol: 'E£',
    internationalCurrencySymbol: 'E£'
  },
  ETB: {
    currencySymbol: 'ብር',
    internationalCurrencySymbol: 'ብር'
  },
  EUR: {
    currencySymbol: '€',
    internationalCurrencySymbol: '€'
  },
  FJD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  GBP: {
    currencySymbol: '£',
    internationalCurrencySymbol: '£'
  },
  GEL: {
    currencySymbol: 'ლ,',
    internationalCurrencySymbol: 'ლ,'
  },
  GHS: {
    currencySymbol: '₵',
    internationalCurrencySymbol: '₵'
  },
  GIP: {
    currencySymbol: '£',
    internationalCurrencySymbol: '£'
  },
  GMD: {
    currencySymbol: 'D',
    internationalCurrencySymbol: 'D'
  },
  GTQ: {
    currencySymbol: 'Q',
    internationalCurrencySymbol: 'Q'
  },
  GYD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  HKD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  HNL: {
    currencySymbol: 'L',
    internationalCurrencySymbol: 'L'
  },
  HRK: {
    currencySymbol: 'kn',
    internationalCurrencySymbol: 'kn'
  },
  HTG: {
    currencySymbol: 'G',
    internationalCurrencySymbol: 'G'
  },
  HUF: {
    currencySymbol: 'Ft',
    internationalCurrencySymbol: 'Ft'
  },
  IDR: {
    currencySymbol: 'Rp',
    internationalCurrencySymbol: 'Rp'
  },
  ILS: {
    currencySymbol: '₪',
    internationalCurrencySymbol: '₪'
  },
  INR: {
    currencySymbol: '₹',
    internationalCurrencySymbol: '₹'
  },
  ISK: {
    currencySymbol: 'kr',
    internationalCurrencySymbol: 'kr'
  },
  JMD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  JOD: {
    currencySymbol: 'د.ا',
    internationalCurrencySymbol: 'د.ا',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  },
  JPY: {
    currencySymbol: '¥',
    internationalCurrencySymbol: '¥',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  KES: {
    currencySymbol: 'KSh',
    internationalCurrencySymbol: 'KSh'
  },
  KGS: {
    currencySymbol: 'som',
    internationalCurrencySymbol: 'som'
  },
  KHR: {
    currencySymbol: '៛',
    internationalCurrencySymbol: '៛'
  },
  KRW: {
    currencySymbol: '₩',
    internationalCurrencySymbol: '₩',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  KWD: {
    currencySymbol: 'د.ك',
    internationalCurrencySymbol: 'د.ك',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  },
  KYD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  KZT: {
    currencySymbol: '〒',
    internationalCurrencySymbol: '〒'
  },
  LAK: {
    currencySymbol: '₭',
    internationalCurrencySymbol: '₭'
  },
  LBP: {
    currencySymbol: 'ل.ل',
    internationalCurrencySymbol: 'ل.ل'
  },
  LKR: {
    currencySymbol: '₨',
    internationalCurrencySymbol: '₨'
  },
  LRD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  LTL: {
    currencySymbol: 'Lt',
    internationalCurrencySymbol: 'Lt'
  },
  MAD: {
    currencySymbol: 'د.م.',
    internationalCurrencySymbol: 'د.م.'
  },
  MDL: {
    currencySymbol: 'L',
    internationalCurrencySymbol: 'L'
  },
  MGA: {
    currencySymbol: 'Ar',
    internationalCurrencySymbol: 'Ar',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  MKD: {
    currencySymbol: 'ден',
    internationalCurrencySymbol: 'ден'
  },
  MMK: {
    currencySymbol: 'K',
    internationalCurrencySymbol: 'K'
  },
  MNT: {
    currencySymbol: '₮',
    internationalCurrencySymbol: '₮'
  },
  MOP: {
    currencySymbol: 'P',
    internationalCurrencySymbol: 'P'
  },
  MRO: {
    currencySymbol: 'UM',
    internationalCurrencySymbol: 'UM',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  MUR: {
    currencySymbol: '₨',
    internationalCurrencySymbol: '₨'
  },
  MWK: {
    currencySymbol: 'MK',
    internationalCurrencySymbol: 'MK'
  },
  MXN: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  MYR: {
    currencySymbol: 'RM',
    internationalCurrencySymbol: 'RM'
  },
  MZN: {
    currencySymbol: 'MTn',
    internationalCurrencySymbol: 'MTn'
  },
  NAD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  NGN: {
    currencySymbol: '₦',
    internationalCurrencySymbol: '₦'
  },
  NIO: {
    currencySymbol: 'C$',
    internationalCurrencySymbol: 'C$'
  },
  NOK: {
    currencySymbol: 'kr',
    internationalCurrencySymbol: 'kr'
  },
  NPR: {
    currencySymbol: '₨',
    internationalCurrencySymbol: '₨'
  },
  NZD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  OMR: {
    currencySymbol: 'ر.ع.',
    internationalCurrencySymbol: 'ر.ع.',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  },
  PAB: {
    currencySymbol: 'B/.',
    internationalCurrencySymbol: 'B/.'
  },
  PEN: {
    currencySymbol: 'S/.',
    internationalCurrencySymbol: 'S/.'
  },
  PGK: {
    currencySymbol: 'K',
    internationalCurrencySymbol: 'K'
  },
  PHP: {
    currencySymbol: '₱',
    internationalCurrencySymbol: '₱'
  },
  PKR: {
    currencySymbol: '₨',
    internationalCurrencySymbol: '₨'
  },
  PLN: {
    currencySymbol: 'zł',
    internationalCurrencySymbol: 'zł'
  },
  PYG: {
    currencySymbol: '₲',
    internationalCurrencySymbol: '₲'
  },
  QAR: {
    currencySymbol: 'ر.ق',
    internationalCurrencySymbol: 'ر.ق'
  },
  RON: {
    currencySymbol: 'Lei',
    internationalCurrencySymbol: 'Lei'
  },
  RSD: {
    currencySymbol: 'РСД',
    internationalCurrencySymbol: 'РСД'
  },
  RUB: {
    currencySymbol: '₽',
    internationalCurrencySymbol: '₽'
  },
  RWF: {
    currencySymbol: 'FRw',
    internationalCurrencySymbol: 'FRw'
  },
  SAR: {
    currencySymbol: 'ر.س',
    internationalCurrencySymbol: 'ر.س'
  },
  SBD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  SCR: {
    currencySymbol: '₨',
    internationalCurrencySymbol: '₨'
  },
  SEK: {
    currencySymbol: 'kr',
    internationalCurrencySymbol: 'kr'
  },
  SGD: {
    currencySymbol: 'S$',
    internationalCurrencySymbol: 'S$'
  },
  SLL: {
    currencySymbol: 'Le',
    internationalCurrencySymbol: 'Le'
  },
  SRD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  STD: {
    currencySymbol: 'Db',
    internationalCurrencySymbol: 'Db'
  },
  SVC: {
    currencySymbol: '₡',
    internationalCurrencySymbol: '₡'
  },
  SZL: {
    currencySymbol: 'E',
    internationalCurrencySymbol: 'E'
  },
  THB: {
    currencySymbol: '฿',
    internationalCurrencySymbol: '฿'
  },
  TJS: {
    currencySymbol: 'ЅМ',
    internationalCurrencySymbol: 'ЅМ'
  },
  TMT: {
    currencySymbol: 'm',
    internationalCurrencySymbol: 'm'
  },
  TND: {
    currencySymbol: 'د.ت',
    internationalCurrencySymbol: 'د.ت',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  },
  TRY: {
    currencySymbol: '₺',
    internationalCurrencySymbol: '₺'
  },
  TTD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  TWD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  TZS: {
    currencySymbol: 'Sh',
    internationalCurrencySymbol: 'Sh'
  },
  UAH: {
    currencySymbol: '₴',
    internationalCurrencySymbol: '₴'
  },
  UGX: {
    currencySymbol: 'USh',
    internationalCurrencySymbol: 'USh'
  },
  USD: {
    currencySymbol: '$',
    internationalCurrencySymbol: 'US$'
  },
  UYU: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  UZS: {
    currencySymbol: 'лв',
    internationalCurrencySymbol: 'лв'
  },
  VEF: {
    currencySymbol: 'Bs F',
    internationalCurrencySymbol: 'Bs F'
  },
  VND: {
    currencySymbol: '₫',
    internationalCurrencySymbol: '₫',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  XAF: {
    currencySymbol: 'Fr',
    internationalCurrencySymbol: 'Fr'
  },
  XCD: {
    currencySymbol: '$',
    internationalCurrencySymbol: '$'
  },
  XOF: {
    currencySymbol: 'Fr',
    internationalCurrencySymbol: 'Fr'
  },
  YER: {
    currencySymbol: '﷼',
    internationalCurrencySymbol: '﷼'
  },
  ZAR: {
    currencySymbol: 'R',
    internationalCurrencySymbol: 'R'
  },
  ZMW: {
    currencySymbol: 'ZMK',
    internationalCurrencySymbol: 'ZMK'
  }
};

export default NumberFormatter;
