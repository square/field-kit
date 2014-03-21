Formatter = require './formatter'
{ isDigits, startsWith, endsWith, trim, zpad } = require './utils'
stround = require 'stround'

# Style
NONE       = 0
CURRENCY   = 1
PERCENT    = 2

DEFAULT_LOCALE  = 'en-US'
DEFAULT_COUNTRY = 'US'

splitLocaleComponents = (locale) ->
  match = locale.match(/^([a-z][a-z])(?:[-_]([a-z][a-z]))?$/i)
  { lang: match?[1]?.toLowerCase(), country: match?[2]?.toUpperCase() }

# This simple property getter assumes that properties will never be functions
# and so attempts to run those functions using the given args.
get = (object, key, args...) ->
  value = object?[key]
  value = value(args...) if typeof value is 'function'
  return value

class NumberFormatter extends Formatter
  _allowsFloats:                null
  _alwaysShowsDecimalSeparator: null
  _countryCode:                 null
  _currencyCode:                null
  _exponent:                    null
  _groupingSeparator:           null
  _groupingSize:                null
  _lenient:                     no
  _locale:                      null
  _internationalCurrencySymbol: null
  _maximumFractionDigits:       null
  _minimumFractionDigits:       null
  _maximumIntegerDigits:        null
  _minimumIntegerDigits:        null
  _maximum:                     null
  _minimum:                     null
  _notANumberSymbol:            null
  _nullSymbol:                  null
  _numberStyle:                 null
  _roundingMode:                null
  _usesGroupingSeparator:       null
  _zeroSymbol:                  null

  constructor: ->
    @_locale = 'en'
    @setNumberStyle NONE

  # Gets whether this formatter will parse float number values. This value does
  # not apply to formatting. To prevent formatting floats, set
  # #maximumFractionDigits to 0.
  #
  # Returns true if parsing floats is allowed, false otherwise.
  allowsFloats: ->
    @_get 'allowsFloats'

  # Sets whether this formatter will parse float number values.
  #
  # Returns the formatter.
  setAllowsFloats: (allowsFloats) ->
    @_allowsFloats = allowsFloats
    return this

  alwaysShowsDecimalSeparator: ->
    @_get 'alwaysShowsDecimalSeparator'

  setAlwaysShowsDecimalSeparator: (alwaysShowsDecimalSeparator) ->
    @_alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator
    return this

  countryCode: ->
    @_countryCode or DEFAULT_COUNTRY

  setCountryCode: (countryCode) ->
    @_countryCode = countryCode
    return this

  currencyCode: ->
    @_get 'currencyCode'

  setCurrencyCode: (currencyCode) ->
    @_currencyCode = currencyCode
    return this

  currencySymbol: ->
    if @_shouldShowNativeCurrencySymbol()
      @_get 'currencySymbol'
    else
      @_get 'internationalCurrencySymbol'

  setCurrencySymbol: (currencySymbol) ->
    @_currencySymbol = currencySymbol
    return this

  _shouldShowNativeCurrencySymbol: ->
    regionDefaultCurrencyCode = @_regionDefaults().currencyCode
    regionDefaultCurrencyCode = regionDefaultCurrencyCode?() ? regionDefaultCurrencyCode
    return @currencyCode() is regionDefaultCurrencyCode

  decimalSeparator: ->
    @_get 'decimalSeparator'

  setDecimalSeparator: (decimalSeparator) ->
    @_decimalSeparator = decimalSeparator
    return this

  groupingSeparator: ->
    @_get 'groupingSeparator'

  setGroupingSeparator: (groupingSeparator) ->
    @_groupingSeparator = groupingSeparator
    return this

  groupingSize: ->
    @_get 'groupingSize'

  setGroupingSize: (groupingSize) ->
    @_groupingSize = groupingSize
    return this

  internationalCurrencySymbol: ->
    @_get 'internationalCurrencySymbol'

  setInternationalCurrencySymbol: (internationalCurrencySymbol) ->
    @_internationalCurrencySymbol = internationalCurrencySymbol
    return this

  isLenient: ->
    @_lenient

  setLenient: (lenient) ->
    @_lenient = lenient
    return this

  locale: ->
    @_locale or DEFAULT_LOCALE

  setLocale: (locale) ->
    @_locale = locale
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
    @_get 'maximumFractionDigits'

  setMaximumFractionDigits: (maximumFractionDigits) ->
    @_maximumFractionDigits = maximumFractionDigits
    if maximumFractionDigits < @minimumFractionDigits()
      @setMinimumFractionDigits(maximumFractionDigits)
    return this

  minimumFractionDigits: ->
    @_get 'minimumFractionDigits'

  setMinimumFractionDigits: (minimumFractionDigits) ->
    @_minimumFractionDigits = minimumFractionDigits
    if minimumFractionDigits > @maximumFractionDigits()
      @setMaximumFractionDigits(minimumFractionDigits)
    return this

  maximumIntegerDigits: ->
    @_get 'maximumIntegerDigits'

  setMaximumIntegerDigits: (maximumIntegerDigits) ->
    @_maximumIntegerDigits = maximumIntegerDigits
    if maximumIntegerDigits < @minimumIntegerDigits()
      @setMinimumIntegerDigits(maximumIntegerDigits)
    return this

  minimumIntegerDigits: ->
    @_get 'minimumIntegerDigits'

  setMinimumIntegerDigits: (minimumIntegerDigits) ->
    @_minimumIntegerDigits = minimumIntegerDigits
    if minimumIntegerDigits > @maximumIntegerDigits()
      @setMaximumIntegerDigits(minimumIntegerDigits)
    return this

  exponent: ->
    @_get 'exponent'

  setExponent: (exponent) ->
    @_exponent = exponent
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
    @_get 'notANumberSymbol'

  setNotANumberSymbol: (notANumberSymbol) ->
    @_notANumberSymbol = notANumberSymbol

  nullSymbol: ->
    @_get 'nullSymbol'

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
    @_get 'roundingMode'

  setRoundingMode: (roundingMode) ->
    @_roundingMode = roundingMode
    return this

  usesGroupingSeparator: ->
    @_get 'usesGroupingSeparator'

  setUsesGroupingSeparator: (usesGroupingSeparator) ->
    @_usesGroupingSeparator = usesGroupingSeparator

  zeroSymbol: ->
    @_get 'zeroSymbol'

  setZeroSymbol: (zeroSymbol) ->
    @_zeroSymbol = zeroSymbol

  _get: (attr) ->
    value = this["_#{attr}"]
    return value if value?

    styleDefaults  = @_styleDefaults
    localeDefaults = @_localeDefaults()
    regionDefaults = @_regionDefaults()

    value = get styleDefaults, attr, this, localeDefaults
    return value if value?

    value = get localeDefaults, attr, this, styleDefaults
    return value if value?

    value = get regionDefaults, attr, this, styleDefaults
    return value if value?

    value = get @_currencyDefaults(), attr, this, localeDefaults
    return value if value?

    return null

  format: (number) ->
    if number is ""
      return ""

    if (zeroSymbol = @zeroSymbol())? and number is 0
      return zeroSymbol

    if (nullSymbol = @nullSymbol())? and number is null
      return nullSymbol

    if (notANumberSymbol = @notANumberSymbol())? and isNaN(number)
      return notANumberSymbol

    if (positiveInfinitySymbol = @positiveInfinitySymbol())? and number is Infinity
      return positiveInfinitySymbol

    if (negativeInfinitySymbol = @negativeInfinitySymbol())? and number is -Infinity
      return negativeInfinitySymbol

    integerPart  = null
    fractionPart = null
    string       = null
    negative     = number < 0

    [integerPart, fractionPart] = "#{Math.abs(number)}".split('.')
    fractionPart ||= ''

    if (exponent = @exponent())?
      [ negative, integerPart, fractionPart ] =
        stround.shift([ negative, integerPart, fractionPart ], exponent)
      integerPart = integerPart.slice(1) while integerPart[0] is '0'


    # round fraction part to the maximum length
    maximumFractionDigits = @maximumFractionDigits()
    if fractionPart.length > maximumFractionDigits
      unrounded = "#{integerPart}.#{fractionPart}"
      rounded = @_round if negative then "-#{unrounded}" else unrounded
      rounded = rounded[1..] if rounded[0] is '-'
      [ integerPart, fractionPart ] = rounded.split('.')
      fractionPart ||= ''

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
    if fractionPart.length > 0 or @alwaysShowsDecimalSeparator()
      fractionPart = @decimalSeparator() + fractionPart

    if @usesGroupingSeparator()
      integerPartWithGroupingSeparators = ''
      copiedCharacterCount = 0

      for i in [integerPart.length-1..0]
        if copiedCharacterCount > 0 and copiedCharacterCount % @groupingSize() is 0
          integerPartWithGroupingSeparators = @groupingSeparator() + integerPartWithGroupingSeparators
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
    stround.round number, @maximumFractionDigits(), @roundingMode()

  parse: (string, error) ->
    positivePrefix = @positivePrefix()
    negativePrefix = @negativePrefix()
    positiveSuffix = @positiveSuffix()
    negativeSuffix = @negativeSuffix()

    if @isLenient()
      string = string.replace(/\s/g, '')
      positivePrefix = trim positivePrefix
      negativePrefix = trim negativePrefix
      positiveSuffix = trim positiveSuffix
      negativeSuffix = trim negativeSuffix

    if @zeroSymbol()? and string is @zeroSymbol()
      result = 0

    else if @nullSymbol()? and string is @nullSymbol()
      result = null

    else if @notANumberSymbol()? and string is @notANumberSymbol()
      result = NaN

    else if @positiveInfinitySymbol()? and string is @positiveInfinitySymbol()
      result = Infinity

    else if @negativeInfinitySymbol()? and string is @negativeInfinitySymbol()
      result = -Infinity

    else if not result?
      hasNegativePrefix = startsWith(negativePrefix, string)
      hasNegativeSuffix = endsWith(negativeSuffix, string)
      if hasNegativePrefix and (@isLenient() or hasNegativeSuffix)
        innerString = string[negativePrefix.length...]
        innerString = innerString[0...(innerString.length-negativeSuffix.length)] if hasNegativeSuffix
        result = @_parseAbsoluteValue(innerString, error)
        result *= -1 if result?
      else
        hasPositivePrefix = startsWith(positivePrefix, string)
        hasPositiveSuffix = endsWith(positiveSuffix, string)
        if @isLenient() or (hasPositivePrefix and hasPositiveSuffix)
          innerString = string
          innerString = innerString[positivePrefix.length...] if hasPositivePrefix
          innerString = innerString[0...(innerString.length-positiveSuffix.length)] if hasPositiveSuffix
          result = @_parseAbsoluteValue(innerString, error)
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

    if @usesGroupingSeparator()
      groupingSize = @groupingSize()
      groupParts = integerPart.split(@groupingSeparator())

      unless @isLenient()
        if groupParts.length > 1
          # disallow 1000,000
          if groupParts[0].length > groupingSize
            error? 'number-formatter.invalid-format.grouping-size'
            return null

          # disallow 1,00
          for groupPart in groupParts.slice(1)
            if groupPart.length isnt groupingSize
              error? 'number-formatter.invalid-format.grouping-size'
              return null

      # remove grouping separators
      integerPart = groupParts.join('')

    if not isDigits(integerPart) or not isDigits(fractionPart)
      error? 'number-formatter.invalid-format'
      return null

    if (exponent = @exponent())?
      [ negative, integerPart, fractionPart ] =
        stround.shift([ negative, integerPart, fractionPart ], -exponent)

    number = Number(integerPart) + Number(".#{fractionPart or '0'}")

    if not @allowsFloats() and number isnt ~~number
      error? 'number-formatter.floats-not-allowed'
      return null

    return number

  _currencyDefaults: ->
    result = {}

    for own key, value of CurrencyDefaults.default
      result[key] = value

    for own key, value of CurrencyDefaults[@currencyCode()]
      result[key] = value

    return result

  _regionDefaults: ->
    result = {}

    for own key, value of RegionDefaults.default
      result[key] = value

    for own key, value of RegionDefaults[@countryCode()]
      result[key] = value

    return result

  _localeDefaults: ->
    locale      = @locale()
    countryCode = @countryCode()
    { lang }    = splitLocaleComponents(locale)
    result      = {}

    defaultFallbacks = [
      RegionDefaults.default
      LocaleDefaults.default
      RegionDefaults[countryCode]  # CA
      LocaleDefaults[lang]         # fr
      LocaleDefaults[locale]       # fr-CA
    ]

    for defaults in defaultFallbacks
      for own key, value of defaults
        result[key] = value

    return result


