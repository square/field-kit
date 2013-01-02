DelimitedTextFormatter = require './delimited_text_formatter'

class DefaultCardFormatter extends DelimitedTextFormatter
  delimiter: ' '
  maximumLength: 16 + 3

  hasDelimiterAtIndex: (index) ->
    index in [4, 9, 14]

  parse: (text) ->
    super (text ? '').replace(/[^\d]/g, '')

module.exports = DefaultCardFormatter
