DefaultCardFormatter = require '../lib/default_card_formatter'
{buildField} = require './helpers/builders'
{type} = require './helpers/typing'
{expectThatTyping} = require './helpers/expectations'

describe 'DefaultCardFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.setFormatter new DefaultCardFormatter()

  it 'adds a space after the first four digits', ->
    expectThatTyping('1').into(field).willChange('411|').to('4111 |')

  it 'groups digits into four groups of four separated by spaces', ->
    expectThatTyping('4111111111111111').into(field).willChange('|').to('4111 1111 1111 1111|')

  it 'prevents entering more digits than are allowed', ->
    expectThatTyping('1').into(field).willNotChange('4111 1111 1111 1111|')

  it 'backspaces both the space and the character before it', ->
    expectThatTyping('backspace').into(field).willChange('4111 |').to('411|')

  it 'allows backspacing a whole group of digits', ->
    expectThatTyping('alt+backspace').into(field).willChange('4111 1111 |').to('4111 |')
    expectThatTyping('alt+backspace').into(field).willChange('4111 1|1').to('4111 |1')

  it 'prevents adding more than 16 digits', ->
    expectThatTyping('8').into(field).willNotChange('4111 1111 1111 1111|')

  it 'allows moving left over a space', ->
    expectThatTyping('left').into(field).willChange('4111 |').to('411|1 ')

  it 'selects not including spaces if possible', ->
    expectThatTyping('shift+left').into(field).willChange('4111 1<1|').to('4111 <11|')
    expectThatTyping('shift+right').into(field).willChange('41|1>1 11').to('41|11> 11')
    expectThatTyping('shift+right').into(field).willChange('41|11> 11').to('41|11 1>1')

  it 'selects past spaces as if they are not there', ->
    expectThatTyping('shift+left').into(field).willChange('4111 |1').to('411<1| 1')
    expectThatTyping('shift+left').into(field).willChange('4111 <1|1').to('411<1 1|1')

  describe 'error checking', ->
    textFieldDidFailToParseString = null

    beforeEach ->
      textFieldDidFailToParseString = jasmine.createSpy('textFieldDidFailToParseString')
      field.setDelegate { textFieldDidFailToParseString }

    it 'fails to parse a number that is too short', ->
      type('4').into(field)
      expect(field.value()).toEqual('4')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '4', 'card-formatter.number-too-short')

    it 'successfully parses a number that is the right length and passes the luhn check', ->
      type('4111 1111 1111 1111').into(field)
      expect(field.value()).toEqual('4111111111111111')
      expect(textFieldDidFailToParseString).not.toHaveBeenCalled()

    it 'fails to parse a number that is the right length but fails the luhn check', ->
      type('4111 1111 1111 1112').into(field)
      expect(field.value()).toEqual('4111111111111112')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '4111 1111 1111 1112', 'card-formatter.invalid-number')

