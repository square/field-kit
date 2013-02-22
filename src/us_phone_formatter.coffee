DelimitedTextFormatter = require './delimited_text_formatter'

class UsPhoneFormatter extends DelimitedTextFormatter
  # (415) 555-1212
  delimiterHash:
    0: '('
    4: ')'
    5: ' '
    9: '-'

  isDelimiter: (char) ->
    char in for index, delimiter of @delimiterHash
      delimiter

  constructor: ->

  delimiterAt: (index) ->
    @delimiterHash[index] || ''

  hasDelimiterAtIndex: (index) ->
    !!@delimiterAt(index)

module.exports = UsPhoneFormatter
