'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _delimited_text_formatter = require('./delimited_text_formatter');

var _delimited_text_formatter2 = _interopRequireDefault(_delimited_text_formatter);

var _card_utils = require('./card_utils');

/**
 * A generic credit card formatter.
 *
 * @extends DelimitedTextFormatter
 */

var DefaultCardFormatter = (function (_DelimitedTextFormatter) {
  _inherits(DefaultCardFormatter, _DelimitedTextFormatter);

  function DefaultCardFormatter() {
    _classCallCheck(this, DefaultCardFormatter);

    _get(Object.getPrototypeOf(DefaultCardFormatter.prototype), 'constructor', this).call(this, ' ');
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */

  _createClass(DefaultCardFormatter, [{
    key: 'hasDelimiterAtIndex',
    value: function hasDelimiterAtIndex(index) {
      return index === 4 || index === 9 || index === 14;
    }

    /**
     * Will call parse on the formatter.
     *
     * @param {string} text
     * @param {function(string)} error
     * @returns {string} returns value with delimiters removed
     */
  }, {
    key: 'parse',
    value: function parse(text, error) {
      var value = this._valueFromText(text);
      if (typeof error === 'function') {
        if (!(0, _card_utils.validCardLength)(value)) {
          error('card-formatter.number-too-short');
        }
        if (!(0, _card_utils.luhnCheck)(value)) {
          error('card-formatter.invalid-number');
        }
      }
      return _get(Object.getPrototypeOf(DefaultCardFormatter.prototype), 'parse', this).call(this, text, error);
    }

    /**
     * Parses the given text by removing delimiters.
     *
     * @param {?string} text
     * @returns {string}
     * @private
     */
  }, {
    key: '_valueFromText',
    value: function _valueFromText(text) {
      return _get(Object.getPrototypeOf(DefaultCardFormatter.prototype), '_valueFromText', this).call(this, (text || '').replace(/[^\d]/g, ''));
    }

    /**
     * Gets the maximum length of a formatted default card number.
     *
     * @returns {number}
     */
  }, {
    key: 'maximumLength',
    get: function get() {
      return 16 + 3;
    }
  }]);

  return DefaultCardFormatter;
})(_delimited_text_formatter2['default']);

exports['default'] = DefaultCardFormatter;
module.exports = exports['default'];