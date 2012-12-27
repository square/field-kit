AdaptiveCardFormatter = require '../lib/adaptive_card_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

describe 'AdaptiveCardFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.formatter = new AdaptiveCardFormatter()

  it 'formats as Visa once it can tell it is a Visa card', ->
    expectThatTyping('4111111'.split('')...).into(field).willChange('|').to('4111 111|')

  it 'formats as Amex once it can tell it is an Amex card', ->
    expectThatTyping('372512345678901'.split('')...).into(field).willChange('|').to('3725 123456 78901|')

  it 'formats it as the default if it cannot tell what it is', ->
    expectThatTyping('1111111'.split('')...).into(field).willChange('|').to('1111 111|')
