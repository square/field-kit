AmexCardFormatter = require '../lib/amex_card_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

describe 'AmexCardFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.formatter = new AmexCardFormatter()

  it 'formats Amex card numbers correctly', ->
    expectThatTyping('37251111112000'.split('')...).into(field).willChange('|').to('3725 111111 2000|')
