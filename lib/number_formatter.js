/* jshint undef:true, node:true */

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

function NumberFormatter() {
  Formatter.call(this);
  this._locale = 'en';
  this.setNumberStyle(NONE);
}

NumberFormatter.prototype = Object.create(Formatter.prototype);

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
 * Gets whether this formatter will parse float number values. This value does
 * not apply to formatting. To prevent formatting floats, set
 * #maximumFractionDigits to 0.
 *
 * @return {boolean}
 */
NumberFormatter.prototype.allowsFloats = function() {
  return this._get('allowsFloats');
};

/**
 * Sets whether this formatter will parse float number values.
 *
 * @return {NumberFormatter}
 */
NumberFormatter.prototype.setAllowsFloats = function(allowsFloats) {
  this._allowsFloats = allowsFloats;
  return this;
};

NumberFormatter.prototype.alwaysShowsDecimalSeparator = function() {
  return this._get('alwaysShowsDecimalSeparator');
};

NumberFormatter.prototype.setAlwaysShowsDecimalSeparator = function(alwaysShowsDecimalSeparator) {
  this._alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator;
  return this;
};

NumberFormatter.prototype.countryCode = function() {
  return this._countryCode || DEFAULT_COUNTRY;
};

NumberFormatter.prototype.setCountryCode = function(countryCode) {
  this._countryCode = countryCode;
  return this;
};

NumberFormatter.prototype.currencyCode = function() {
  return this._get('currencyCode');
};

NumberFormatter.prototype.setCurrencyCode = function(currencyCode) {
  this._currencyCode = currencyCode;
  return this;
};

NumberFormatter.prototype.currencySymbol = function() {
  if (this._shouldShowNativeCurrencySymbol()) {
    return this._get('currencySymbol');
  } else {
    return this._get('internationalCurrencySymbol');
  }
};

NumberFormatter.prototype.setCurrencySymbol = function(currencySymbol) {
  this._currencySymbol = currencySymbol;
  return this;
};

NumberFormatter.prototype._shouldShowNativeCurrencySymbol = function() {
  var regionDefaultCurrencyCode = this._regionDefaults().currencyCode;
  if (typeof regionDefaultCurrencyCode === 'function') {
    regionDefaultCurrencyCode = regionDefaultCurrencyCode();
  }
  return this.currencyCode() === regionDefaultCurrencyCode;
};

NumberFormatter.prototype.decimalSeparator = function() {
  return this._get('decimalSeparator');
};

NumberFormatter.prototype.setDecimalSeparator = function(decimalSeparator) {
  this._decimalSeparator = decimalSeparator;
  return this;
};

NumberFormatter.prototype.groupingSeparator = function() {
  return this._get('groupingSeparator');
};

NumberFormatter.prototype.setGroupingSeparator = function(groupingSeparator) {
  this._groupingSeparator = groupingSeparator;
  return this;
};

NumberFormatter.prototype.groupingSize = function() {
  return this._get('groupingSize');
};

NumberFormatter.prototype.setGroupingSize = function(groupingSize) {
  this._groupingSize = groupingSize;
  return this;
};

NumberFormatter.prototype.internationalCurrencySymbol = function() {
  return this._get('internationalCurrencySymbol');
};

NumberFormatter.prototype.setInternationalCurrencySymbol = function(internationalCurrencySymbol) {
  this._internationalCurrencySymbol = internationalCurrencySymbol;
  return this;
};

NumberFormatter.prototype.isLenient = function() {
  return this._lenient;
};

NumberFormatter.prototype.setLenient = function(lenient) {
  this._lenient = lenient;
  return this;
};

NumberFormatter.prototype.locale = function() {
  return this._locale || DEFAULT_LOCALE;
};

NumberFormatter.prototype.setLocale = function(locale) {
  this._locale = locale;
  return this;
};

NumberFormatter.prototype.maximum = function() {
  return this._maximum;
};

NumberFormatter.prototype.setMaximum = function(max) {
  this._maximum = max;
  return this;
};

NumberFormatter.prototype.minimum = function() {
  return this._minimum;
};

NumberFormatter.prototype.setMinimum = function(min) {
  this._minimum = min;
  return this;
};

NumberFormatter.prototype.maximumFractionDigits = function() {
  return this._get('maximumFractionDigits');
};

NumberFormatter.prototype.setMaximumFractionDigits = function(maximumFractionDigits) {
  this._maximumFractionDigits = maximumFractionDigits;
  if (maximumFractionDigits < this.minimumFractionDigits()) {
    this.setMinimumFractionDigits(maximumFractionDigits);
  }
  return this;
};

NumberFormatter.prototype.minimumFractionDigits = function() {
  return this._get('minimumFractionDigits');
};

NumberFormatter.prototype.setMinimumFractionDigits = function(minimumFractionDigits) {
  this._minimumFractionDigits = minimumFractionDigits;
  if (minimumFractionDigits > this.maximumFractionDigits()) {
    this.setMaximumFractionDigits(minimumFractionDigits);
  }
  return this;
};

NumberFormatter.prototype.maximumIntegerDigits = function() {
  return this._get('maximumIntegerDigits');
};

