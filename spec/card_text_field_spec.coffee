AdaptiveCardFormatter = require '../lib/adaptive_card_formatter'
CardTextField         = require '../lib/card_text_field'
{buildField}          = require './helpers/builders'
{type}                = require './helpers/typing'
{expectThatTyping}    = require './helpers/expectations'

describe 'CardTextField', ->
  textField = null
  visa = '4111 1111 1111 1111'

  beforeEach ->
    textField = buildField CardTextField

  it 'uses an adaptive card formatter by default', ->
    expect(textField.formatter()).toBeAnInstanceOf(AdaptiveCardFormatter)

  describe '#cardType', ->
    it 'is VISA when the card number starts with 4', ->
      textField.setValue('4')
      expect(textField.cardType()).toEqual('visa')

    it 'is DISCOVER when the card number matches', ->
      textField.setValue('6011')
      expect(textField.cardType()).toEqual('discover')

    it 'is MASTERCARD when the card number matches', ->
      textField.setValue('51')
      expect(textField.cardType()).toEqual('mastercard')

    it 'is AMEX when the card number matches', ->
      textField.setValue('34')
      expect(textField.cardType()).toEqual('amex')

  describe '#cardMaskStrategy', ->
    describe 'when set to None (the default)', ->
      beforeEach ->
        textField.setCardMaskStrategy(CardTextField.CardMaskStrategy.None)

      it 'does not change the displayed card number on end editing', ->
        textField.textFieldDidBeginEditing()
        type(visa).into(textField)
        textField.textFieldDidEndEditing()
        expect(textField.element.val()).toEqual(visa)

    describe 'when set to DoneEditing', ->
      beforeEach ->
        textField.setCardMaskStrategy(CardTextField.CardMaskStrategy.DoneEditing)

      it 'does not change the displayed card number while typing', ->
        textField.textFieldDidBeginEditing()
        type(visa).into(textField)
        expect(textField.element.val()).toEqual(visa)

      it 'masks the displayed card number on end editing', ->
        textField.textFieldDidBeginEditing()
        type(visa).into(textField)
        textField.textFieldDidEndEditing()
        expect(textField.element.val()).toEqual('•••• •••• •••• 1111')

      it 'does not change the selected range on end editing', ->
        textField.textFieldDidBeginEditing()
        type(visa).into(textField)
        expectThatTyping('enter').into(textField).willChange("|#{visa}>").to('|•••• •••• •••• 1111>')

      it 'restores the original value on beginning editing', ->
        textField.textFieldDidBeginEditing()
        type(visa).into(textField)
        textField.textFieldDidEndEditing()
        textField.textFieldDidBeginEditing()
        expect(textField.element.val()).toEqual(visa)

      it 'masks when a value is set before editing', ->
        textField.setValue('1234567890123456')
        expect(textField.element.val()).toEqual('•••• •••• •••• 3456')

      # it 'restores the original value when disabling masking', ->
      #   textField.textFieldDidEndEditing()
      #   textField.setCardMaskStrategy(CardTextField.CardMaskStrategy.None)
      #   expect(textField.element.val()).toEqual(visa)

      # it 'masks the value when enabling masking', ->
      #   textField.textFieldDidEndEditing()
      #   textField.setCardMaskStrategy(CardTextField.CardMaskStrategy.None)
      #   console.log _masked: textField._masked, _unmaskedText: textField._unmaskedText
      #   textField.setCardMaskStrategy(CardTextField.CardMaskStrategy.DoneEditing)
      #   console.log _masked: textField._masked, _unmaskedText: textField._unmaskedText
      #   expect(textField.element.val()).toEqual('•••• •••• •••• 1111')
