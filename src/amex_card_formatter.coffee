if require?
  DefaultCardFormatter = require './default_card_formatter'
else
  DefaultCardFormatter = @DefaultCardFormatter

AMEX_SPACE_INDEXES = [4, 10]
Object.freeze?(AMEX_SPACE_INDEXES)

class AmexCardFormatter extends DefaultCardFormatter
  cardLength: 15

  constructor: ->
    @spaceIndexes = AMEX_SPACE_INDEXES.slice()

if module?
  module.exports = AmexCardFormatter
else
  @AmexCardFormatter = AmexCardFormatter