## Aliases

NumberFormatter::stringFromNumber = NumberFormatter::format
NumberFormatter::numberFromString = NumberFormatter::parse
NumberFormatter::minusSign = NumberFormatter::negativePrefix
NumberFormatter::setMinusSign = NumberFormatter::setNegativePrefix
NumberFormatter::plusSign = NumberFormatter::positivePrefix
NumberFormatter::setPlusSign = NumberFormatter::setPositivePrefix

NumberFormatter.Rounding = stround.modes

NumberFormatter.Style = {
  NONE
  CURRENCY
  PERCENT
}

StyleDefaults =
  NONE:
    usesGroupingSeparator: no
    minimumFractionDigits: 0
    maximumFractionDigits: 0
    minimumIntegerDigits:  0
  PERCENT:
    usesGroupingSeparator: no
    exponent:              2
    minimumFractionDigits: 0
    maximumFractionDigits: 0
    minimumIntegerDigits:  1
    positiveSuffix: (formatter) -> formatter.percentSymbol()
    negativeSuffix: (formatter) -> formatter.percentSymbol()
  CURRENCY:
    positivePrefix: (formatter, locale) -> get locale, 'positiveCurrencyPrefix', formatter, this
    positiveSuffix: (formatter, locale) -> get locale, 'positiveCurrencySuffix', formatter, this
    negativePrefix: (formatter, locale) -> get locale, 'negativeCurrencyPrefix', formatter, this
    negativeSuffix: (formatter, locale) -> get locale, 'negativeCurrencySuffix', formatter, this

