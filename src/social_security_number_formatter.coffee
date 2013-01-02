DelimitedTextFormatter = require './delimited_text_formatter'

class SocialSecurityNumberFormatter extends DelimitedTextFormatter
  delimiter: '-'
  maximumLength: 9 + 2

  hasDelimiterAtIndex: (index) ->
    index in [3, 6]

  isChangeValid: (change) ->
    if /^\d*$/.test change.inserted.text
      super change
    else
      return no

module.exports = SocialSecurityNumberFormatter
