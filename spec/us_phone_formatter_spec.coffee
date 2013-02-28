UsPhoneFormatter = require '../lib/us_phone_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

describe 'UsPhoneFormatter', ->
  field = null
  formatter = null

  beforeEach ->
    field = buildField()
    formatter = new UsPhoneFormatter()
    field.setFormatter formatter

  it 'does not allow initializing with a delimiter', ->
    expect(-> new UsPhoneFormatter('-')).toThrow()

  it 'adds a ( before the first digit', ->
    expectThatTyping('4').into(field).willChange('|').to('(4|')
    expectThatTyping('1').into(field).willChange('(4|').to('(41|')

  it 'backspaces both the digit leading delimiter', ->
    expectThatTyping('backspace').into(field).willChange('(4|').to('|')

  it 'adds a delimiter wherever they need to be', ->
    expectThatTyping('5').into(field).willChange('(41|').to('(415) |')

  it 'groups digits into four groups of four separated by spaces', ->
    expectThatTyping('415555'.split('')...).into(field).willChange('|').to('(415) 555-|')

  it 'backspaces all delimiters and the character before it', ->
    expectThatTyping('backspace').into(field).willChange('(415) |').to('(41|')
    expectThatTyping('backspace').into(field).willChange('(123) |4 ').to('(12|4) ')

  it 'allows backspacing a whole group of digits', ->
    expectThatTyping('alt+backspace').into(field).willChange('(411) 111-|').to('(411) |')
    expectThatTyping('alt+backspace').into(field).willChange('(411) 1|1').to('(411) |1')

  it 'allows moving left over a delimiter', ->
    expectThatTyping('left').into(field).willChange('(411) |').to('(41|1) ')

  it 'selects not including delimiters if possible', ->
    expectThatTyping('shift+left').into(field).willChange('(411) 1<1|').to('(411) <11|')
    expectThatTyping('shift+right').into(field).willChange('(4|1>1) 11').to('(4|11>) 11')
    expectThatTyping('shift+right').into(field).willChange('(4|11>) 11').to('(4|11) 1>1')

  it 'selects past delimiters as if they are not there', ->
    expectThatTyping('shift+left').into(field).willChange('(411) |1').to('(41<1|) 1')
    expectThatTyping('shift+left').into(field).willChange('(411) <1|1').to('(41<1) 1|1')

  it 'prevents entering the delimiter character', ->
    expectThatTyping('(').into(field).willNotChange('(|')
    expectThatTyping(' ').into(field).willNotChange('(123) |')
    expectThatTyping('-').into(field).willNotChange('(123) 456-|')

  it 'only allows digits', ->
    expectThatTyping('a').into(field).willNotChange('|')

  it 'does not allow more than 10 digits', ->
    expectThatTyping('3').into(field).willNotChange('(415) 555-1212|')
