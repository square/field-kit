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
  _maximumIntegerDigits:        null
  _minimumIntegerDigits:        0
  _maximum:                     null
  _minimum:                     null
  _multiplier:                  null
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

  maximumIntegerDigits: ->
    @_maximumIntegerDigits

  setMaximumIntegerDigits: (maximumIntegerDigits) ->
    @_maximumIntegerDigits = maximumIntegerDigits
    return this

  minimumIntegerDigits: ->
    @_minimumIntegerDigits

  setMinimumIntegerDigits: (minimumIntegerDigits) ->
    @_minimumIntegerDigits = minimumIntegerDigits
    return this

  multiplier: ->
    @_multiplier

  setMultipler: (multiplier) ->
    @_multiplier = multiplier
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
    if @_multiplier?
      number *= @_multiplier

    negative = number < 0
    string = "#{Math.abs(number)}"
    [integerPart, fractionPart] = string.split('.')

    fractionPart ||= ''

    # right-pad fraction zeros up to the minimum length
    while fractionPart.length < @_minimumFractionDigits
      fractionPart += '0'

    # left-pad integer zeros up to the minimum length
    while integerPart.length < @_minimumIntegerDigits
      integerPart = '0' + integerPart

    # round fraction part to the maximum length
    if fractionPart.length > @_maximumFractionDigits
      extraFractionPart = fractionPart[@_maximumFractionDigits..]
      fractionPart = fractionPart[0...@_maximumFractionDigits]
      [integerPart, fractionPart] = @_round negative, integerPart, fractionPart, extraFractionPart

    # eat any unneeded trailing zeros
    while fractionPart.length > @_minimumFractionDigits and fractionPart[-1..-1] is '0'
      fractionPart = fractionPart[0...-1]

    # left-truncate any integer digits over the maximum length
    if @_maximumIntegerDigits? and integerPart.length > @_maximumIntegerDigits
      integerPart = integerPart[-@_maximumIntegerDigits..]

    # add the decimal separator
    if fractionPart.length > 0 or @_alwaysShowsDecimalSeparator
      fractionPart = @_decimalSeparator + fractionPart

    result = integerPart + fractionPart

    # surround with the appropriate prefix and suffix
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

    if @_multiplier?
      number /= @_multiplier

    return number


## Aliases

NumberFormatter::numberFromString = NumberFormatter::parse
NumberFormatter::minusSign = NumberFormatter::negativePrefix
NumberFormatter::setMinusSign = NumberFormatter::setNegativePrefix


## Rounding

roundCeiling = (negative, integerPart, fractionPart, extraFractionPart) ->
  return roundFloor !negative, integerPart, fractionPart, extraFractionPart if negative

  if /[1-9]/.test extraFractionPart
    [integerPart, fractionPart] = incrementFormattedParts integerPart, fractionPart

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

incrementFormattedParts = (integerPart, fractionPart) ->
  [fractionCarryOver, fractionPart] = incrementFormattedNumber fractionPart
  while fractionCarryOver--
    [integerCarryOver, integerPart] = incrementFormattedNumber integerPart
    integerPart = integerCarryOver + integerPart if integerCarryOver
  return [integerPart, fractionPart]

incrementFormattedNumber = (string) ->
  # add a place to the left so we don't lose any zeros
  string = "1#{string}"
  # increment the number
  number = Number(string) + 1
  # put it back to a string with an extra place
  string = "#{number}"
  # check the extra place to see if we have to keep it
  switch string[0]
    when '1'
      # it wasn't incremented so we don't need to keep it
      return [0, string[1..]]
    when '2'
      # it was incremented, so keep it as a '1'
      return [1, string[1..]]
    else
      throw new Error("unexpected carry over value '#{string[0]}', expected '1' or '2'")

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
