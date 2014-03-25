var TextField = require('./text_field');
var AdaptiveCardFormatter = require('./adaptive_card_formatter');
var cardUtils = require('./card_utils');

var CardMaskStrategy = {
  None: 'None',
  DoneEditing: 'DoneEditing'
};

function CardTextField(element) {
  TextField.call(this, element, new AdaptiveCardFormatter());
  this.setCardMaskStrategy(CardMaskStrategy.None);
}

CardTextField.prototype = Object.create(TextField.prototype);

/**
 * Gets the card type for the current value.
 *
 * @return {string} Returns one of 'visa', 'mastercard', 'amex' and 'discover'.
 */
CardTextField.prototype.cardType = function() {
  return cardUtils.determineCardType(this.value());
};

/**
 * Gets the type of masking this field uses.
 *
 * @return {CardMaskStrategy}
 */
CardTextField.prototype.cardMaskStrategy = function() {
  return this._cardMaskStrategy;
};

/**
 * Sets the type of masking this field uses.
 *
 * @param {CardMaskStrategy} cardMaskStrategy One of CardMaskStrategy.
 */
CardTextField.prototype.setCardMaskStrategy = function (cardMaskStrategy) {
  if (cardMaskStrategy !== this._cardMaskStrategy) {
    this._cardMaskStrategy = cardMaskStrategy;
    this._syncMask();
  }

  return null;
};

/**
 * Returns a masked version of the current formatted PAN. Example:
 *
 *   field.setText('4111 1111 1111 1111')
 *   field.cardMask() // "•••• •••• •••• 1111"
 *
 * @return {string} Returns a masked card string.
 */
CardTextField.prototype.cardMask = function() {
  var text   = this.text();
  var toMask = text.slice(0, -4);
  var last4  = text.slice(-4);

  return toMask.replace(/\d/g, '•') + last4;
};

/**
 * Whether we are currently masking the displayed text.
 */
CardTextField.prototype._masked = false;

/**
 * Whether we are currently editing.
 */
CardTextField.prototype._editing = false;

/**
 * Gets the formatted PAN for this field.
 *
 * @return {string}
 */
CardTextField.prototype.text = function() {
  if (this._masked) {
    return this._unmaskedText;
  } else {
    return TextField.prototype.text.call(this);
  }
};

/**
 * Sets the formatted PAN for this field.
 *
 * @param {string} text A formatted PAN.
 */
CardTextField.prototype.setText = function(text) {
  if (this._masked) {
    this._unmaskedText = text;
    text = this.cardMask();
  }
  TextField.prototype.setText.call(this, text);
};

/**
 * Called by our superclass, used to implement card masking.
 *
 * @private
 */
CardTextField.prototype.textFieldDidEndEditing = function() {
  this._editing = false;
  this._syncMask();
};

/**
 * Called by our superclass, used to implement card masking.
 *
 * @private
 */
CardTextField.prototype.textFieldDidBeginEditing = function() {
  this._editing = true;
  this._syncMask();
};

/**
 * Enables masking if it is not already enabled.
 *
 * @private
 */
CardTextField.prototype._enableMasking = function() {
  if (!this._masked) {
    this._unmaskedText = this.text();
    this._masked = true;
    this.setText(this._unmaskedText);
  }
};

/**
 * Disables masking if it is currently enabled.
 *
 * @private
 */
CardTextField.prototype._disableMasking = function() {
  if (this._masked) {
    this._masked = false;
    this.setText(this._unmaskedText);
    this._unmaskedText = null;
  }
};

/**
 * Enables or disables masking based on the mask settings.
 *
 * @private
 */
CardTextField.prototype._syncMask = function() {
  if (this.cardMaskStrategy() === CardMaskStrategy.DoneEditing) {
    if (this._editing) {
      this._disableMasking();
    } else {
      this._enableMasking();
    }
  }
};

CardTextField.CardMaskStrategy = CardMaskStrategy;

module.exports = CardTextField;
