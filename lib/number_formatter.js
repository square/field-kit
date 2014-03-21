(function() {
  var CURRENCY, CurrencyDefaults, DEFAULT_COUNTRY, DEFAULT_LOCALE, Formatter, LocaleDefaults, NONE, NumberFormatter, PERCENT, RegionDefaults, StyleDefaults, endsWith, get, isDigits, splitLocaleComponents, startsWith, stround, trim, zpad, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Formatter = require('./formatter');

  _ref = require('./utils'), isDigits = _ref.isDigits, startsWith = _ref.startsWith, endsWith = _ref.endsWith, trim = _ref.trim, zpad = _ref.zpad;

  stround = require('stround');

  NONE = 0;

  CURRENCY = 1;

  PERCENT = 2;

  DEFAULT_LOCALE = 'en-US';

  DEFAULT_COUNTRY = 'US';

  splitLocaleComponents = function(locale) {
    var match, _ref1, _ref2;
    match = locale.match(/^([a-z][a-z])(?:[-_]([a-z][a-z]))?$/i);
    return {
      lang: match != null ? (_ref1 = match[1]) != null ? _ref1.toLowerCase() : void 0 : void 0,
      country: match != null ? (_ref2 = match[2]) != null ? _ref2.toUpperCase() : void 0 : void 0
    };
  };

  get = function() {
    var args, key, object, value;
    object = arguments[0], key = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    value = object != null ? object[key] : void 0;
    if (typeof value === 'function') {
      value = value.apply(null, args);
    }
    return value;
  };

  NumberFormatter = (function(_super) {
    __extends(NumberFormatter, _super);

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

    function NumberFormatter() {
      this._locale = 'en';
      this.setNumberStyle(NONE);
    }

    NumberFormatter.prototype.allowsFloats = function() {
      return this._get('allowsFloats');
    };

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
      var regionDefaultCurrencyCode, _ref1;
      regionDefaultCurrencyCode = this._regionDefaults().currencyCode;
      regionDefaultCurrencyCode = (_ref1 = typeof regionDefaultCurrencyCode === "function" ? regionDefaultCurrencyCode() : void 0) != null ? _ref1 : regionDefaultCurrencyCode;
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
      return this._negativeInfinitySymbol = negativeInfinitySymbol;
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
      return this._notANumberSymbol = notANumberSymbol;
    };

    NumberFormatter.prototype.nullSymbol = function() {
      return this._get('nullSymbol');
    };

    NumberFormatter.prototype.setNullSymbol = function(nullSymbol) {
      return this._nullSymbol = nullSymbol;
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
      return this._usesGroupingSeparator = usesGroupingSeparator;
    };

    NumberFormatter.prototype.zeroSymbol = function() {
      return this._get('zeroSymbol');
    };

    NumberFormatter.prototype.setZeroSymbol = function(zeroSymbol) {
      return this._zeroSymbol = zeroSymbol;
    };

    NumberFormatter.prototype._get = function(attr) {
      var localeDefaults, regionDefaults, styleDefaults, value;
      value = this["_" + attr];
      if (value != null) {
        return value;
      }
      styleDefaults = this._styleDefaults;
      localeDefaults = this._localeDefaults();
      regionDefaults = this._regionDefaults();
      value = get(styleDefaults, attr, this, localeDefaults);
      if (value != null) {
        return value;
      }
      value = get(localeDefaults, attr, this, styleDefaults);
      if (value != null) {
        return value;
      }
      value = get(regionDefaults, attr, this, styleDefaults);
      if (value != null) {
        return value;
      }
      value = get(this._currencyDefaults(), attr, this, localeDefaults);
      if (value != null) {
        return value;
      }
      return null;
    };

    NumberFormatter.prototype.format = function(number) {
      var copiedCharacterCount, exponent, fractionPart, i, integerPart, integerPartWithGroupingSeparators, maximumFractionDigits, maximumIntegerDigits, minimumFractionDigits, minimumIntegerDigits, negative, negativeInfinitySymbol, notANumberSymbol, nullSymbol, positiveInfinitySymbol, result, rounded, string, unrounded, zeroSymbol, _i, _ref1, _ref2, _ref3, _ref4;
      if (number === "") {
        return "";
      }
      if (((zeroSymbol = this.zeroSymbol()) != null) && number === 0) {
        return zeroSymbol;
      }
      if (((nullSymbol = this.nullSymbol()) != null) && number === null) {
        return nullSymbol;
      }
      if (((notANumberSymbol = this.notANumberSymbol()) != null) && isNaN(number)) {
        return notANumberSymbol;
      }
      if (((positiveInfinitySymbol = this.positiveInfinitySymbol()) != null) && number === Infinity) {
        return positiveInfinitySymbol;
      }
      if (((negativeInfinitySymbol = this.negativeInfinitySymbol()) != null) && number === -Infinity) {
        return negativeInfinitySymbol;
      }
      integerPart = null;
      fractionPart = null;
      string = null;
      negative = number < 0;
      _ref1 = ("" + (Math.abs(number))).split('.'), integerPart = _ref1[0], fractionPart = _ref1[1];
      fractionPart || (fractionPart = '');
      if ((exponent = this.exponent()) != null) {
        _ref2 = stround.shift([negative, integerPart, fractionPart], exponent), negative = _ref2[0], integerPart = _ref2[1], fractionPart = _ref2[2];
        while (integerPart[0] === '0') {
          integerPart = integerPart.slice(1);
        }
      }
      maximumFractionDigits = this.maximumFractionDigits();
      if (fractionPart.length > maximumFractionDigits) {
        unrounded = "" + integerPart + "." + fractionPart;
        rounded = this._round(negative ? "-" + unrounded : unrounded);
        if (rounded[0] === '-') {
          rounded = rounded.slice(1);
        }
        _ref3 = rounded.split('.'), integerPart = _ref3[0], fractionPart = _ref3[1];
        fractionPart || (fractionPart = '');
      }
      minimumFractionDigits = this.minimumFractionDigits();
      while (fractionPart.length < minimumFractionDigits) {
        fractionPart += '0';
      }
      minimumIntegerDigits = this.minimumIntegerDigits();
      while (integerPart.length < minimumIntegerDigits) {
        integerPart = '0' + integerPart;
      }
      minimumFractionDigits = this.minimumFractionDigits();
      while (fractionPart.length > minimumFractionDigits && fractionPart.slice(-1) === '0') {
        fractionPart = fractionPart.slice(0, -1);
      }
      maximumIntegerDigits = this.maximumIntegerDigits();
      if ((maximumIntegerDigits != null) && integerPart.length > maximumIntegerDigits) {
        integerPart = integerPart.slice(-maximumIntegerDigits);
      }
      if (fractionPart.length > 0 || this.alwaysShowsDecimalSeparator()) {
        fractionPart = this.decimalSeparator() + fractionPart;
      }
      if (this.usesGroupingSeparator()) {
        integerPartWithGroupingSeparators = '';
        copiedCharacterCount = 0;
        for (i = _i = _ref4 = integerPart.length - 1; _ref4 <= 0 ? _i <= 0 : _i >= 0; i = _ref4 <= 0 ? ++_i : --_i) {
          if (copiedCharacterCount > 0 && copiedCharacterCount % this.groupingSize() === 0) {
            integerPartWithGroupingSeparators = this.groupingSeparator() + integerPartWithGroupingSeparators;
          }
          integerPartWithGroupingSeparators = integerPart[i] + integerPartWithGroupingSeparators;
          copiedCharacterCount++;
        }
        integerPart = integerPartWithGroupingSeparators;
      }
      result = integerPart + fractionPart;
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
      var hasNegativePrefix, hasNegativeSuffix, hasPositivePrefix, hasPositiveSuffix, innerString, negativePrefix, negativeSuffix, positivePrefix, positiveSuffix, result;
      positivePrefix = this.positivePrefix();
      negativePrefix = this.negativePrefix();
      positiveSuffix = this.positiveSuffix();
      negativeSuffix = this.negativeSuffix();
      if (this.isLenient()) {
        string = string.replace(/\s/g, '');
        positivePrefix = trim(positivePrefix);
        negativePrefix = trim(negativePrefix);
        positiveSuffix = trim(positiveSuffix);
        negativeSuffix = trim(negativeSuffix);
      }
      if ((this.zeroSymbol() != null) && string === this.zeroSymbol()) {
        result = 0;
      } else if ((this.nullSymbol() != null) && string === this.nullSymbol()) {
        result = null;
      } else if ((this.notANumberSymbol() != null) && string === this.notANumberSymbol()) {
        result = NaN;
      } else if ((this.positiveInfinitySymbol() != null) && string === this.positiveInfinitySymbol()) {
        result = Infinity;
      } else if ((this.negativeInfinitySymbol() != null) && string === this.negativeInfinitySymbol()) {
        result = -Infinity;
      } else if (result == null) {
        hasNegativePrefix = startsWith(negativePrefix, string);
        hasNegativeSuffix = endsWith(negativeSuffix, string);
        if (hasNegativePrefix && (this.isLenient() || hasNegativeSuffix)) {
          innerString = string.slice(negativePrefix.length);
          if (hasNegativeSuffix) {
            innerString = innerString.slice(0, innerString.length - negativeSuffix.length);
          }
          result = this._parseAbsoluteValue(innerString, error);
          if (result != null) {
            result *= -1;
          }
        } else {
          hasPositivePrefix = startsWith(positivePrefix, string);
          hasPositiveSuffix = endsWith(positiveSuffix, string);
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
            if (typeof error === "function") {
              error('number-formatter.invalid-format');
            }
            return null;
          }
        }
      }
      if (result != null) {
        if ((this._minimum != null) && result < this._minimum) {
          if (typeof error === "function") {
            error('number-formatter.out-of-bounds.below-minimum');
          }
          return null;
        }
        if ((this._maximum != null) && result > this._maximum) {
          if (typeof error === "function") {
            error('number-formatter.out-of-bounds.above-maximum');
          }
          return null;
        }
      }
      return result;
    };

    NumberFormatter.prototype._parseAbsoluteValue = function(string, error) {
      var exponent, fractionPart, groupPart, groupParts, groupingSize, integerPart, negative, number, parts, _i, _len, _ref1, _ref2;
      if (string.length === 0) {
        if (typeof error === "function") {
          error('number-formatter.invalid-format');
        }
        return null;
      }
      parts = string.split(this.decimalSeparator());
      if (parts.length > 2) {
        if (typeof error === "function") {
          error('number-formatter.invalid-format');
        }
        return null;
      }
      integerPart = parts[0];
      fractionPart = parts[1] || '';
      if (this.usesGroupingSeparator()) {
        groupingSize = this.groupingSize();
        groupParts = integerPart.split(this.groupingSeparator());
        if (!this.isLenient()) {
          if (groupParts.length > 1) {
            if (groupParts[0].length > groupingSize) {
              if (typeof error === "function") {
                error('number-formatter.invalid-format.grouping-size');
              }
              return null;
            }
            _ref1 = groupParts.slice(1);
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              groupPart = _ref1[_i];
              if (groupPart.length !== groupingSize) {
                if (typeof error === "function") {
                  error('number-formatter.invalid-format.grouping-size');
                }
                return null;
              }
            }
          }
        }
        integerPart = groupParts.join('');
      }
      if (!isDigits(integerPart) || !isDigits(fractionPart)) {
        if (typeof error === "function") {
          error('number-formatter.invalid-format');
        }
        return null;
      }
      if ((exponent = this.exponent()) != null) {
        _ref2 = stround.shift([negative, integerPart, fractionPart], -exponent), negative = _ref2[0], integerPart = _ref2[1], fractionPart = _ref2[2];
      }
      number = Number(integerPart) + Number("." + (fractionPart || '0'));
      if (!this.allowsFloats() && number !== ~~number) {
        if (typeof error === "function") {
          error('number-formatter.floats-not-allowed');
        }
        return null;
      }
      return number;
    };

    NumberFormatter.prototype._currencyDefaults = function() {
      var key, result, value, _ref1, _ref2;
      result = {};
      _ref1 = CurrencyDefaults["default"];
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        value = _ref1[key];
        result[key] = value;
      }
      _ref2 = CurrencyDefaults[this.currencyCode()];
      for (key in _ref2) {
        if (!__hasProp.call(_ref2, key)) continue;
        value = _ref2[key];
        result[key] = value;
      }
      return result;
    };

    NumberFormatter.prototype._regionDefaults = function() {
      var key, result, value, _ref1, _ref2;
      result = {};
      _ref1 = RegionDefaults["default"];
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        value = _ref1[key];
        result[key] = value;
      }
      _ref2 = RegionDefaults[this.countryCode()];
      for (key in _ref2) {
        if (!__hasProp.call(_ref2, key)) continue;
        value = _ref2[key];
        result[key] = value;
      }
      return result;
    };

    NumberFormatter.prototype._localeDefaults = function() {
      var countryCode, defaultFallbacks, defaults, key, lang, locale, result, value, _i, _len;
      locale = this.locale();
      countryCode = this.countryCode();
      lang = splitLocaleComponents(locale).lang;
      result = {};
      defaultFallbacks = [RegionDefaults["default"], LocaleDefaults["default"], RegionDefaults[countryCode], LocaleDefaults[lang], LocaleDefaults[locale]];
      for (_i = 0, _len = defaultFallbacks.length; _i < _len; _i++) {
        defaults = defaultFallbacks[_i];
        for (key in defaults) {
          if (!__hasProp.call(defaults, key)) continue;
          value = defaults[key];
          result[key] = value;
        }
      }
      return result;
    };

    return NumberFormatter;

  })(Formatter);

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

  StyleDefaults = {
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

  LocaleDefaults = {
    "default": {
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
        return "(" + (formatter.currencySymbol());
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
        return " " + (formatter.currencySymbol());
      },
      negativeCurrencyPrefix: function(formatter) {
        return '(';
      },
      negativeCurrencySuffix: function(formatter) {
        return " " + (formatter.currencySymbol()) + ")";
      }
    },
    ja: {
      negativeCurrencyPrefix: function(formatter) {
        return "-" + (formatter.currencySymbol());
      },
      negativeCurrencySuffix: ''
    },
    'en-GB': {
      negativeCurrencyPrefix: function(formatter) {
        return "-" + (formatter.currencySymbol());
      },
      negativeCurrencySuffix: ''
    }
  };

  RegionDefaults = {
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

  CurrencyDefaults = {
    "default": {
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

}).call(this);
