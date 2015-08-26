/**
 * Base class providing basic formatting, parsing, and change validation to be
 * customized in subclasses.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Formatter = (function () {
  function Formatter() {
    _classCallCheck(this, Formatter);
  }

  _createClass(Formatter, [{
    key: 'format',

    /**
     * @param {string} text
     * @returns {string}
     */
    value: function format(text) {
      if (text === undefined || text === null) {
        text = '';
      }
      if (this.maximumLength !== undefined && this.maximumLength !== null) {
        text = text.substring(0, this.maximumLength);
      }
      return text;
    }

    /**
     * @param {string} text
     * @returns {string}
     */
  }, {
    key: 'parse',
    value: function parse(text) {
      if (text === undefined || text === null) {
        text = '';
      }
      if (this.maximumLength !== undefined && this.maximumLength !== null) {
        text = text.substring(0, this.maximumLength);
      }
      return text;
    }

    /**
     * Determines whether the given change should be allowed and, if so, whether
     * it should be altered.
     *
     * @param {TextFieldStateChange} change
     * @returns {boolean}
     */
  }, {
    key: 'isChangeValid',
    value: function isChangeValid(change) {
      var selectedRange = change.proposed.selectedRange;
      var text = change.proposed.text;
      if (this.maximumLength !== undefined && this.maximumLength !== null && text.length > this.maximumLength) {
        var available = this.maximumLength - (text.length - change.inserted.text.length);
        var newText = change.current.text.substring(0, change.current.selectedRange.start);
        if (available > 0) {
          newText += change.inserted.text.substring(0, available);
        }
        newText += change.current.text.substring(change.current.selectedRange.start + change.current.selectedRange.length);
        var truncatedLength = text.length - newText.length;
        change.proposed.text = newText;
        selectedRange.start -= truncatedLength;
      }
      return true;
    }
  }]);

  return Formatter;
})();

exports['default'] = Formatter;
module.exports = exports['default'];