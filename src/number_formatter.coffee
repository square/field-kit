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
  _groupingSeparator:           ','
  _groupingSize:                3
  _maximumFractionDigits:       0
  _minimumFractionDigits:       0
  _maximumIntegerDigits:        null
  _minimumIntegerDigits:        0
  _maximum:                     null
  _minimum:                     null
  _multiplier:                  null
  _negativeInfinitySymbol:      '-∞'
  _negativePrefix:              '-'
  _negativeSuffix:              ''
  _notANumberSymbol:            'NaN'
  _nullSymbol:                  ''
  _positiveInfinitySymbol:      '+∞'
  _positivePrefix:              ''
  _positiveSuffix:              ''
  _roundingMode:                HALF_EVEN
  _usesGroupingSeparator:       no
  _zeroSymbol:                  null

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

  groupingSeparator: ->
    @_groupingSeparator

  setGroupingSeparator: (groupingSeparator) ->
    @_groupingSeparator = groupingSeparator

  groupingSize: ->
    @_groupingSize

  setGroupingSize: (groupingSize) ->
    @_groupingSize = groupingSize

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

  negativeInfinitySymbol: ->
    @_negativeInfinitySymbol

  setNegativeInfinitySymbol: (negativeInfinitySymbol) ->
    @_negativeInfinitySymbol = negativeInfinitySymbol

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

  notANumberSymbol: ->
    @_notANumberSymbol

  setNotANumberSymbol: (notANumberSymbol) ->
    @_notANumberSymbol = notANumberSymbol

  nullSymbol: ->
    @_nullSymbol

  setNullSymbol: (nullSymbol) ->
    @_nullSymbol = nullSymbol

  positiveInfinitySymbol: ->
    @_positiveInfinitySymbol

  setPositiveInfinitySymbol: (positiveInfinitySymbol) ->
    @_positiveInfinitySymbol = positiveInfinitySymbol

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

  usesGroupingSeparator: ->
    @_usesGroupingSeparator

  setUsesGroupingSeparator: (usesGroupingSeparator) ->
    @_usesGroupingSeparator = usesGroupingSeparator

  zeroSymbol: ->
    @_zeroSymbol

  setZeroSymbol: (zeroSymbol) ->
    @_zeroSymbol = zeroSymbol

  format: (number) ->
    if @_zeroSymbol? and number is 0
      return @_zeroSymbol

    if @_nullSymbol? and number is null
      return @_nullSymbol

    if @_notANumberSymbol? and isNaN(number)
      return @_notANumberSymbol

    if @_positiveInfinitySymbol? and number is Infinity
      return @_positiveInfinitySymbol

    if @_negativeInfinitySymbol? and number is -Infinity
      return @_negativeInfinitySymbol

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

    if @_usesGroupingSeparator
      integerPartWithGroupingSeparators = ''
      copiedCharacterCount = 0

      for i in [integerPart.length-1..0]
        if copiedCharacterCount > 0 and copiedCharacterCount % @_groupingSize is 0
          integerPartWithGroupingSeparators = @_groupingSeparator + integerPartWithGroupingSeparators
        integerPartWithGroupingSeparators = integerPart[i] + integerPartWithGroupingSeparators
        copiedCharacterCount++

      integerPart = integerPartWithGroupingSeparators

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
    if @_zeroSymbol? and string is @_zeroSymbol
      result = 0

    else if @_nullSymbol? and string is @_nullSymbol
      result = null

    else if @_notANumberSymbol? and string is @_notANumberSymbol
      result = NaN

    else if @_positiveInfinitySymbol? and string is @_positiveInfinitySymbol
      result = Infinity

    else if @_negativeInfinitySymbol? and string is @_negativeInfinitySymbol
      result = -Infinity

    else if not result?
      if startsWith(@_negativePrefix, string) and endsWith(@_negativeSuffix, string)
        result = @_parseAbsoluteValue(string[@_negativePrefix.length...(string.length-@_negativeSuffix.length)], error)
        result *= -1 if result?
      else if startsWith(@_positivePrefix, string) and endsWith(@_positiveSuffix, string)
        result = @_parseAbsoluteValue string[@_positivePrefix.length...(string.length-@_positiveSuffix.length)], error
      else
        error? 'number-formatter.invalid-format'
        return null

    if result?
      if @_minimum? and result < @_minimum
        error? 'number-formatter.out-of-bounds.below-minimum'
        return null

      if @_maximum? and result > @_maximum
        error? 'number-formatter.out-of-bounds.above-maximum'
        return null

    return result

  _parseAbsoluteValue: (string, error) ->
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

    if @_multiplier?
      number /= @_multiplier

    return number


## Aliases

NumberFormatter::stringFromNumber = NumberFormatter::format
NumberFormatter::numberFromString = NumberFormatter::parse
NumberFormatter::minusSign = NumberFormatter::negativePrefix
NumberFormatter::setMinusSign = NumberFormatter::setNegativePrefix
NumberFormatter::plusSign = NumberFormatter::positivePrefix
NumberFormatter::setPlusSign = NumberFormatter::setPositivePrefix


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
  switch extraFractionPart[0]
    when '1', '2', '3', '4'
      rounder = roundFloor
    when '5'
      lastDigit = (if fractionPart.length is 0 then integerPart else fractionPart)[-1..-1]
      rounder = if (Number(lastDigit) % 2 is 0) ^ negative then roundFloor else roundCeiling
    else
      rounder = roundCeiling

  return rounder negative, integerPart, fractionPart, extraFractionPart

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
