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

  format: (value) ->
    @guessFormatFromText value
    super value

  isChangeValid: (change, error) ->
    @guessFormatFromText change.proposed.text

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
    if text[0] is '+'
      @delimiterMap = NANP_PHONE_DELIMITERS_WITH_PLUS
      @maximumLength = 1 + 1 + 10 + 5
    else if text[0] is '1'
      @delimiterMap = NANP_PHONE_DELIMITERS_WITH_1
      @maximumLength = 1 + 10 + 5
    else
      @delimiterMap = NANP_PHONE_DELIMITERS
      @maximumLength = 10 + 4

module.exports = PhoneFormatter
