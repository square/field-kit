AmexCardFormatter = require './amex_card_formatter'
DefaultCardFormatter = require './default_card_formatter'

AMEX        = 'amex'
DISCOVER    = 'discover'
MASTERCARD  = 'mastercard'
VISA        = 'visa'

determineCardType = (pan) ->
  return null unless pan?

  pan = pan.toString()
  firsttwo = parseInt(pan.slice(0, 2), 10)
  iin = parseInt(pan.slice(0, 6), 10)
  halfiin = parseInt(pan.slice(0, 3), 10)

  if pan[0] is '4'
    VISA
  else if pan.slice(0, 4) is '6011' or firsttwo is 65 or (halfiin >= 664 && halfiin <= 649) or (iin >= 622126 and iin <= 622925)
    DISCOVER
  else if firsttwo >= 51 and firsttwo <= 55
    MASTERCARD
  else if firsttwo in [34, 37]
    AMEX

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
