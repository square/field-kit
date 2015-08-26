'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _text_field = require('./text_field');

var _text_field2 = _interopRequireDefault(_text_field);

var _adaptive_card_formatter = require('./adaptive_card_formatter');

var _adaptive_card_formatter2 = _interopRequireDefault(_adaptive_card_formatter);

var _card_utils = require('./card_utils');

/**
 * Enum for card mask strategies.
 *
 * @readonly
 * @enum {number}
 * @private
 */
var CardMaskStrategy = {
  None: 'None',
  DoneEditing: 'DoneEditing'
};

/**
 * CardTextField add some functionality for credit card inputs
 *
 * @extends TextField
 */

var CardTextField = (function (_TextField) {
  _inherits(CardTextField, _TextField);

  /**
   * @param {HTMLElement} element
   */

  function CardTextField(element) {
    _classCallCheck(this, CardTextField);

    _get(Object.getPrototypeOf(CardTextField.prototype), 'constructor', this).call(this, element, new _adaptive_card_formatter2['default']());
    this.setCardMaskStrategy(CardMaskStrategy.None);

    /**
     * Whether we are currently masking the displayed text.
     *
     * @private
     */
    this._masked = false;

    /**
     * Whether we are currently editing.
     *
     * @private
     */
    this._editing = false;
  }

  /**
   * Gets the card type for the current value.
   *
   * @returns {string} Returns one of 'visa', 'mastercard', 'amex' and 'discover'.
   */

  _createClass(CardTextField, [{
    key: 'cardType',
    value: function cardType() {
      return (0, _card_utils.determineCardType)(this.value());
    }

    /**
     * Gets the type of masking this field uses.
     *
     * @returns {CardMaskStrategy}
     */
  }, {
    key: 'cardMaskStrategy',
    value: function cardMaskStrategy() {
      return this._cardMaskStrategy;
    }

    /**
     * Sets the type of masking this field uses.
     *
     * @param {CardMaskStrategy} cardMaskStrategy One of CardMaskStrategy.
     */
  }, {
    key: 'setCardMaskStrategy',
    value: function setCardMaskStrategy(cardMaskStrategy) {
      if (cardMaskStrategy !== this._cardMaskStrategy) {
        this._cardMaskStrategy = cardMaskStrategy;
        this._syncMask();
      }
    }

    /**
     * Returns a masked version of the current formatted PAN. Example:
     *
     * @example
     *     field.setText('4111 1111 1111 1111');
     *     field.cardMask(); // "•••• •••• •••• 1111"
     *
     * @returns {string} Returns a masked card string.
     */
  }, {
    key: 'cardMask',
    value: function cardMask() {
      var text = this.text();
      var toMask = text.slice(0, -4);
      var last4 = text.slice(-4);

      return toMask.replace(/\d/g, '•') + last4;
    }

    /**
     * Gets the formatted PAN for this field.
     *
     * @returns {string}
     */
  }, {
    key: 'text',
    value: function text() {
      if (this._masked) {
        return this._unmaskedText;
      } else {
        return _get(Object.getPrototypeOf(CardTextField.prototype), 'text', this).call(this);
      }
    }

    /**
     * Sets the formatted PAN for this field.
     *
     * @param {string} text A formatted PAN.
     */
  }, {
    key: 'setText',
    value: function setText(text) {
      if (this._masked) {
        this._unmaskedText = text;
        text = this.cardMask();
      }
      _get(Object.getPrototypeOf(CardTextField.prototype), 'setText', this).call(this, text);
    }

    /**
     * Called by our superclass, used to implement card masking.
     *
     * @private
     */
  }, {
    key: 'textFieldDidEndEditing',
    value: function textFieldDidEndEditing() {
      this._editing = false;
      this._syncMask();
    }

    /**
     * Called by our superclass, used to implement card masking.
     *
     * @private
     */
  }, {
    key: 'textFieldDidBeginEditing',
    value: function textFieldDidBeginEditing() {
      this._editing = true;
      this._syncMask();
    }

    /**
     * Enables masking if it is not already enabled.
     *
     * @private
     */
  }, {
    key: '_enableMasking',
    value: function _enableMasking() {
      if (!this._masked) {
        this._unmaskedText = this.text();
        this._masked = true;
        this.setText(this._unmaskedText);
      }
    }

    /**
     * Disables masking if it is currently enabled.
     *
     * @private
     */
  }, {
    key: '_disableMasking',
    value: function _disableMasking() {
      if (this._masked) {
        this._masked = false;
        this.setText(this._unmaskedText);
        this._unmaskedText = null;
      }
    }

    /**
     * Enables or disables masking based on the mask settings.
     *
     * @private
     */
  }, {
    key: '_syncMask',
    value: function _syncMask() {
      if (this.cardMaskStrategy() === CardMaskStrategy.DoneEditing) {
        if (this._editing) {
          this._disableMasking();
        } else {
          this._enableMasking();
        }
      }
    }

    /**
     * Enum for card mask strategies.
     *
     * @readonly
     * @enum {number}
     */
  }], [{
    key: 'CardMaskStrategy',
    get: function get() {
      return CardMaskStrategy;
    }
  }]);

  return CardTextField;
})(_text_field2['default']);

exports['default'] = CardTextField;
module.exports = exports['default'];