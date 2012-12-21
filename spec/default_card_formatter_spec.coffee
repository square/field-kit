DefaultCardFormatter = require '../lib/default_card_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

describe 'DefaultCardFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.formatter = new DefaultCardFormatter()

  it 'adds a space after the first four digits', ->
    expectThatTyping('1').into(field).willChange('411|').to('4111 |')

  it 'groups digits into four groups of four separated by spaces', ->
    expectThatTyping('4111111111111111'.split('')...).into(field).willChange('|').to('4111 1111 1111 1111|')

  it 'backspaces both the space and the character before it', ->
    expectThatTyping('backspace').into(field).willChange('4111 |').to('411|')

  it 'allows backspacing a whole group of digits', ->
    expectThatTyping('alt+backspace').into(field).willChange('4111 1111 |').to('4111 |')

  it 'prevents adding more than 16 digits', ->
    expectThatTyping('8').into(field).willNotChange('4111 1111 1111 1111|')
