AmexCardFormatter = require './amex_card_formatter'
DefaultCardFormatter = require './default_card_formatter'
{ determineCardType, AMEX } = require './card_utils'

class AdaptiveCardFormatter
  constructor: ->
    @amexCardFormatter = new AmexCardFormatter()
    @defaultCardFormatter = new DefaultCardFormatter()
    @formatter = @defaultCardFormatter

  format: (pan) ->
    @_formatterForPan(pan).format pan

  parse: (text, error) ->
    @formatter.parse text, error

  isChangeValid: (change) ->
    @formatter = @_formatterForPan(change.proposed.text)
    @formatter.isChangeValid(change)

  _formatterForPan: (pan) ->
    if determineCardType(pan.replace(/[^\d]+/g, '')) is AMEX
      @amexCardFormatter
    else
      @defaultCardFormatter

module.exports = AdaptiveCardFormatter
