DelimitedTextFormatter         = require './delimited_text_formatter'
{ validCardLength, luhnCheck } = require './card_utils'

class DefaultCardFormatter extends DelimitedTextFormatter
  delimiter: ' '
  maximumLength: 16 + 3

  hasDelimiterAtIndex: (index) ->
    index in [4, 9, 14]

  parse: (text, error) ->
    value = @_valueFromText(text)
    error? 'card-formatter.number-too-short' unless validCardLength value
    error? 'card-formatter.invalid-number' unless luhnCheck value
    super text, error

  _valueFromText: (text) ->
    super (text ? '').replace(/[^\d]/g, '')

module.exports = DefaultCardFormatter
