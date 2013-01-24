AmexCardFormatter = require './amex_card_formatter'
DefaultCardFormatter = require './default_card_formatter'
{ determineCardType, AMEX } = require './card_utils'

class AdaptiveCardFormatter
  constructor: ->
    @amexCardFormatter = new AmexCardFormatter()
    @defaultCardFormatter = new DefaultCardFormatter()
    @formatter = @defaultCardFormatter

  format: (pan) ->
    @formatter.format pan

  parse: (text, error) ->
    @formatter.parse text, error

  isChangeValid: (change) ->
    if determineCardType(change.proposed.text.replace(/[^\d]+/g, '')) is AMEX
      @formatter = @amexCardFormatter
    else
      @formatter = @defaultCardFormatter
    @formatter.isChangeValid(change)

module.exports = AdaptiveCardFormatter
