/*! jshint esnext:true, undef:true, unused:true */

import TextField from './text_field';
import AdaptiveCardFormatter from './adaptive_card_formatter';
import { determineCardType } from './card_utils';

/**
 * Enum for Affinity values.
 * @readonly
 * @enum {number}
 */
var CardMaskStrategy = {
  None: 'None',
  DoneEditing: 'DoneEditing'
};

/**
 * - extends [TextField](text_field.md)
 *
 * CardTextField add some functionality for credit card
 * inputs
 *
 * @class CardTextField
 * @extends TextField
 * @public
 */
class CardTextField extends TextField {
  /**
   * @constructor
   * @param {DOMElement} element
   */
  constructor(element) {
    super(element, new AdaptiveCardFormatter());
    this.setCardMaskStrategy(CardMaskStrategy.None);

    /**
     * Whether we are currently masking the displayed text.
     */
    this._masked = false;

    /**
     * Whether we are currently editing.
     */
    this._editing = false;
  }

  /**
   * @method cardType
   *
   * Gets the card type for the current value.
   *
   * @return {String} Returns one of 'visa', 'mastercard', 'amex' and 'discover'.
   * @public
   */
  cardType() {
    return determineCardType(this.value());
  }

  /**
   * @method cardMaskStrategy
   *
   * Gets the type of masking this field uses.
   *
   * @return {CardMaskStrategy}
   * @public
   */
  cardMaskStrategy() {
    return this._cardMaskStrategy;
  }

  /**
   * @method setCardMaskStrategy
   *
   * Sets the type of masking this field uses.
   *
   * @param {CardMaskStrategy} cardMaskStrategy One of CardMaskStrategy.
   * @return null
   * @public
   */
  setCardMaskStrategy(cardMaskStrategy) {
    if (cardMaskStrategy !== this._cardMaskStrategy) {
      this._cardMaskStrategy = cardMaskStrategy;
      this._syncMask();
    }

    return null;
  }

  /**
   * @method cardMask
   *
   * Returns a masked version of the current formatted PAN. Example:
   *
   * ### Example
   *     field.setText('4111 1111 1111 1111');
   *     field.cardMask(); // "•••• •••• •••• 1111"
   *
   * @return {String} Returns a masked card string.
   * @public
   */
  cardMask() {
    var text   = this.text();
    var toMask = text.slice(0, -4);
    var last4  = text.slice(-4);

    return toMask.replace(/\d/g, '•') + last4;
  }

  /**
   * @method text
   *
   * Gets the formatted PAN for this field.
   *
   * @return {String}
   * @public
   */
  text() {
    if (this._masked) {
      return this._unmaskedText;
    } else {
      return super();
    }
  }

  /**
   * @method setText
   *
   * Sets the formatted PAN for this field.
   *
   * @param {String} text A formatted PAN.
   * @public
   */
  setText(text) {
    if (this._masked) {
      this._unmaskedText = text;
      text = this.cardMask();
    }
    super(text);
  }

  /**
   * @method textFieldDidEndEditing
   *
   * Called by our superclass, used to implement card masking.
   *
   * @private
   */
  textFieldDidEndEditing() {
    this._editing = false;
    this._syncMask();
  }

  /**
   * @method textFieldDidBeginEditing
   *
   * Called by our superclass, used to implement card masking.
   *
   * @private
   */
  textFieldDidBeginEditing() {
    this._editing = true;
    this._syncMask();
  }

  /**
   * @method _enableMasking
   *
   * Enables masking if it is not already enabled.
   *
   * @private
   */
  _enableMasking() {
    if (!this._masked) {
      this._unmaskedText = this.text();
      this._masked = true;
      this.setText(this._unmaskedText);
    }
  }

  /**
   * @method _disableMasking
   *
   * Disables masking if it is currently enabled.
   *
   * @private
   */
  _disableMasking() {
    if (this._masked) {
      this._masked = false;
      this.setText(this._unmaskedText);
      this._unmaskedText = null;
    }
  }

  /**
   * @method _syncMask
   *
   * Enables or disables masking based on the mask settings.
   *
   * @private
   */
  _syncMask() {
    if (this.cardMaskStrategy() === CardMaskStrategy.DoneEditing) {
      if (this._editing) {
        this._disableMasking();
      } else {
        this._enableMasking();
      }
    }
  }
}

CardTextField.CardMaskStrategy = CardMaskStrategy;

export default CardTextField;
