TextField             = require './text_field'
AdaptiveCardFormatter = require './adaptive_card_formatter'
{ determineCardType } = require './card_utils'

CardMaskStrategy =
  None:         'None'
  DoneEditing:  'DoneEditing'

class CardTextField extends TextField
  constructor: (element) ->
    super element, new AdaptiveCardFormatter()
    @setCardMaskStrategy CardMaskStrategy.None

  # Public: Gets the card type for the current value.
  #
  # Returns one of 'visa', 'mastercard', 'amex' and 'discover'.
  cardType: ->
    determineCardType @value()

  # Public: Gets the type of masking this field uses.
  #
  # Returns one of CardMaskStrategy.
  cardMaskStrategy: ->
    @_cardMaskStrategy

  # Public: Sets the type of masking this field uses.
  #
  # cardMaskStrategy - One of CardMaskStrategy.
  #
  # Returns nothing.
  setCardMaskStrategy: (cardMaskStrategy) ->
    if cardMaskStrategy isnt @_cardMaskStrategy
      @_cardMaskStrategy = cardMaskStrategy
      @_syncMask()

    return null

  # Public: Returns a masked version of the current formatted PAN. Example:
  #
  #   field.setText('4111 1111 1111 1111')
  #   field.cardMask() // "•••• •••• •••• 1111"
  #
  # Returns a masked card string.
  cardMask: ->
    text   = @text()
    toMask = text[0...-4]
    last4  = text[-4..]

    toMask.replace(/\d/g, '•') + last4

  # Internal: Whether we are currently masking the displayed text.
  _masked: no

  # Internal: Whether we are currently editing.
  _editing: no

  # Public: Gets the formatted PAN for this field.
  #
  # Returns a String.
  text: ->
    if @_masked
      @_unmaskedText
    else
      super()

  # Public: Sets the formatted PAN for this field.
  #
  # text - A formatted PAN.
  #
  # Returns nothing.
  setText: (text) ->
    if @_masked
      @_unmaskedText = text
      text = @cardMask()
    super text

  # Internal: Called by our superclass, used to implement card masking.
  #
  # Returns nothing.
  textFieldDidEndEditing: ->
    @_editing = no
    @_syncMask()

  # Internal: Called by our superclass, used to implement card masking.
  #
  # Returns nothing.
  textFieldDidBeginEditing: ->
    @_editing = yes
    @_syncMask()

  # Internal: Enables masking if it is not already enabled.
  _enableMasking: ->
    if not @_masked
      @_unmaskedText = @text()
      @_masked = yes
      @setText @_unmaskedText

  # Internal: Disables masking if it is currently enabled.
  #
  # Returns nothing.
  _disableMasking: ->
    if @_masked
      @_masked = no
      @setText @_unmaskedText
      @_unmaskedText = null

  # Internal: Enables or disables masking based on the mask settings.
  #
  # Returns nothing.
  _syncMask: ->
    if @cardMaskStrategy() is CardMaskStrategy.DoneEditing
      if @_editing
        @_disableMasking()
      else
        @_enableMasking()

CardTextField.CardMaskStrategy = CardMaskStrategy

module.exports = CardTextField
