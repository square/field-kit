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

var _utils = require('./utils');

/**
 * Give this function a 2 digit year it'll return with 4.
 *
 * @example
 *     interpretTwoDigitYear(15);
 *     // => 2015
 *     interpretTwoDigitYear(97);
 *     // => 1997
 * @param {number} year
 * @returns {number}
 * @private
 */
function interpretTwoDigitYear(year) {
  var thisYear = new Date().getFullYear();
  var thisCentury = thisYear - thisYear % 100;
  var centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort(function (a, b) {
    return Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b));
  });
  return year + centuries[0];
}

/**
 * @extends DelimitedTextFormatter
 */

var ExpiryDateFormatter = (function (_DelimitedTextFormatter) {
  _inherits(ExpiryDateFormatter, _DelimitedTextFormatter);

  function ExpiryDateFormatter() {
    _classCallCheck(this, ExpiryDateFormatter);

    _get(Object.getPrototypeOf(ExpiryDateFormatter.prototype), 'constructor', this).call(this, '/');
    this.maximumLength = 5;
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */

  _createClass(ExpiryDateFormatter, [{
    key: 'hasDelimiterAtIndex',
    value: function hasDelimiterAtIndex(index) {
      return index === 2;
    }

    /**
     * Formats the given value by adding delimiters where needed.
     *
     * @param {?string} value
     * @returns {string}
     */
  }, {
    key: 'format',
    value: function format(value) {
      if (!value) {
        return '';
      }

      var month = value.month;
      var year = value.year;

      year = year % 100;

      return _get(Object.getPrototypeOf(ExpiryDateFormatter.prototype), 'format', this).call(this, (0, _utils.zpad2)(month) + (0, _utils.zpad2)(year));
    }

    /**
     * Parses the given text
     *
     * @param {string} text
     * @param {Function(string)} error
     * @returns {?Object} { month: month, year: year }
     */
  }, {
    key: 'parse',
    value: function parse(text, error) {
      var monthAndYear = text.split(this.delimiter);
      var month = monthAndYear[0];
      var year = monthAndYear[1];
      if (month && month.match(/^(0?[1-9]|1\d)$/) && year && year.match(/^\d\d?$/)) {
        month = Number(month);
        year = interpretTwoDigitYear(Number(year));
        return { month: month, year: year };
      } else {
        if (typeof error === 'function') {
          error('expiry-date-formatter.invalid-date');
        }
        return null;
      }
    }

    /**
     * Determines whether the given change should be allowed and, if so, whether
     * it should be altered.
     *
     * @param {TextFieldStateChange} change
     * @param {function(string)} error
     * @returns {boolean}
     */
  }, {
    key: 'isChangeValid',
    value: function isChangeValid(change, error) {
      if (!error) {
        error = function () {};
      }

      var isBackspace = change.proposed.text.length < change.current.text.length;
      var newText = change.proposed.text;

      if (isBackspace) {
        if (change.deleted.text === this.delimiter) {
          newText = newText[0];
        }
        if (newText === '0') {
          newText = '';
        }
        if (change.inserted.text.length > 0 && !/^\d$/.test(change.inserted.text)) {
          error('expiry-date-formatter.only-digits-allowed');
          return false;
        }
      } else if (change.inserted.text === this.delimiter && change.current.text === '1') {
        newText = '01' + this.delimiter;
      } else if (change.inserted.text.length > 0 && !/^\d$/.test(change.inserted.text)) {
        error('expiry-date-formatter.only-digits-allowed');
        return false;
      } else {
        // 4| -> 04|
        if (/^[2-9]$/.test(newText)) {
          newText = '0' + newText;
        }

        // 15| -> 1|
        if (/^1[3-9]$/.test(newText)) {
          error('expiry-date-formatter.invalid-month');
          return false;
        }

        // Don't allow 00
        if (newText === '00') {
          error('expiry-date-formatter.invalid-month');
          return false;
        }

        // 11| -> 11/
        if (/^(0[1-9]|1[0-2])$/.test(newText)) {
          newText += this.delimiter;
        }

        var match = newText.match(/^(\d\d)(.)(\d\d?).*$/);
        if (match && match[2] === this.delimiter) {
          newText = match[1] + this.delimiter + match[3];
        }
      }

      change.proposed.text = newText;
      change.proposed.selectedRange = { start: newText.length, length: 0 };

      return true;
    }
  }]);

  return ExpiryDateFormatter;
})(_delimited_text_formatter2['default']);

exports['default'] = ExpiryDateFormatter;
module.exports = exports['default'];