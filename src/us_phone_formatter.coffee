DelimitedTextFormatter = require './delimited_text_formatter'

# (415) 555-1212
US_PHONE_DELIMITERS =
  0: '('
  4: ')'
  5: ' '
  9: '-'

# 1 (415) 555-1212
US_PHONE_DELIMITERS_WITH_1 =
  1:  ' '
  2:  '('
  6:  ')'
  7:  ' '
  11: '-'

# +1 (415) 555-1212
US_PHONE_DELIMITERS_WITH_PLUS =
  2:  ' '
  3:  '('
  7:  ')'
  8:  ' '
  12: '-'

class UsPhoneFormatter extends DelimitedTextFormatter
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

  isChangeValid: (change, error) ->
    if change.proposed.text[0] is '+'
      @delimiterMap = US_PHONE_DELIMITERS_WITH_PLUS
      @maximumLength = 1 + 1 + 10 + 5
    else if change.proposed.text[0] is '1'
      @delimiterMap = US_PHONE_DELIMITERS_WITH_1
      @maximumLength = 1 + 10 + 5
    else
      @delimiterMap = US_PHONE_DELIMITERS
      @maximumLength = 10 + 4

    if /^\d*$/.test(change.inserted.text) or change.proposed.text.indexOf('+') is 0
      super change, error
    else
      return no

module.exports = UsPhoneFormatter
