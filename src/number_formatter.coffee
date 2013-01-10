Formatter = require './formatter'

CEILING   = 0
FLOOR     = 1
DOWN      = 2
HALF_EVEN = 3
UP        = 4
HALF_DOWN = 5
HALF_UP   = 6

isDigits = (string) ->
  /^\d*$/.test string

startsWith = (prefix, string) ->
  string[0...prefix.length] is prefix

endsWith = (suffix, string) ->
  string[(string.length - suffix.length)..] is suffix

class NumberFormatter extends Formatter
  _allowsFloats:                yes
  _alwaysShowsDecimalSeparator: no
  _decimalSeparator:            '.'
  _maximumFractionDigits:       0
  _minimumFractionDigits:       0
  _maximum:                     null
  _minimum:                     null
  _negativePrefix:              '-'
  _negativeSuffix:              ''
  _positivePrefix:              ''
  _positiveSuffix:              ''
  _roundingMode:                HALF_EVEN

  # Gets whether this formatter will parse float number values. This value does
  # not apply to formatting. To prevent formatting floats, set
  # #maximumFractionDigits to 0.
  #
  # Returns true if parsing floats is allowed, false otherwise.
  allowsFloats: ->
    @_allowsFloats

  # Sets whether this formatter will parse float number values.
  #
  # Returns the formatter.
  setAllowsFloats: (allowsFloats) ->
    @_allowsFloats = allowsFloats
    return this

  alwaysShowsDecimalSeparator: ->
    @_alwaysShowsDecimalSeparator

  setAlwaysShowsDecimalSeparator: (alwaysShowsDecimalSeparator) ->
    @_alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator
    return this

  decimalSeparator: ->
    @_decimalSeparator

  setDecimalSeparator: (decimalSeparator) ->
    @_decimalSeparator = decimalSeparator
    return this

  maximum: ->
    @_maximum

  setMaximum: (max) ->
    @_maximum = max
    return this

  minimum: ->
    @_minimum

  setMinimum: (min) ->
    @_minimum = min
    return this

  maximumFractionDigits: ->
    @_maximumFractionDigits

  setMaximumFractionDigits: (maximumFractionDigits) ->
    @_maximumFractionDigits = maximumFractionDigits
    return this

  minimumFractionDigits: ->
    @_minimumFractionDigits

  setMinimumFractionDigits: (minimumFractionDigits) ->
    @_minimumFractionDigits = minimumFractionDigits
    return this

  negativePrefix: ->
    @_negativePrefix

  setNegativePrefix: (prefix) ->
    @_negativePrefix = prefix
    return this

  negativeSuffix: ->
    @_negativeSuffix

  setNegativeSuffix: (prefix) ->
    @_negativeSuffix = prefix
    return this

  positivePrefix: ->
    @_positivePrefix

  setPositivePrefix: (prefix) ->
    @_positivePrefix = prefix
    return this

  positiveSuffix: ->
    @_positiveSuffix

  setPositiveSuffix: (prefix) ->
    @_positiveSuffix = prefix
    return this

  roundingMode: ->
    @_roundingMode

  setRoundingMode: (roundingMode) ->
    @_roundingMode = roundingMode
    return this

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

  parse: (string, error) ->
    if startsWith(@_negativePrefix, string) and endsWith(@_negativeSuffix, string)
      result = @parse(string[@_negativePrefix.length...(string.length-@_negativeSuffix.length)], error)
      result *= -1 if result?
      return result
    else if startsWith(@_positivePrefix, string) and endsWith(@_positiveSuffix, string)
      string = string[@_positivePrefix.length...(string.length-@_positiveSuffix.length)]
    else
      error? 'number-formatter.invalid-format'
      return null

    parts = string.split(@_decimalSeparator)
    if parts.length > 2
      error? 'number-formatter.invalid-format'
      return null

    integerPart = parts[0]
    fractionPart = parts[1] or ''

    if not isDigits(integerPart) or not isDigits(fractionPart)
      error? 'number-formatter.invalid-format'
      return null

    number = Number(integerPart) + Number(".#{fractionPart or '0'}")

    if not @_allowsFloats and number isnt ~~number
      error? 'number-formatter.floats-not-allowed'
      return null

    if @_minimum? and number < @_minimum
      error? 'number-formatter.out-of-bounds.below-minimum'
      return null

    if @_maximum? and number > @_maximum
      error? 'number-formatter.out-of-bounds.above-maximum'
      return null

    return number


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
    lastDigit = (if fractionPart.length is 0 then integerPart else fractionPart)[-1..-1]
    rounder = if Number(lastDigit) % 2 is 0 then roundFloor else roundCeiling

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
