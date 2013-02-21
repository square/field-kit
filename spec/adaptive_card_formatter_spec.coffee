AdaptiveCardFormatter = require '../lib/adaptive_card_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

describe 'AdaptiveCardFormatter', ->
  field = null
  formatter = null

  beforeEach ->
    field = buildField()
    formatter = new AdaptiveCardFormatter()
    field.setFormatter formatter

  describe 'typing', ->
    it 'formats as Visa once it can tell it is a Visa card', ->
      expectThatTyping('4111111').into(field).willChange('|').to('4111 111|')

    it 'formats as Amex once it can tell it is an Amex card', ->
      expectThatTyping('372512345678901').into(field).willChange('|').to('3725 123456 78901|')

    it 'formats it as the default if it cannot tell what it is', ->
      expectThatTyping('1111111').into(field).willChange('|').to('1111 111|')

  describe '#format', ->
    it 'chooses the right formatter', ->
      expect(formatter.format('4111111111111111')).toBe('4111 1111 1111 1111')
      expect(formatter.format('371111111111111')).toBe('3711 111111 11111')
