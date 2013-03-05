Formatter = require './formatter'

# Rounding
CEILING    = 0
FLOOR      = 1
DOWN       = 2
HALF_EVEN  = 3
UP         = 4
HALF_DOWN  = 5
HALF_UP    = 6

# Style
NONE       = 0
CURRENCY   = 1
PERCENT    = 2

isDigits = (string) ->
  /^\d*$/.test string

startsWith = (prefix, string) ->
  string[0...prefix.length] is prefix

endsWith = (suffix, string) ->
  string[(string.length - suffix.length)..] is suffix

class NumberFormatter extends Formatter
  _allowsFloats:                yes
  _alwaysShowsDecimalSeparator: no
  _groupingSeparator:           ','
  _groupingSize:                3
  _maximumFractionDigits:       null
  _minimumFractionDigits:       null
  _maximumIntegerDigits:        null
  _minimumIntegerDigits:        null
  _maximum:                     null
  _minimum:                     null
  _multiplier:                  null
  _notANumberSymbol:            'NaN'
  _nullSymbol:                  ''
  _numberStyle:                 null
  _roundingMode:                HALF_EVEN
  _usesGroupingSeparator:       no
  _zeroSymbol:                  null

  constructor: ->
    @_regionDefaults = RegionDefaults.US
    @setNumberStyle NONE

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

  currencySymbol: ->
    @_get 'currencySymbol'

  setCurrencySymbol: (currencySymbol) ->
    @_currencySymbol = currencySymbol
    return this

  decimalSeparator: ->
    @_get 'decimalSeparator'

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
    @_get 'maximumFractionDigits'

  setMaximumFractionDigits: (maximumFractionDigits) ->
    @_maximumFractionDigits = maximumFractionDigits
    return this

  minimumFractionDigits: ->
    @_get 'minimumFractionDigits'

  setMinimumFractionDigits: (minimumFractionDigits) ->
    @_minimumFractionDigits = minimumFractionDigits
    return this

  maximumIntegerDigits: ->
    @_get 'maximumIntegerDigits'

  setMaximumIntegerDigits: (maximumIntegerDigits) ->
    @_maximumIntegerDigits = maximumIntegerDigits
    return this

  minimumIntegerDigits: ->
    @_get 'minimumIntegerDigits'

  setMinimumIntegerDigits: (minimumIntegerDigits) ->
    @_minimumIntegerDigits = minimumIntegerDigits
    return this

  multiplier: ->
    @_multiplier ? @_styleDefaults?.multiplier?() ? null

  setMultiplier: (multiplier) ->
    @_multiplier = multiplier
    return this

  negativeInfinitySymbol: ->
    @_get 'negativeInfinitySymbol'

  setNegativeInfinitySymbol: (negativeInfinitySymbol) ->
    @_negativeInfinitySymbol = negativeInfinitySymbol

  negativePrefix: ->
    @_get 'negativePrefix'

  setNegativePrefix: (prefix) ->
    @_negativePrefix = prefix
    return this

  negativeSuffix: ->
    @_get 'negativeSuffix'

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

  numberStyle: ->
    @_numberStyle

  setNumberStyle: (numberStyle) ->
    @_numberStyle = numberStyle
    switch @_numberStyle
      when NONE
        @_styleDefaults = StyleDefaults.NONE
      when PERCENT
        @_styleDefaults = StyleDefaults.PERCENT
      when CURRENCY
        @_styleDefaults = StyleDefaults.CURRENCY
      else
        @_styleDefaults = null
    return this

  percentSymbol: ->
    @_get 'percentSymbol'

  setPercentSymbol: (percentSymbol) ->
    @_percentSymbol = percentSymbol
    return this

  positiveInfinitySymbol: ->
    @_get 'positiveInfinitySymbol'

  setPositiveInfinitySymbol: (positiveInfinitySymbol) ->
    @_positiveInfinitySymbol = positiveInfinitySymbol
    return this

  positivePrefix: ->
    @_get 'positivePrefix'

  setPositivePrefix: (prefix) ->
    @_positivePrefix = prefix
    return this

  positiveSuffix: ->
    @_get 'positiveSuffix'

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

  _get: (attr) ->
    @["_#{attr}"] ? @_styleDefaults?[attr]?(this, @_regionDefaults) ? @_regionDefaults?[attr]?(this, @_styleDefaults) ? null

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

    if (multiplier = @multiplier())?
      number *= multiplier

    integerPart  = null
    fractionPart = null
    string       = null
    negative     = number < 0

    splitNumber = ->
      string = "#{Math.abs(number)}"
      [integerPart, fractionPart] = string.split('.')
      fractionPart ||= ''

    splitNumber()

    # round fraction part to the maximum length
    maximumFractionDigits = @maximumFractionDigits()
    if fractionPart.length > maximumFractionDigits
      number = @_round number
      splitNumber()

    # right-pad fraction zeros up to the minimum length
    minimumFractionDigits = @minimumFractionDigits()
    while fractionPart.length < minimumFractionDigits
      fractionPart += '0'

    # left-pad integer zeros up to the minimum length
    minimumIntegerDigits = @minimumIntegerDigits()
    while integerPart.length < minimumIntegerDigits
      integerPart = '0' + integerPart

    # eat any unneeded trailing zeros
    minimumFractionDigits = @minimumFractionDigits()
    while fractionPart.length > minimumFractionDigits and fractionPart[-1..-1] is '0'
      fractionPart = fractionPart[0...-1]

    # left-truncate any integer digits over the maximum length
    maximumIntegerDigits = @maximumIntegerDigits()
    if maximumIntegerDigits? and integerPart.length > maximumIntegerDigits
      integerPart = integerPart[-maximumIntegerDigits..]

    # add the decimal separator
    if fractionPart.length > 0 or @_alwaysShowsDecimalSeparator
      fractionPart = @decimalSeparator() + fractionPart

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
      result = @negativePrefix() + result + @negativeSuffix()
    else
      result = @positivePrefix() + result + @positiveSuffix()

    return result

  _round: (number) ->
    @_rounder() number, @maximumFractionDigits()

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
      if startsWith(@negativePrefix(), string) and endsWith(@negativeSuffix(), string)
        result = @_parseAbsoluteValue(string[@negativePrefix().length...(string.length-@negativeSuffix().length)], error)
        result *= -1 if result?
      else if startsWith(@positivePrefix(), string) and endsWith(@positiveSuffix(), string)
        result = @_parseAbsoluteValue string[@positivePrefix().length...(string.length-@positiveSuffix().length)], error
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
    if string.length is 0
      error? 'number-formatter.invalid-format'
      return null

    parts = string.split(@decimalSeparator())
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

    if (multiplier = @multiplier())?
      number /= multiplier

    return number


