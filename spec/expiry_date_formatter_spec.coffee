ExpiryDateFormatter = require '../lib/expiry_date_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

describe 'ExpiryDateFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.formatter = new ExpiryDateFormatter()

  it 'adds a preceding zero and a succeeding slash if an unambiguous month is typed', ->
    expectThatTyping('4').into(field).willChange('|').to('04/|')

  it 'does not add anything when the typed first character is an ambiguous month', ->
    expectThatTyping('1').into(field).willChange('|').to('1|')

  it 'adds a slash after a two-digit month is typed', ->
    expectThatTyping('0').into(field).willChange('1|').to('10/|')
    expectThatTyping('7').into(field).willChange('0|').to('07/|')

  it 'adds a preceding zero when a slash is typed after an ambiguous month', ->
    expectThatTyping('/').into(field).willChange('1|').to('01/|')

  it 'prevents entry of an invalid two-digit month', ->
    expectThatTyping('3').into(field).willNotChange('1|')

  it 'prevents entry of an additional slash', ->
    expectThatTyping('/').into(field).willNotChange('11/|')

  it 'allows any two digits for the year', ->
    expectThatTyping('0', '9', '8').into(field).willChange('11/|').to('11/09|')

  it 'allows backspacing ignoring the slash', ->
    expectThatTyping('backspace').into(field).willChange('11/|').to('1|')

  it 'allows backspacing words to delete just the year', ->
    expectThatTyping('alt+backspace').into(field).willChange('11/14|').to('11/|')

  it 'backspaces to the beginning if the last character after backspacing is 0', ->
    expectThatTyping('backspace').into(field).willChange('01/|').to('|')

  it 'allows typing a character matching the suffix that hits the end of the allowed input', ->
    expectThatTyping('1').into(field).willChange('12/1|').to('12/11|')
