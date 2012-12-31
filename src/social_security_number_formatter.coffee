if require?
  DelimitedTextFormatter = require './delimited_text_formatter'
else
  {DelimitedTextFormatter} = @FieldKit

class SocialSecurityNumberFormatter extends DelimitedTextFormatter
  delimiter: '-'
  maximumLength: 9 + 2

  hasDelimiterAtIndex: (index) ->
    index in [3, 6]

if module?
  module.exports = SocialSecurityNumberFormatter
else
  (@FieldKit ||= {}).SocialSecurityNumberFormatter = SocialSecurityNumberFormatter
