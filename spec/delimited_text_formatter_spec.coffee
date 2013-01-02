DelimitedTextFormatter = require '../lib/delimited_text_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

class ThreeCharsThenDelimiter extends DelimitedTextFormatter
  hasDelimiterAtIndex: (index) ->
    (index + 1) % 4 is 0 # 3, 7, 11, 15, …

describe 'DelimitedTextFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.formatter = new ThreeCharsThenDelimiter('-')

  it 'adds a delimiter wherever they need to be', ->
    expectThatTyping('1').into(field).willChange('41|').to('411-|')

  it 'groups digits into four groups of four separated by spaces', ->
    expectThatTyping('abcdef'.split('')...).into(field).willChange('|').to('abc-def-|')

  it 'backspaces both the space and the character before it', ->
    expectThatTyping('backspace').into(field).willChange('411-|').to('41|')

  it 'allows backspacing a whole group of digits', ->
    expectThatTyping('alt+backspace').into(field).willChange('411-111-|').to('411-|')
    expectThatTyping('alt+backspace').into(field).willChange('411-1|1').to('411-|1')

  it 'allows moving left over a delimiter', ->
    expectThatTyping('left').into(field).willChange('411-|').to('41|1-')

  it 'selects not including delimiters if possible', ->
    expectThatTyping('shift+left').into(field).willChange('411-1<1|').to('411-<11|')
    expectThatTyping('shift+right').into(field).willChange('4|1>1-11').to('4|11>-11')
    expectThatTyping('shift+right').into(field).willChange('4|11>-11').to('4|11-1>1')

  it 'selects past delimiters as if they are not there', ->
    expectThatTyping('shift+left').into(field).willChange('411-|1').to('41<1|-1')
    expectThatTyping('shift+left').into(field).willChange('411-<1|1').to('41<1-1|1')

  it 'prevents entering the delimiter character', ->
    expectThatTyping('-').into(field).willNotChange('123-456-|')
