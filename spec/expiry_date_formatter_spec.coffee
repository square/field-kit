ExpiryDateFormatter = require '../lib/expiry_date_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'
{freeze, reset} = require './helpers/time_helper'

describe 'ExpiryDateFormatter', ->
  field = null
  formatter = null

  beforeEach ->
    field = buildField()
    field.setFormatter formatter = new ExpiryDateFormatter()

  it 'adds a preceding zero and a succeeding slash if an unambiguous month is typed', ->
    expectThatTyping('4').into(field).willChange('|').to('04/|')

  it 'does not add anything when the typed first character is an ambiguous month', ->
    expectThatTyping('1').into(field).willChange('|').to('1|')

  it 'adds a slash after a two-digit month is typed', ->
    expectThatTyping('0').into(field).willChange('1|').to('10/|')
    expectThatTyping('7').into(field).willChange('0|').to('07/|')

  it 'adds a preceding zero when a slash is typed after an ambiguous month', ->
    expectThatTyping('/').into(field).willChange('1|').to('01/|')

  it 'prevents 00 as a month', ->
    expectThatTyping('0').into(field).willNotChange('0|').withError('expiry-date-formatter.invalid-month')

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

  it 'calls its delegate when parsing the text fails', ->
    field.setDelegate(textFieldDidFailToParseString: jasmine.createSpy('textFieldDidFailToParseString'))
    field.setText 'abc'
    expect(field.value()).toBeNull()
    expect(field.delegate().textFieldDidFailToParseString).toHaveBeenCalledWith(field, 'abc', 'expiry-date-formatter.invalid-date')

  describe '#parse', ->
    it 'parses high two digit years as happening in the 20th century', ->
      freeze new Date(2013, 0)
      expect(formatter.parse('04/99')).toEqual(month: 4, year: 1999)
      reset()

    it 'parses low two digit years as happening in the 21st century', ->
      freeze new Date(2013, 0)
      expect(formatter.parse('04/04')).toEqual(month: 4, year: 2004)
      reset()

    it 'when near the end of a century, parses low numbers as the beginning of the next century', ->
      freeze new Date(2099, 0)
      expect(formatter.parse('04/04')).toEqual(month: 4, year: 2104)
      reset()