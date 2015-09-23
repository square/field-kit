'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _formatter = require('./formatter');

var _formatter2 = _interopRequireDefault(_formatter);

var NumberFormatterSettings = function NumberFormatterSettings() {
  _classCallCheck(this, NumberFormatterSettings);

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

/**
 * Returns a string composed of the given character repeated `length` times.
 *
 * @param {string} character
 * @param {number} length
 * @returns {string}
 * @private
 */
;

function chars(character, length) {
  return new Array(length + 1).join(character);
}

/**
 * @const
 * @private
 */
var DIGIT = '#';

/**
 * @const
 * @private
 */
var PADDING = '0';

/**
 * @const
 * @private
 */
var DECIMAL_SEPARATOR = '.';

/**
 * @const
 * @private
 */
var GROUPING_SEPARATOR = ',';

var NumberFormatterSettingsFormatter = (function (_Formatter) {
  _inherits(NumberFormatterSettingsFormatter, _Formatter);

  function NumberFormatterSettingsFormatter() {
    _classCallCheck(this, NumberFormatterSettingsFormatter);

    _get(Object.getPrototypeOf(NumberFormatterSettingsFormatter.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NumberFormatterSettingsFormatter, [{
    key: 'format',

    /**
     * @param {NumberFormatterSettings} settings
     * @returns {string}
     */
    value: function format(settings) {
      var result = '';

      var minimumIntegerDigits = settings.minimumIntegerDigits;
      if (minimumIntegerDigits !== 0) {
        result += chars(PADDING, minimumIntegerDigits);
      }

      result = DIGIT + result;

      if (settings.usesGroupingSeparator) {
        while (result.length <= settings.groupingSize) {
          result = DIGIT + result;
        }

        result = result.slice(0, -settings.groupingSize) + GROUPING_SEPARATOR + result.slice(-settings.groupingSize);
      }

      var minimumFractionDigits = settings.minimumFractionDigits;
      var maximumFractionDigits = settings.maximumFractionDigits;
      var hasFractionalPart = settings.alwaysShowsDecimalSeparator || minimumFractionDigits > 0 || maximumFractionDigits > 0;

      if (hasFractionalPart) {
        result += DECIMAL_SEPARATOR;
        for (var i = 0, _length = maximumFractionDigits; i < _length; i++) {
          result += i < minimumFractionDigits ? PADDING : DIGIT;
        }
      }

      return settings.prefix + result + settings.suffix;
    }

    /**
     * @param {string} string
     * @returns {?NumberFormatterSettings}
     */
  }, {
    key: 'parse',
    value: function parse(string) {
      var result = new NumberFormatterSettings();

      var hasPassedPrefix = false;
      var hasStartedSuffix = false;
      var decimalSeparatorIndex = null;
      var groupingSeparatorIndex = null;
      var lastIntegerDigitIndex = null;

      for (var i = 0, length = string.length; i < length; i++) {
        var c = string[i];

        switch (c) {
          case DIGIT:
            if (hasStartedSuffix) {
              return null;
            }
            hasPassedPrefix = true;
            if (decimalSeparatorIndex !== null) {
              result.maximumFractionDigits++;
            }
            break;

          case PADDING:
            if (hasStartedSuffix) {
              return null;
            }
            hasPassedPrefix = true;
            if (decimalSeparatorIndex === null) {
              result.minimumIntegerDigits++;
            } else {
              result.minimumFractionDigits++;
              result.maximumFractionDigits++;
            }
            break;

          case DECIMAL_SEPARATOR:
            if (hasStartedSuffix) {
              return null;
            }
            hasPassedPrefix = true;
            decimalSeparatorIndex = i;
            lastIntegerDigitIndex = i - 1;
            break;

          case GROUPING_SEPARATOR:
            if (hasStartedSuffix) {
              return null;
            }
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
  }]);

  return NumberFormatterSettingsFormatter;
})(_formatter2['default']);

exports['default'] = NumberFormatterSettingsFormatter;
module.exports = exports['default'];