## Aliases

NumberFormatter::stringFromNumber = NumberFormatter::format
NumberFormatter::numberFromString = NumberFormatter::parse
NumberFormatter::minusSign = NumberFormatter::negativePrefix
NumberFormatter::setMinusSign = NumberFormatter::setNegativePrefix
NumberFormatter::plusSign = NumberFormatter::positivePrefix
NumberFormatter::setPlusSign = NumberFormatter::setPositivePrefix


## Rounding

roundCeiling = (number, maximumFractionDigits) ->
  return roundFloor -number, maximumFractionDigits if number < 0
  multiplier = Math.pow(10, maximumFractionDigits)
  (~~(number * multiplier) + 1) / multiplier

roundFloor = (number, maximumFractionDigits) ->
  return roundCeiling -number, maximumFractionDigits if number < 0
  multiplier = Math.pow(10, maximumFractionDigits)
  ~~(number * multiplier) / multiplier

roundHalfEven = (number, maximumFractionDigits) ->
  multiplier = Math.pow(10, maximumFractionDigits)
  percentFromFloor = Math.abs((number * (multiplier * 100)) % 100)

  if percentFromFloor < 50
    roundFloor number, maximumFractionDigits
  else if percentFromFloor > 50
    roundCeiling number, maximumFractionDigits
  else
    lastDigit = ~~Math.abs(number * multiplier) % 10
    if (lastDigit % 2 is 0) ^ (number < 0)
      roundFloor number, maximumFractionDigits
    else
      roundCeiling number, maximumFractionDigits

NumberFormatter.Rounding = {
  CEILING
  FLOOR
  DOWN
  HALF_EVEN
  UP
  HALF_DOWN
  HALF_UP
}

NumberFormatter.Style = {
  NONE
  CURRENCY
  PERCENT
}

StyleDefaults =
  NONE:
    minimumFractionDigits: -> 0
    maximumFractionDigits: -> 0
    minimumIntegerDigits:  -> 0
  PERCENT:
    multiplier:            -> 100
    minimumFractionDigits: -> 0
    maximumFractionDigits: -> 0
    minimumIntegerDigits:  -> 0
    positiveSuffix: (formatter) -> formatter.percentSymbol()
    negativeSuffix: (formatter) -> formatter.percentSymbol()
  CURRENCY:
    positivePrefix:        (formatter) -> formatter.currencySymbol()
    negativePrefix:        (formatter, region) -> region?.negativeCurrencyPrefix?(formatter, this)
    negativeSuffix:        (formatter, region) -> region?.negativeCurrencySuffix?(formatter, this)
    minimumFractionDigits: (formatter, region) -> region?.minimumCurrencyFractionDigits?(formatter, this)
    maximumFractionDigits: (formatter, region) -> region?.maximumCurrencyFractionDigits?(formatter, this)
    minimumIntegerDigits:  (formatter, region) -> region?.minimumCurrencyIntegerDigits?(formatter, this)
    maximumIntegerDigits:  (formatter, region) -> region?.maximumCurrencyIntegerDigits?(formatter, this)

RegionDefaults =
  US:
    decimalSeparator:              -> '.'
    negativeInfinitySymbol:        -> '-∞'
    negativePrefix:                -> '-'
    negativeSuffix:                -> ''
    percentSymbol:                 -> '%'
    positiveInfinitySymbol:        -> '+∞'
    positivePrefix:                -> ''
    positiveSuffix:                -> ''
    currencySymbol:                -> '$'
    positiveCurrencyPrefix:        (formatter) -> formatter.currencySymbol()
    negativeCurrencyPrefix:        (formatter) -> "(#{formatter.currencySymbol()}"
    negativeCurrencySuffix:        (formatter) -> ')'
    minimumCurrencyFractionDigits: -> 2
    maximumCurrencyFractionDigits: -> 2
    minimumCurrencyIntegerDigits:  -> 1

module.exports = NumberFormatter
