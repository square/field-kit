PhoneFormatter = require '../lib/phone_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping, expectThatPasting} = require './helpers/expectations'
{type} = require './helpers/typing'

describe 'PhoneFormatter', ->
  field = null
  formatter = null

  beforeEach ->
    field = buildField()
    formatter = new PhoneFormatter()
    field.setFormatter formatter

  it 'guesses the format to use when setting a value', ->
    expect(formatter.format('4155551234')).toEqual('(415) 555-1234')
    expect(formatter.format('14155551234')).toEqual('1 (415) 555-1234')
    expect(formatter.format('+14155551234')).toEqual('+1 (415) 555-1234')

  it 'does not allow initializing with a delimiter', ->
    expect(-> new PhoneFormatter('-')).toThrow()

  it 'can strip formatting and remove country code digits', ->
    # Formatting only
    expect(formatter.digitsWithoutCountryCode("(206) 829-0752")).toEqual('2068290752')
    expect(formatter.digitsWithoutCountryCode("206.829.0752")).toEqual('2068290752')
    # Country Code only
    expect(formatter.digitsWithoutCountryCode("12068290752")).toEqual('2068290752')
    expect(formatter.digitsWithoutCountryCode("442068290752")).toEqual('2068290752')  # 2 digit
    # Both formatting and country (dial) code
    expect(formatter.digitsWithoutCountryCode("+44 7570 127892")).toEqual('7570127892')

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

  describe 'acceptance', ->
    it 'can enter and delete a 10 digit number', ->
      expectThatTyping('3').into(field).willChange('|').to('(3|')
      expectThatTyping('1').into(field).willChange('(3|').to('(31|')
      expectThatTyping('4').into(field).willChange('(31|').to('(314) |')
      expectThatTyping('5').into(field).willChange('(314) |').to('(314) 5|')
      expectThatTyping('5').into(field).willChange('(314) 5|').to('(314) 55|')
      expectThatTyping('5').into(field).willChange('(314) 55|').to('(314) 555-|')
      expectThatTyping('1').into(field).willChange('(314) 555-|').to('(314) 555-1|')
      expectThatTyping('2').into(field).willChange('(314) 555-1|').to('(314) 555-12|')
      expectThatTyping('3').into(field).willChange('(314) 555-12|').to('(314) 555-123|')
      expectThatTyping('4').into(field).willChange('(314) 555-123|').to('(314) 555-1234|')

      expectThatTyping('backspace').into(field).willChange('(314) 555-1234|').to('(314) 555-123|')
      expectThatTyping('backspace').into(field).willChange('(314) 555-123|').to('(314) 555-12|')
      expectThatTyping('backspace').into(field).willChange('(314) 555-12|').to('(314) 555-1|')
      expectThatTyping('backspace').into(field).willChange('(314) 555-1|').to('(314) 555-|')
      expectThatTyping('backspace').into(field).willChange('(314) 555-|').to('(314) 55|')
      expectThatTyping('backspace').into(field).willChange('(314) 55|').to('(314) 5|')
      expectThatTyping('backspace').into(field).willChange('(314) 5|').to('(314) |')
      expectThatTyping('backspace').into(field).willChange('(314) |').to('(31|')
      expectThatTyping('backspace').into(field).willChange('(31|').to('(3|')
      expectThatTyping('backspace').into(field).willChange('(3|').to('|')

    it 'can enter and delete an 11-digit number with a leading 1', ->
      expectThatTyping('1').into(field).willChange('|').to('1 (|')
      expectThatTyping('3').into(field).willChange('1 (|').to('1 (3|')
      expectThatTyping('1').into(field).willChange('1 (3|').to('1 (31|')
      expectThatTyping('4').into(field).willChange('1 (31|').to('1 (314) |')
      expectThatTyping('5').into(field).willChange('1 (314) |').to('1 (314) 5|')
      expectThatTyping('5').into(field).willChange('1 (314) 5|').to('1 (314) 55|')
      expectThatTyping('5').into(field).willChange('1 (314) 55|').to('1 (314) 555-|')
      expectThatTyping('1').into(field).willChange('1 (314) 555-|').to('1 (314) 555-1|')
      expectThatTyping('2').into(field).willChange('1 (314) 555-1|').to('1 (314) 555-12|')
      expectThatTyping('3').into(field).willChange('1 (314) 555-12|').to('1 (314) 555-123|')
      expectThatTyping('4').into(field).willChange('1 (314) 555-123|').to('1 (314) 555-1234|')

      expectThatTyping('backspace').into(field).willChange('1 (314) 555-1234|').to('1 (314) 555-123|')
      expectThatTyping('backspace').into(field).willChange('1 (314) 555-123|').to('1 (314) 555-12|')
      expectThatTyping('backspace').into(field).willChange('1 (314) 555-12|').to('1 (314) 555-1|')
      expectThatTyping('backspace').into(field).willChange('1 (314) 555-1|').to('1 (314) 555-|')
      expectThatTyping('backspace').into(field).willChange('1 (314) 555-|').to('1 (314) 55|')
      expectThatTyping('backspace').into(field).willChange('1 (314) 55|').to('1 (314) 5|')
      expectThatTyping('backspace').into(field).willChange('1 (314) 5|').to('1 (314) |')
      expectThatTyping('backspace').into(field).willChange('1 (314) |').to('1 (31|')
      expectThatTyping('backspace').into(field).willChange('1 (31|').to('1 (3|')
      expectThatTyping('backspace').into(field).willChange('1 (3|').to('1 (|')
      expectThatTyping('backspace').into(field).willChange('1 (|').to('|')

    it 'can enter and delete an 11-digit number with a leading +1', ->
      expectThatTyping('+').into(field).willChange('|').to('+|')
      expectThatTyping('1').into(field).willChange('+|').to('+1 (|')
      expectThatTyping('3').into(field).willChange('+1 (|').to('+1 (3|')
      expectThatTyping('1').into(field).willChange('+1 (3|').to('+1 (31|')
      expectThatTyping('4').into(field).willChange('+1 (31|').to('+1 (314) |')
      expectThatTyping('5').into(field).willChange('+1 (314) |').to('+1 (314) 5|')
      expectThatTyping('5').into(field).willChange('+1 (314) 5|').to('+1 (314) 55|')
      expectThatTyping('5').into(field).willChange('+1 (314) 55|').to('+1 (314) 555-|')
      expectThatTyping('1').into(field).willChange('+1 (314) 555-|').to('+1 (314) 555-1|')
      expectThatTyping('2').into(field).willChange('+1 (314) 555-1|').to('+1 (314) 555-12|')
      expectThatTyping('3').into(field).willChange('+1 (314) 555-12|').to('+1 (314) 555-123|')
      expectThatTyping('4').into(field).willChange('+1 (314) 555-123|').to('+1 (314) 555-1234|')

      expectThatTyping('backspace').into(field).willChange('+1 (314) 555-1234|').to('+1 (314) 555-123|')
      expectThatTyping('backspace').into(field).willChange('+1 (314) 555-123|').to('+1 (314) 555-12|')
      expectThatTyping('backspace').into(field).willChange('+1 (314) 555-12|').to('+1 (314) 555-1|')
      expectThatTyping('backspace').into(field).willChange('+1 (314) 555-1|').to('+1 (314) 555-|')
      expectThatTyping('backspace').into(field).willChange('+1 (314) 555-|').to('+1 (314) 55|')
      expectThatTyping('backspace').into(field).willChange('+1 (314) 55|').to('+1 (314) 5|')
      expectThatTyping('backspace').into(field).willChange('+1 (314) 5|').to('+1 (314) |')
      expectThatTyping('backspace').into(field).willChange('+1 (314) |').to('+1 (31|')
      expectThatTyping('backspace').into(field).willChange('+1 (31|').to('+1 (3|')
      expectThatTyping('backspace').into(field).willChange('+1 (3|').to('+1 (|')
      expectThatTyping('backspace').into(field).willChange('+1 (|').to('+|')
      expectThatTyping('backspace').into(field).willChange('+|').to('|')

    it 'can paste a number formatted differently', ->
      expectThatPasting('314-555-1234').into(field).willChange('|').to('(314) 555-1234|')
      expectThatPasting('555').into(field).willChange('(314) |123-4').to('(314) 555-|1234')

  describe 'error checking', ->
    textFieldDidFailToParseString = null

    beforeEach ->
      textFieldDidFailToParseString = jasmine.createSpy('textFieldDidFailToParseString')
      field.setDelegate { textFieldDidFailToParseString }

    it 'fails to parse a number that is too short', ->
      type('206').into(field)
      expect(field.value()).toEqual('206')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '(206) ', 'phone-formatter.number-too-short')

    it 'fails to parse a number when area code starts with zero', ->
      type('062 659 0912').into(field)
      expect(field.value()).toEqual('0626590912')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '(062) 659-0912', 'phone-formatter.area-code-zero')

    it 'fails to parse a number when area code starts with 1', ->
      type('162 659 0912').into(field)
      expect(field.value()).toEqual('1626590912')
      # Note how the +1 country code screws up formatting too
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '1 (626) 590-912', 'phone-formatter.area-code-one')

    it 'fails to parse a number when area code is like N9N', ->
      type('898 659 0912').into(field)
      expect(field.value()).toEqual('8986590912')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '(898) 659-0912', 'phone-formatter.area-code-n9n')

    it 'fails to parse a number when central office code starts with 1', ->
      type('206 123 0912').into(field)
      expect(field.value()).toEqual('2061230912')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '(206) 123-0912', 'phone-formatter.central-office-one')

    it 'fails to parse a number when central office code is like N11', ->
      type('206 911 0912').into(field)
      expect(field.value()).toEqual('2069110912')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '(206) 911-0912', 'phone-formatter.central-office-n11')

    it 'ignores country codes for area code', ->
      type('1 051 659 0712').into(field)  # Area code starts with zero.
      expect(field.value()).toEqual('10516590712')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '1 (051) 659-0712', 'phone-formatter.area-code-zero')

    it 'ignores country codes for central office', ->
      type('1 206 123 0712').into(field)  # Central office code starts with 1
      expect(field.value()).toEqual('12061230712')
      expect(textFieldDidFailToParseString).toHaveBeenCalledWith(field, '1 (206) 123-0712', 'phone-formatter.central-office-one')
