'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _formatter = require('./formatter');

var _formatter2 = _interopRequireDefault(_formatter);

/**
 * A generic delimited formatter.
 *
 * @extends Formatter
 */

var DelimitedTextFormatter = (function (_Formatter) {
  _inherits(DelimitedTextFormatter, _Formatter);

  /**
   * @param {string=} delimiter
   * @param {boolean=} isLazy
   * @throws {Error} delimiter must have just one character
   */

  function DelimitedTextFormatter(delimiter) {
    var isLazy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    _classCallCheck(this, DelimitedTextFormatter);

    _get(Object.getPrototypeOf(DelimitedTextFormatter.prototype), 'constructor', this).call(this);

    if (arguments.length === 0) {
      return;
    }

    if (delimiter === null || delimiter === undefined || delimiter.length !== 1) {
      throw new Error('delimiter must have just one character');
    }
    this.delimiter = delimiter;

    // If the formatter is lazy, delimiter will not be added until input has gone
    // past the delimiter index. Useful for 'optional' extension, like zip codes.
    // 94103  ->  type '1'  ->  94103-1
    this.isLazy = isLazy;
  }

  /**
   * Determines the delimiter character at the given index.
   *
   * @param {number} index
   * @returns {?string}
   */

  _createClass(DelimitedTextFormatter, [{
    key: 'delimiterAt',
    value: function delimiterAt(index) {
      if (!this.hasDelimiterAtIndex(index)) {
        return null;
      }
      return this.delimiter;
    }

    /**
     * Determines whether the given character is a delimiter.
     *
     * @param {string} chr
     * @returns {boolean}
     */
  }, {
    key: 'isDelimiter',
    value: function isDelimiter(chr) {
      return chr === this.delimiter;
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
      return this._textFromValue(value);
    }

    /**
     * Formats the given value by adding delimiters where needed.
     *
     * @param {?string} value
     * @returns {string}
     * @private
     */
  }, {
    key: '_textFromValue',
    value: function _textFromValue(value) {
      if (!value) {
        return '';
      }

      var result = '';
      var delimiter;
      var maximumLength = this.maximumLength;

      for (var i = 0, l = value.length; i < l; i++) {
        while (delimiter = this.delimiterAt(result.length)) {
          result += delimiter;
        }
        result += value[i];
        if (!this.isLazy) {
          while (delimiter = this.delimiterAt(result.length)) {
            result += delimiter;
          }
        }
      }

      if (maximumLength !== undefined && maximumLength !== null) {
        return result.slice(0, maximumLength);
      } else {
        return result;
      }
    }

    /**
     * Parses the given text by removing delimiters.
     *
     * @param {?string} text
     * @returns {string}
     */
  }, {
    key: 'parse',
    value: function parse(text) {
      return this._valueFromText(text);
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
      if (!text) {
        return '';
      }
      var result = '';
      for (var i = 0, l = text.length; i < l; i++) {
        if (!this.isDelimiter(text[i])) {
          result += text[i];
        }
      }
      return result;
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
      if (!_get(Object.getPrototypeOf(DelimitedTextFormatter.prototype), 'isChangeValid', this).call(this, change, error)) {
        return false;
      }

      var newText = change.proposed.text;
      var range = change.proposed.selectedRange;
      var hasSelection = range.length !== 0;

      var startMovedLeft = range.start < change.current.selectedRange.start;
      var startMovedRight = range.start > change.current.selectedRange.start;
      var endMovedLeft = range.start + range.length < change.current.selectedRange.start + change.current.selectedRange.length;
      var endMovedRight = range.start + range.length > change.current.selectedRange.start + change.current.selectedRange.length;

      var startMovedOverADelimiter = startMovedLeft && this.hasDelimiterAtIndex(range.start) || startMovedRight && this.hasDelimiterAtIndex(range.start - 1);
      var endMovedOverADelimiter = endMovedLeft && this.hasDelimiterAtIndex(range.start + range.length) || endMovedRight && this.hasDelimiterAtIndex(range.start + range.length - 1);

      if (this.isDelimiter(change.deleted.text)) {
        var newCursorPosition = change.deleted.start - 1;
        // delete any immediately preceding delimiters
        while (this.isDelimiter(newText.charAt(newCursorPosition))) {
          newText = newText.substring(0, newCursorPosition) + newText.substring(newCursorPosition + 1);
          newCursorPosition--;
        }
        // finally delete the real character that was intended
        newText = newText.substring(0, newCursorPosition) + newText.substring(newCursorPosition + 1);
      }

      // adjust the cursor / selection
      if (startMovedLeft && startMovedOverADelimiter) {
        // move left over any immediately preceding delimiters
        while (this.delimiterAt(range.start - 1)) {
          range.start--;
          range.length++;
        }
        // finally move left over the real intended character
        range.start--;
        range.length++;
      }

      if (startMovedRight) {
        // move right over any delimiters found on the way, including any leading delimiters
        for (var i = change.current.selectedRange.start; i < range.start + range.length; i++) {
          if (this.delimiterAt(i)) {
            range.start++;
            if (range.length > 0) {
              range.length--;
            }
          }
        }

        while (this.delimiterAt(range.start)) {
          range.start++;
          range.length--;
        }
      }

      if (hasSelection) {
        // Otherwise, the logic for the range start takes care of everything.
        if (endMovedOverADelimiter) {
          if (endMovedLeft) {
            // move left over any immediately preceding delimiters
            while (this.delimiterAt(range.start + range.length - 1)) {
              range.length--;
            }
            // finally move left over the real intended character
            range.length--;
          }

          if (endMovedRight) {
            // move right over any immediately following delimiters
            while (this.delimiterAt(range.start + range.length)) {
              range.length++;
            }
            // finally move right over the real intended character
            range.length++;
          }
        }

        // trailing delimiters in the selection
        while (this.hasDelimiterAtIndex(range.start + range.length - 1)) {
          if (startMovedLeft || endMovedLeft) {
            range.length--;
          } else {
            range.length++;
          }
        }

        while (this.hasDelimiterAtIndex(range.start)) {
          if (startMovedRight || endMovedRight) {
            range.start++;
            range.length--;
          } else {
            range.start--;
            range.length++;
          }
        }
      } else {
        range.length = 0;
      }

      var result = true;

      var value = this._valueFromText(newText, function () {
        result = false;
        error.apply(undefined, arguments);
      });

      if (result) {
        change.proposed.text = this._textFromValue(value);
      }

      return result;
    }
  }]);

  return DelimitedTextFormatter;
})(_formatter2['default']);

exports['default'] = DelimitedTextFormatter;
module.exports = exports['default'];