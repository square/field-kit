DelimitedTextFormatter = require '../lib/delimited_text_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

class LeadingDelimiterFormatter extends DelimitedTextFormatter
  hasDelimiterAtIndex: (index) ->
    index % 4 is 0 # 0, 4, 8, 12, …

class ConsecutiveDelimiterFormatter extends DelimitedTextFormatter
  hasDelimiterAtIndex: (index) ->
    index in [0,2,3,6,7]

describe 'LeadingDelimiterFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.setFormatter new LeadingDelimiterFormatter('-')

  it 'adds a delimiter before the first character', ->
    expectThatTyping('1').into(field).willChange('|').to('-1|')
    expectThatTyping('1').into(field).willChange('-2|').to('-21|')

  it 'backspaces both the character leading delimiter', ->
    expectThatTyping('backspace').into(field).willChange('-1|').to('|')

  it 'adds a delimiter wherever they need to be', ->
    expectThatTyping('1').into(field).willChange('-41|').to('-411-|')

  it 'groups digits into four groups of four separated by spaces', ->
    expectThatTyping('abcdef'.split('')...).into(field).willChange('|').to('-abc-def-|')

  it 'backspaces both the space and the character before it', ->
    expectThatTyping('backspace').into(field).willChange('-411-|').to('-41|')
    expectThatTyping('backspace').into(field).willChange('-123-|4').to('-12|4-')

  it 'allows backspacing a whole group of digits', ->
    expectThatTyping('alt+backspace').into(field).willChange('-411-111-|').to('-411-|')
    expectThatTyping('alt+backspace').into(field).willChange('-411-1|1').to('-411-|1')

  it 'allows moving left over a delimiter', ->
    expectThatTyping('left').into(field).willChange('-411-|').to('-41|1-')

  it 'selects not including delimiters if possible', ->
    expectThatTyping('shift+left').into(field).willChange('-411-1<1|').to('-411-<11|')
    expectThatTyping('shift+right').into(field).willChange('-4|1>1-11').to('-4|11>-11')
    expectThatTyping('shift+right').into(field).willChange('-4|11>-11').to('-4|11-1>1')

  it 'selects past delimiters as if they are not there', ->
    expectThatTyping('shift+left').into(field).willChange('-411-|1').to('-41<1|-1')
    expectThatTyping('shift+right').into(field).willChange('-411|-1').to('-411-|1>')
    expectThatTyping('shift+left').into(field).willChange('-411-<1|1').to('-41<1-1|1')

  it 'prevents entering the delimiter character', ->
    expectThatTyping('-').into(field).willNotChange('-123-456-|')

describe 'ConsecutiveDelimiterFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.setFormatter new ConsecutiveDelimiterFormatter('-')

  it 'adds consecutive delimiters where needed', ->
    expectThatTyping('3').into(field).willChange('|').to('-3--|')
    expectThatTyping('3').into(field).willChange('-1--2|').to('-1--23--|')

  it 'backspaces character and all consecutive delimiters', ->
    expectThatTyping('backspace').into(field).willChange('-3--|').to('|')
    expectThatTyping('backspace').into(field).willChange('-1--23--|').to('-1--2|')
