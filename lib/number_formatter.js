/* jshint esnext:true, undef:true, node:true */

var Formatter = require('./formatter');
var utils = require('./utils');
var isDigits = utils.isDigits;
var startsWith = utils.startsWith;
var endsWith = utils.endsWith;
var trim = utils.trim;
var zpad = utils.zpad;
var forEach = utils.forEach;
var stround = require('stround');

// Style
var NONE = 0;
var CURRENCY = 1;
var PERCENT = 2;

var DEFAULT_LOCALE = 'en-US';
var DEFAULT_COUNTRY = 'US';

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
function get(object, key/*, ...args */) {
  if (object) {
    var value = object[key];
    if (typeof value === 'function') {
      var args = [].slice.call(arguments, 2);
      return value.apply(null, args);
    } else {
      return value;
    }
  }
}

class NumberFormatter {
  constructor() {
    super();
    this._locale = 'en';
    this.setNumberStyle(NONE);
  }

  /**
   * Gets whether this formatter will parse float number values. This value does
   * not apply to formatting. To prevent formatting floats, set
   * #maximumFractionDigits to 0.
   *
   * @return {boolean}
   */
  allowsFloats() {
    return this._get('allowsFloats');
  }

  /**
   * Sets whether this formatter will parse float number values.
   *
   * @return {NumberFormatter}
   */
  setAllowsFloats(allowsFloats) {
    this._allowsFloats = allowsFloats;
    return this;
  }

  alwaysShowsDecimalSeparator() {
    return this._get('alwaysShowsDecimalSeparator');
  }

  setAlwaysShowsDecimalSeparator(alwaysShowsDecimalSeparator) {
    this._alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator;
    return this;
  }

  countryCode() {
    return this._countryCode || DEFAULT_COUNTRY;
  }

  setCountryCode(countryCode) {
    this._countryCode = countryCode;
    return this;
  }

  currencyCode() {
    return this._get('currencyCode');
  }

  setCurrencyCode(currencyCode) {
    this._currencyCode = currencyCode;
    return this;
  }

  currencySymbol() {
    if (this._shouldShowNativeCurrencySymbol()) {
      return this._get('currencySymbol');
    } else {
      return this._get('internationalCurrencySymbol');
    }
  }

  setCurrencySymbol(currencySymbol) {
    this._currencySymbol = currencySymbol;
    return this;
  }

  _shouldShowNativeCurrencySymbol() {
    var regionDefaultCurrencyCode = this._regionDefaults().currencyCode;
    if (typeof regionDefaultCurrencyCode === 'function') {
      regionDefaultCurrencyCode = regionDefaultCurrencyCode();
    }
    return this.currencyCode() === regionDefaultCurrencyCode;
  }

  decimalSeparator() {
    return this._get('decimalSeparator');
  }

  setDecimalSeparator(decimalSeparator) {
    this._decimalSeparator = decimalSeparator;
    return this;
  }

  groupingSeparator() {
    return this._get('groupingSeparator');
  }

  setGroupingSeparator(groupingSeparator) {
    this._groupingSeparator = groupingSeparator;
    return this;
  }

  groupingSize() {
    return this._get('groupingSize');
  }

  setGroupingSize(groupingSize) {
    this._groupingSize = groupingSize;
    return this;
  }

  internationalCurrencySymbol() {
    return this._get('internationalCurrencySymbol');
  }

  setInternationalCurrencySymbol(internationalCurrencySymbol) {
    this._internationalCurrencySymbol = internationalCurrencySymbol;
    return this;
  }

  isLenient() {
    return this._lenient;
  }

  setLenient(lenient) {
    this._lenient = lenient;
    return this;
  }

  locale() {
    return this._locale || DEFAULT_LOCALE;
  }

  setLocale(locale) {
    this._locale = locale;
    return this;
  }

  maximum() {
    return this._maximum;
  }

  setMaximum(max) {
    this._maximum = max;
    return this;
  }

  minimum() {
    return this._minimum;
  }

  setMinimum(min) {
    this._minimum = min;
    return this;
  }

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

  setMaximumFractionDigits(maximumFractionDigits) {
    this._maximumFractionDigits = maximumFractionDigits;
    return this;
  }

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

  setMinimumFractionDigits(minimumFractionDigits) {
    this._minimumFractionDigits = minimumFractionDigits;
    return this;
  }

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

  setMaximumIntegerDigits(maximumIntegerDigits) {
    this._maximumIntegerDigits = maximumIntegerDigits;
    return this;
  }

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

  setMinimumIntegerDigits(minimumIntegerDigits) {
    this._minimumIntegerDigits = minimumIntegerDigits;
    return this;
  }

  exponent() {
    return this._get('exponent');
  }

  setExponent(exponent) {
    this._exponent = exponent;
    return this;
  }

  negativeInfinitySymbol() {
    return this._get('negativeInfinitySymbol');
  }

