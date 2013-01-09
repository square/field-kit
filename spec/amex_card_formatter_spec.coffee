AmexCardFormatter = require '../lib/amex_card_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

describe 'AmexCardFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.setFormatter new AmexCardFormatter()

  it 'formats Amex card numbers correctly', ->
    expectThatTyping('37251111112000'.split('')...).into(field).willChange('|').to('3725 111111 2000|')

  it 'prevents entering more digits than are allowed', ->
    expectThatTyping('1').into(field).willNotChange('3725 123456 81000|')
