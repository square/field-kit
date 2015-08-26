'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _amex_card_formatter = require('./amex_card_formatter');

var _amex_card_formatter2 = _interopRequireDefault(_amex_card_formatter);

var _default_card_formatter = require('./default_card_formatter');

var _default_card_formatter2 = _interopRequireDefault(_default_card_formatter);

var _card_utils = require('./card_utils');

/**
 * AdaptiveCardFormatter will decide if it needs to use
 * {@link AmexCardFormatter} or {@link DefaultCardFormatter}.
 */

var AdaptiveCardFormatter = (function () {
  function AdaptiveCardFormatter() {
    _classCallCheck(this, AdaptiveCardFormatter);

    /** @private */
    this.amexCardFormatter = new _amex_card_formatter2['default']();
    /** @private */
    this.defaultCardFormatter = new _default_card_formatter2['default']();
    /** @private */
    this.formatter = this.defaultCardFormatter;
  }

  /**
   * Will pick the right formatter based on the `pan` and will return the
   * formatted string.
   *
   * @param {string} pan
   * @returns {string} formatted string
   */

  _createClass(AdaptiveCardFormatter, [{
    key: 'format',
    value: function format(pan) {
      return this._formatterForPan(pan).format(pan);
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
      return this.formatter.parse(text, error);
    }

    /**
     * Determines whether the given change should be allowed and, if so, whether
     * it should be altered.
     *
     * @param {TextFieldStateChange} change
     * @param {function(!string)} error
     * @returns {boolean}
     */
  }, {
    key: 'isChangeValid',
    value: function isChangeValid(change, error) {
      this.formatter = this._formatterForPan(change.proposed.text);
      return this.formatter.isChangeValid(change, error);
    }

    /**
     * Decides which formatter to use.
     *
     * @param {string} pan
     * @returns {Formatter}
     * @private
     */
  }, {
    key: '_formatterForPan',
    value: function _formatterForPan(pan) {
      if ((0, _card_utils.determineCardType)(pan.replace(/[^\d]+/g, '')) === _card_utils.AMEX) {
        return this.amexCardFormatter;
      } else {
        return this.defaultCardFormatter;
      }
    }
  }]);

  return AdaptiveCardFormatter;
})();

exports['default'] = AdaptiveCardFormatter;
module.exports = exports['default'];