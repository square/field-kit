TextField             = require './text_field'
AdaptiveCardFormatter = require './adaptive_card_formatter'
{ determineCardType } = require './card_utils'

class CardTextField extends TextField
  constructor: (element) ->
    super element
    @setFormatter new AdaptiveCardFormatter()

  cardType: ->
    determineCardType @value()

module.exports = CardTextField
