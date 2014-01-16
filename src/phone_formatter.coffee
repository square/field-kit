DelimitedTextFormatter = require './delimited_text_formatter'

# (415) 555-1212
NANP_PHONE_DELIMITERS =
  0: '('
  4: ')'
  5: ' '
  9: '-'

# 1 (415) 555-1212
NANP_PHONE_DELIMITERS_WITH_1 =
  1:  ' '
  2:  '('
  6:  ')'
  7:  ' '
  11: '-'

# +1 (415) 555-1212
NANP_PHONE_DELIMITERS_WITH_PLUS =
  2:  ' '
  3:  '('
  7:  ')'
  8:  ' '
  12: '-'

# This should match any characters in the maps above.
DELIMITER_PATTERN = /[-\(\) ]/g

class PhoneFormatter extends DelimitedTextFormatter
  maximumLength: null
  delimiterMap: null

  constructor: ->
    if arguments.length isnt 0
      throw new Error("were you trying to set a delimiter (#{arguments[0]})?")

  isDelimiter: (chr) ->
    chr in for index, delimiter of @delimiterMap
      delimiter

  delimiterAt: (index) ->
    @delimiterMap[index]

  hasDelimiterAtIndex: (index) ->
    @delimiterAt(index)?

  parse: (text, error) ->
    digits = @digitsWithoutCountryCode text
    # Source: http://en.wikipedia.org/wiki/North_American_Numbering_Plan
    #
    # Area Code
    error? 'phone-formatter.number-too-short' unless text.length >= 10
    error? 'phone-formatter.area-code-zero' unless digits[0] isnt '0'
    error? 'phone-formatter.area-code-one' unless digits[0] isnt '1'
    error? 'phone-formatter.area-code-n9n' unless digits[1] isnt '9'
    # Central Office Code
    error? 'phone-formatter.central-office-one' unless digits[3] isnt '1'
    error? 'phone-formatter.central-office-n11' unless digits[4..5] isnt '11'
    super text, error

  format: (value) ->
    @guessFormatFromText value
    super @removeDelimiterMapChars(value)

  isChangeValid: (change, error) ->
    @guessFormatFromText change.proposed.text

    if change.inserted.text.length > 1
      # handle pastes
      { text, selectedRange } = change.current
      toInsert = change.inserted.text

      # Replace the selection with the new text, remove non-digits, then format.
      formatted = @format((
        text.slice(0, selectedRange.start) +
        toInsert +
        text.slice(selectedRange.start+selectedRange.length)
      ).replace(/[^\d]/g, ''))

      change.proposed =
        text: formatted
        selectedRange:
          start: formatted.length - (text.length - (selectedRange.start + selectedRange.length))
          length: 0

      return super(change, error)

    if /^\d*$/.test(change.inserted.text) or change.proposed.text.indexOf('+') is 0
      super change, error
    else
      return no

  # Internal: Re-configures this formatter to use the delimiters appropriate
  # for the given text.
  #
  # text - A potentially formatted string containing a phone number.
  #
  # Returns nothing.
  guessFormatFromText: (text) ->
    if text?[0] is '+'
      @delimiterMap = NANP_PHONE_DELIMITERS_WITH_PLUS
      @maximumLength = 1 + 1 + 10 + 5
    else if text?[0] is '1'
      @delimiterMap = NANP_PHONE_DELIMITERS_WITH_1
      @maximumLength = 1 + 10 + 5
    else
      @delimiterMap = NANP_PHONE_DELIMITERS
      @maximumLength = 10 + 4

  # Internal: Gives back just the phone number digits as a string without the
  # country code. Future-proofing internationalization where the country code
  # isn't just +1.
  digitsWithoutCountryCode: (text) ->
    digits = (text ? '').replace(/[^\d]/g, '')
    extraDigits = digits.length - 10
    if extraDigits > 0
      digits = digits.substr(extraDigits)
    return digits

  # Internal: Removes characters from the phone number that will be added
  # by the formatter.
  removeDelimiterMapChars: (text) ->
    (text ? '').replace(DELIMITER_PATTERN, '')

module.exports = PhoneFormatter
