import TextField from './text_field';
import AdaptiveCardFormatter from './adaptive_card_formatter';
import { determineCardType } from './card_utils';

/**
 * Enum for card mask strategies.
 *
 * @readonly
 * @enum {number}
 * @private
 */
const CardMaskStrategy = {
  None: 'None',
  DoneEditing: 'DoneEditing'
};

/**
 * CardTextField add some functionality for credit card inputs
 *
 * @extends TextField
 */
class CardTextField extends TextField {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    super(element, new AdaptiveCardFormatter());
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
  cardType() {
    return determineCardType(this.value());
  }

  /**
   * Gets the type of masking this field uses.
   *
   * @returns {CardMaskStrategy}
   */
  cardMaskStrategy() {
    return this._cardMaskStrategy;
  }

  /**
   * Sets the type of masking this field uses.
   *
   * @param {CardMaskStrategy} cardMaskStrategy One of CardMaskStrategy.
   */
  setCardMaskStrategy(cardMaskStrategy) {
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
  cardMask() {
    const text   = this.text();
    const last4  = text.slice(-4);
    let toMask = text.slice(0, -4);

    return toMask.replace(/\d/g, '•') + last4;
  }

  /**
   * Gets the formatted PAN for this field.
   *
   * @returns {string}
   */
  text() {
    if (this._masked) {
      return this._unmaskedText;
    } else {
      return super.text();
    }
  }

  /**
   * Sets the formatted PAN for this field.
   *
   * @param {string} text A formatted PAN.
   */
  setText(text) {
    if (this._masked) {
      this._unmaskedText = text;
      text = this.cardMask();
    }
    super.setText(text);
  }

  /**
   * Called by our superclass, used to implement card masking.
   *
   * @private
   */
  textFieldDidEndEditing() {
    this._editing = false;
    this._syncMask();
  }

  /**
   * Called by our superclass, used to implement card masking.
   *
   * @private
   */
  textFieldDidBeginEditing() {
    this._editing = true;
    this._syncMask();
  }

  /**
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

  /**
   * Enum for card mask strategies.
   *
   * @readonly
   * @enum {number}
   */
  static get CardMaskStrategy() {
    return CardMaskStrategy;
  }
}

export default CardTextField;
