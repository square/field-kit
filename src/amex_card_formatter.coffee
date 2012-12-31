if require?
  DefaultCardFormatter = require './default_card_formatter'
else
  {DefaultCardFormatter} = @FieldKit

class AmexCardFormatter extends DefaultCardFormatter
  maximumLength: 15 + 2

  hasDelimiterAtIndex: (index) ->
    index in [4, 11]

if module?
  module.exports = AmexCardFormatter
else
  (@FieldKit ||= {}).AmexCardFormatter = AmexCardFormatter
