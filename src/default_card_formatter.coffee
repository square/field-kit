if require?
  DelimitedTextFormatter = require './delimited_text_formatter'
else
  {DelimitedTextFormatter} = @FieldKit

class DefaultCardFormatter extends DelimitedTextFormatter
  delimiter: ' '
  maximumLength: 16 + 3

  hasDelimiterAtIndex: (index) ->
    index in [4, 9, 14]

  parse: (text) ->
    super (text ? '').replace(/[^\d]/g, '')

if module?
  module.exports = DefaultCardFormatter
else
  (@FieldKit ||= {}).DefaultCardFormatter = DefaultCardFormatter