LocaleDefaults =
  default:
    allowsFloats:                yes
    alwaysShowsDecimalSeparator: no
    decimalSeparator:            '.'
    groupingSeparator:           ','
    groupingSize:                3
    negativeInfinitySymbol:      '-∞'
    negativePrefix:              '-'
    negativeSuffix:              ''
    notANumberSymbol:            'NaN'
    nullSymbol:                  ''
    percentSymbol:               '%'
    positiveInfinitySymbol:      '+∞'
    positivePrefix:              ''
    positiveSuffix:              ''
    roundingMode:                NumberFormatter.Rounding.HALF_EVEN
    positiveCurrencyPrefix:      (formatter) -> formatter.currencySymbol()
    positiveCurrencySuffix:      ''
    negativeCurrencyPrefix:      (formatter) -> "(#{formatter.currencySymbol()}"
    negativeCurrencySuffix:      (formatter) -> ')'

  fr:
    decimalSeparator:       ','
    groupingSeparator:      ' ' # nbsp
    percentSymbol:          ' %' # nbsp
    positiveCurrencyPrefix: ''
    positiveCurrencySuffix: (formatter) -> " #{formatter.currencySymbol()}" # nbsp
    negativeCurrencyPrefix: (formatter) -> '('
    negativeCurrencySuffix: (formatter) -> " #{formatter.currencySymbol()})" # nbsp

  ja:
    negativeCurrencyPrefix: (formatter) -> "-#{formatter.currencySymbol()}"
    negativeCurrencySuffix: ''

  'en-GB':
    negativeCurrencyPrefix: (formatter) -> "-#{formatter.currencySymbol()}"
    negativeCurrencySuffix: ''

RegionDefaults =
  CA:
    currencyCode: 'CAD'
  DE:
    currencyCode: 'EUR'
  ES:
    currencyCode: 'EUR'
  FR:
    currencyCode: 'EUR'
  GB:
    currencyCode: 'GBP'
  JP:
    currencyCode: 'JPY'
  US:
    currencyCode: 'USD'

CurrencyDefaults =
  default:
    currencySymbol:              (formatter) -> formatter.currencyCode()
    internationalCurrencySymbol: (formatter) -> formatter.currencyCode()
    minimumFractionDigits:       2
    maximumFractionDigits:       2
    minimumIntegerDigits:        1
    usesGroupingSeparator:       yes
  CAD:
    currencySymbol:              '$'
    internationalCurrencySymbol: 'CA$'
  EUR:
    currencySymbol:              '€'
  GBP:
    currencySymbol:              '£'
    internationalCurrencySymbol: 'GB£'
  JPY:
    currencySymbol:              '¥'
    internationalCurrencySymbol: 'JP¥'
    minimumFractionDigits:       0
    maximumFractionDigits:       0
  USD:
    currencySymbol:              '$'
    internationalCurrencySymbol: 'US$'

module.exports = NumberFormatter
