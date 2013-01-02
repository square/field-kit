DefaultCardFormatter = require './default_card_formatter'

class AmexCardFormatter extends DefaultCardFormatter
  maximumLength: 15 + 2

  hasDelimiterAtIndex: (index) ->
    index in [4, 11]

module.exports = AmexCardFormatter
