Formatter = require './formatter'

class NumberFormatter extends Formatter
  _minimumFractionDigits: 0
  _maximumFractionDigits: 0
  _positivePrefix:        ''
  _positiveSuffix:        ''
  _negativePrefix:        '-'
  _negativeSuffix:        ''

  positivePrefix: ->
    @_positivePrefix

  setPositivePrefix: (prefix) ->
    @_positivePrefix = prefix

  positiveSuffix: ->
    @_positiveSuffix

  setPositiveSuffix: (prefix) ->
    @_positiveSuffix = prefix

  negativePrefix: ->
    @_negativePrefix

  setNegativePrefix: (prefix) ->
    @_negativePrefix = prefix

  negativeSuffix: ->
    @_negativeSuffix

  setNegativeSuffix: (prefix) ->
    @_negativeSuffix = prefix

  minimumFractionDigits: ->
    @_minimumFractionDigits

  setMinimumFractionDigits: (minimumFractionDigits) ->
    @_minimumFractionDigits = minimumFractionDigits
    return null

  maximumFractionDigits: ->
    @_maximumFractionDigits

  setMaximumFractionDigits: (maximumFractionDigits) ->
    @_maximumFractionDigits = maximumFractionDigits
    return null

  format: (number) ->
    negative = number < 0
    string = "#{Math.abs(number)}"
    [integerPart, fractionPart] = string.split('.')

    result = integerPart

    fractionPart ||= ''

    while fractionPart.length < @_minimumFractionDigits
      fractionPart += '0'

    if fractionPart.length > @_maximumFractionDigits
      # TODO: rounding
      fractionPart = fractionPart.slice(0, @_maximumFractionDigits)

    if fractionPart.length > 0
      # TODO: separator customization
      result += ".#{fractionPart}"

    if negative
      result = @_negativePrefix + result + @_negativeSuffix
    else
      result = @_positivePrefix + result + @_positiveSuffix

    return result

NumberFormatter::numberFromString = NumberFormatter::parse

module.exports = NumberFormatter
