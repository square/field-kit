Formatter = require './formatter'

CEILING   = 0
FLOOR     = 1
DOWN      = 2
HALF_EVEN = 3
UP        = 4
HALF_DOWN = 5
HALF_UP   = 6

class NumberFormatter extends Formatter
  _alwaysShowsDecimalSeparator: no
  _decimalSeparator:            '.'
  _maximumFractionDigits:       0
  _minimumFractionDigits:       0
  _negativePrefix:              '-'
  _negativeSuffix:              ''
  _positivePrefix:              ''
  _positiveSuffix:              ''
  _roundingMode:                HALF_EVEN

  alwaysShowsDecimalSeparator: ->
    @_alwaysShowsDecimalSeparator

  setAlwaysShowsDecimalSeparator: (alwaysShowsDecimalSeparator) ->
    @_alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator
    return null

  decimalSeparator: ->
    @_decimalSeparator

  setDecimalSeparator: (decimalSeparator) ->
    @_decimalSeparator = decimalSeparator
    return null

  maximumFractionDigits: ->
    @_maximumFractionDigits

  setMaximumFractionDigits: (maximumFractionDigits) ->
    @_maximumFractionDigits = maximumFractionDigits
    return null

  minimumFractionDigits: ->
    @_minimumFractionDigits

  setMinimumFractionDigits: (minimumFractionDigits) ->
    @_minimumFractionDigits = minimumFractionDigits
    return null

  negativePrefix: ->
    @_negativePrefix

  setNegativePrefix: (prefix) ->
    @_negativePrefix = prefix
    return null

  negativeSuffix: ->
    @_negativeSuffix

  setNegativeSuffix: (prefix) ->
    @_negativeSuffix = prefix
    return null

  positivePrefix: ->
    @_positivePrefix

  setPositivePrefix: (prefix) ->
    @_positivePrefix = prefix
    return null

  positiveSuffix: ->
    @_positiveSuffix

  setPositiveSuffix: (prefix) ->
    @_positiveSuffix = prefix
    return null

  roundingMode: ->
    @_roundingMode

  setRoundingMode: (roundingMode) ->
    @_roundingMode = roundingMode
    return null

  format: (number) ->
    negative = number < 0
    string = "#{Math.abs(number)}"
    [integerPart, fractionPart] = string.split('.')

    fractionPart ||= ''

    while fractionPart.length < @_minimumFractionDigits
      fractionPart += '0'

    if fractionPart.length > @_maximumFractionDigits
      extraFractionPart = fractionPart[@_maximumFractionDigits..]
      fractionPart = fractionPart[0...@_maximumFractionDigits]
      [integerPart, fractionPart] = @_round negative, integerPart, fractionPart, extraFractionPart

    if fractionPart.length > 0 or @_alwaysShowsDecimalSeparator
      fractionPart = @_decimalSeparator + fractionPart

    result = integerPart + fractionPart

    if negative
      result = @_negativePrefix + result + @_negativeSuffix
    else
      result = @_positivePrefix + result + @_positiveSuffix

    return result

  _round: (args...) ->
    @_rounder() args...

  _rounder: ->
    switch @_roundingMode
      when CEILING then roundCeiling
      when FLOOR then roundFloor
      when HALF_EVEN then roundHalfEven


## Aliases

NumberFormatter::numberFromString = NumberFormatter::parse


## Rounding

roundCeiling = (negative, integerPart, fractionPart, extraFractionPart) ->
  return roundFloor !negative, integerPart, fractionPart, extraFractionPart if negative

  if /[1-9]/.test extraFractionPart
    if fractionPart.length is 0
      integerPart = "#{Number(integerPart) + 1}"
    else
      fractionPart = "#{fractionPart[0...-1]}#{Number(fractionPart[-1..-1]) + 1}"

  return [integerPart, fractionPart]


roundFloor = (negative, integerPart, fractionPart, extraFractionPart) ->
  return roundCeiling !negative, integerPart, fractionPart, extraFractionPart if negative
  [integerPart, fractionPart]

roundHalfEven = (negative, integerPart, fractionPart, extraFractionPart) ->
  # FIXME: I don't think this is quite right.
  rounder = roundFloor

  if extraFractionPart[0] is '5'
    rounder = if Number(fractionPart[-1..-1]) % 2 is 0 then roundFloor else roundCeiling

  return rounder no, integerPart, fractionPart, extraFractionPart

NumberFormatter.Rounding = {
  CEILING
  FLOOR
  DOWN
  HALF_EVEN
  UP
  HALF_DOWN
  HALF_UP
}


module.exports = NumberFormatter