NumberFormatter.prototype.setMaximumIntegerDigits = function(maximumIntegerDigits) {
  this._maximumIntegerDigits = maximumIntegerDigits;
  if (maximumIntegerDigits < this.minimumIntegerDigits()) {
    this.setMinimumIntegerDigits(maximumIntegerDigits);
  }
  return this;
};

NumberFormatter.prototype.minimumIntegerDigits = function() {
  return this._get('minimumIntegerDigits');
};

NumberFormatter.prototype.setMinimumIntegerDigits = function(minimumIntegerDigits) {
  this._minimumIntegerDigits = minimumIntegerDigits;
  if (minimumIntegerDigits > this.maximumIntegerDigits()) {
    this.setMaximumIntegerDigits(minimumIntegerDigits);
  }
  return this;
};

NumberFormatter.prototype.exponent = function() {
  return this._get('exponent');
};

NumberFormatter.prototype.setExponent = function(exponent) {
  this._exponent = exponent;
  return this;
};

NumberFormatter.prototype.negativeInfinitySymbol = function() {
  return this._get('negativeInfinitySymbol');
};

NumberFormatter.prototype.setNegativeInfinitySymbol = function(negativeInfinitySymbol) {
  this._negativeInfinitySymbol = negativeInfinitySymbol;
  return this;
};

NumberFormatter.prototype.negativePrefix = function() {
  return this._get('negativePrefix');
};

NumberFormatter.prototype.setNegativePrefix = function(prefix) {
  this._negativePrefix = prefix;
  return this;
};

NumberFormatter.prototype.negativeSuffix = function() {
  return this._get('negativeSuffix');
};

NumberFormatter.prototype.setNegativeSuffix = function(prefix) {
  this._negativeSuffix = prefix;
  return this;
};

NumberFormatter.prototype.notANumberSymbol = function() {
  return this._get('notANumberSymbol');
};

NumberFormatter.prototype.setNotANumberSymbol = function(notANumberSymbol) {
  this._notANumberSymbol = notANumberSymbol;
  return this;
};

NumberFormatter.prototype.nullSymbol = function() {
  return this._get('nullSymbol');
};

NumberFormatter.prototype.setNullSymbol = function(nullSymbol) {
  this._nullSymbol = nullSymbol;
  return this;
};

NumberFormatter.prototype.numberStyle = function() {
  return this._numberStyle;
};

NumberFormatter.prototype.setNumberStyle = function(numberStyle) {
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
};

NumberFormatter.prototype.percentSymbol = function() {
  return this._get('percentSymbol');
};

NumberFormatter.prototype.setPercentSymbol = function(percentSymbol) {
  this._percentSymbol = percentSymbol;
  return this;
};

NumberFormatter.prototype.positiveInfinitySymbol = function() {
  return this._get('positiveInfinitySymbol');
};

NumberFormatter.prototype.setPositiveInfinitySymbol = function(positiveInfinitySymbol) {
  this._positiveInfinitySymbol = positiveInfinitySymbol;
  return this;
};

NumberFormatter.prototype.positivePrefix = function() {
  return this._get('positivePrefix');
};

NumberFormatter.prototype.setPositivePrefix = function(prefix) {
  this._positivePrefix = prefix;
  return this;
};

NumberFormatter.prototype.positiveSuffix = function() {
  return this._get('positiveSuffix');
};

NumberFormatter.prototype.setPositiveSuffix = function(prefix) {
  this._positiveSuffix = prefix;
  return this;
};

NumberFormatter.prototype.roundingMode = function() {
  return this._get('roundingMode');
};

NumberFormatter.prototype.setRoundingMode = function(roundingMode) {
  this._roundingMode = roundingMode;
  return this;
};

NumberFormatter.prototype.usesGroupingSeparator = function() {
  return this._get('usesGroupingSeparator');
};

NumberFormatter.prototype.setUsesGroupingSeparator = function(usesGroupingSeparator) {
  this._usesGroupingSeparator = usesGroupingSeparator;
  return this;
};

NumberFormatter.prototype.zeroSymbol = function() {
  return this._get('zeroSymbol');
};

NumberFormatter.prototype.setZeroSymbol = function(zeroSymbol) {
  this._zeroSymbol = zeroSymbol;
  return this;
};

NumberFormatter.prototype._get = function(attr) {
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
};

NumberFormatter.prototype.format = function(number) {
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
};

NumberFormatter.prototype._round = function(number) {
  return stround.round(number, this.maximumFractionDigits(), this.roundingMode());
};

NumberFormatter.prototype.parse = function(string, error) {
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
};

NumberFormatter.prototype._parseAbsoluteValue = function(string, error) {
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
};

NumberFormatter.prototype._currencyDefaults = function() {
  var result = {};

  forEach(CurrencyDefaults['default'], function(value, key) {
    result[key] = value;
  });

  forEach(CurrencyDefaults[this.currencyCode()], function(value, key) {
    result[key] = value;
  });

  return result;
};

NumberFormatter.prototype._regionDefaults = function() {
  var result = {};

  forEach(RegionDefaults.default, function(value, key) {
    result[key] = value;
  });

  forEach(RegionDefaults[this.countryCode()], function(value, key) {
    result[key] = value;
  });

  return result;
};

NumberFormatter.prototype._localeDefaults = function() {
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
};

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
