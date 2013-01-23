AdaptiveCardFormatter = require '../lib/adaptive_card_formatter'
CardTextField = require '../lib/card_text_field'
{buildField} = require './helpers/builders'

describe 'CardTextField', ->
  textField = null

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
