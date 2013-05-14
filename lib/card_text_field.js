(function() {
  var AdaptiveCardFormatter, CardMaskStrategy, CardTextField, TextField, determineCardType,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextField = require('./text_field');

  AdaptiveCardFormatter = require('./adaptive_card_formatter');

  determineCardType = require('./card_utils').determineCardType;

  CardMaskStrategy = {
    None: 'None',
    DoneEditing: 'DoneEditing'
  };

  CardTextField = (function(_super) {
    __extends(CardTextField, _super);

    function CardTextField(element) {
      CardTextField.__super__.constructor.call(this, element, new AdaptiveCardFormatter());
      this.setCardMaskStrategy(CardMaskStrategy.None);
    }

    CardTextField.prototype.cardType = function() {
      return determineCardType(this.value());
    };

    CardTextField.prototype.cardMaskStrategy = function() {
      return this._cardMaskStrategy;
    };

    CardTextField.prototype.setCardMaskStrategy = function(cardMaskStrategy) {
      if (cardMaskStrategy !== this._cardMaskStrategy) {
        this._cardMaskStrategy = cardMaskStrategy;
        this._syncMask();
      }
      return null;
    };

    CardTextField.prototype.cardMask = function() {
      var last4, text, toMask;

      text = this.text();
      toMask = text.slice(0, -4);
      last4 = text.slice(-4);
      return toMask.replace(/\d/g, '•') + last4;
    };

    CardTextField.prototype._masked = false;

    CardTextField.prototype._editing = false;

    CardTextField.prototype.text = function() {
      if (this._masked) {
        return this._unmaskedText;
      } else {
        return CardTextField.__super__.text.call(this);
      }
    };

    CardTextField.prototype.setText = function(text) {
      if (this._masked) {
        this._unmaskedText = text;
        text = this.cardMask();
      }
      return CardTextField.__super__.setText.call(this, text);
    };

    CardTextField.prototype.textFieldDidEndEditing = function() {
      this._editing = false;
      return this._syncMask();
    };

    CardTextField.prototype.textFieldDidBeginEditing = function() {
      this._editing = true;
      return this._syncMask();
    };

    CardTextField.prototype._enableMasking = function() {
      if (!this._masked) {
        this._unmaskedText = this.text();
        this._masked = true;
        return this.setText(this._unmaskedText);
      }
    };

    CardTextField.prototype._disableMasking = function() {
      if (this._masked) {
        this._masked = false;
        this.setText(this._unmaskedText);
        return this._unmaskedText = null;
      }
    };

    CardTextField.prototype._syncMask = function() {
      if (this.cardMaskStrategy() === CardMaskStrategy.DoneEditing) {
        if (this._editing) {
          return this._disableMasking();
        } else {
          return this._enableMasking();
        }
      }
    };

    return CardTextField;

  })(TextField);

  CardTextField.CardMaskStrategy = CardMaskStrategy;

  module.exports = CardTextField;

}).call(this);