  setNegativeInfinitySymbol(negativeInfinitySymbol) {
    this._negativeInfinitySymbol = negativeInfinitySymbol;
    return this;
  }

  negativePrefix() {
    return this._get('negativePrefix');
  }

  setNegativePrefix(prefix) {
    this._negativePrefix = prefix;
    return this;
  }

  negativeSuffix() {
    return this._get('negativeSuffix');
  }

  setNegativeSuffix(prefix) {
    this._negativeSuffix = prefix;
    return this;
  }

  notANumberSymbol() {
    return this._get('notANumberSymbol');
  }

  setNotANumberSymbol(notANumberSymbol) {
    this._notANumberSymbol = notANumberSymbol;
    return this;
  }

  nullSymbol() {
    return this._get('nullSymbol');
  }

  setNullSymbol(nullSymbol) {
    this._nullSymbol = nullSymbol;
    return this;
  }

  numberStyle() {
    return this._numberStyle;
  }

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

  percentSymbol() {
    return this._get('percentSymbol');
  }

  setPercentSymbol(percentSymbol) {
    this._percentSymbol = percentSymbol;
    return this;
  }

  positiveInfinitySymbol() {
    return this._get('positiveInfinitySymbol');
  }

  setPositiveInfinitySymbol(positiveInfinitySymbol) {
    this._positiveInfinitySymbol = positiveInfinitySymbol;
    return this;
  }

  positivePrefix() {
    return this._get('positivePrefix');
  }

  setPositivePrefix(prefix) {
    this._positivePrefix = prefix;
    return this;
  }

  positiveSuffix() {
    return this._get('positiveSuffix');
  }

  setPositiveSuffix(prefix) {
    this._positiveSuffix = prefix;
    return this;
  }

  roundingMode() {
    return this._get('roundingMode');
  }

  setRoundingMode(roundingMode) {
    this._roundingMode = roundingMode;
    return this;
  }

  usesGroupingSeparator() {
    return this._get('usesGroupingSeparator');
  }

  setUsesGroupingSeparator(usesGroupingSeparator) {
    this._usesGroupingSeparator = usesGroupingSeparator;
    return this;
  }

  zeroSymbol() {
    return this._get('zeroSymbol');
  }

  setZeroSymbol(zeroSymbol) {
    this._zeroSymbol = zeroSymbol;
    return this;
  }

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

    var string = null;
    var negative = number < 0;

    var parts = (''+Math.abs(number)).split('.');
    var integerPart = parts[0];
    var fractionPart = parts[1] || '';

    var exponent = this.exponent();
    if (exponent !== undefined && exponent !== null) {
      var shifted = stround.shift([negative, integerPart, fractionPart], exponent);
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
      var unrounded = '' + integerPart + '.' + fractionPart;
      var rounded = this._round(negative ? '-' + unrounded : unrounded);
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

  _round(number) {
    return stround.round(number, this.maximumFractionDigits(), this.roundingMode());
  }

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
      var shifted = stround.shift([false, integerPart, fractionPart], -exponent);
      var negative = shifted[0];
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

NumberFormatter.Rounding = stround.modes;

NumberFormatter.Style = {
  NONE: NONE,
  CURRENCY: CURRENCY,
  PERCENT: PERCENT
};

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
    positiveSuffix: function(formatter) {
      return formatter.percentSymbol();
    },
    negativeSuffix: function(formatter) {
      return formatter.percentSymbol();
    }
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
    positiveCurrencyPrefix: function(formatter) {
      return formatter.currencySymbol();
    },
    positiveCurrencySuffix: '',
    negativeCurrencyPrefix: function(formatter) {
      return '(' + (formatter.currencySymbol());
    },
    negativeCurrencySuffix: function(formatter) {
      return ')';
    }
  },
  fr: {
    decimalSeparator: ',',
    groupingSeparator: ' ',
    percentSymbol: ' %',
    positiveCurrencyPrefix: '',
    positiveCurrencySuffix: function(formatter) {
      return ' ' + (formatter.currencySymbol());
    },
    negativeCurrencyPrefix: function(formatter) {
      return '(';
    },
    negativeCurrencySuffix: function(formatter) {
      return ' ' + (formatter.currencySymbol()) + ')';
    }
  },
  ja: {
    negativeCurrencyPrefix: function(formatter) {
      return '-' + (formatter.currencySymbol());
    },
    negativeCurrencySuffix: ''
  },
  'en-GB': {
    negativeCurrencyPrefix: function(formatter) {
      return '-' + (formatter.currencySymbol());
    },
    negativeCurrencySuffix: ''
  }
};

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

var CurrencyDefaults = {
  'default': {
    currencySymbol: function(formatter) {
      return formatter.currencyCode();
    },
    internationalCurrencySymbol: function(formatter) {
      return formatter.currencyCode();
    },
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

module.exports = NumberFormatter;
