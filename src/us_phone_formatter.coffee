DelimitedTextFormatter = require './delimited_text_formatter'

# (415) 555-1212
UsPhoneDelimiter =
  0: '('
  4: ')'
  5: ' '
  9: '-'

class UsPhoneFormatter extends DelimitedTextFormatter
  maximumLength: 10 + 4

  constructor: ->
    if arguments.length isnt 0
      throw new Error("were you trying to set a delimiter (#{arguments[0]})?")

  isDelimiter: (chr) ->
    chr in for index, delimiter of UsPhoneDelimiter
      delimiter

  delimiterAt: (index) ->
    UsPhoneDelimiter[index]

  hasDelimiterAtIndex: (index) ->
    @delimiterAt(index)?

  isChangeValid: (change, error) ->
    if /^\d*$/.test change.inserted.text
      super change, error
    else
      return no

module.exports = UsPhoneFormatter
