AMEX        = 'amex'
DISCOVER    = 'discover'
JCB         = 'jcb'
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
  else if pan.slice(0, 4) is '2131' or pan.slice(0, 4) is '1800' or firsttwo is 35
    JCB
  else if firsttwo >= 51 and firsttwo <= 55
    MASTERCARD
  else if firsttwo in [34, 37]
    AMEX

luhnCheck = (pan) ->
    sum = 0
    flip = true
    for i in [pan.length-1..0] when pan.charAt(i) isnt ' '
      digit = parseInt(pan.charAt(i), 10)
      sum += if (flip = not flip) then Math.floor((digit * 2) / 10) + Math.floor(digit * 2 % 10) else digit

    return sum % 10 is 0

validCardLength = (pan) ->
  switch determineCardType(pan)
    when VISA
      pan.length in [13, 16]
    when DISCOVER, MASTERCARD
      pan.length is 16
    when JCB
      pan.length in [15, 16]
    when AMEX
      pan.length is 15
    else
      false

module.exports = { determineCardType, luhnCheck, validCardLength, AMEX, DISCOVER, JCB, MASTERCARD, VISA }