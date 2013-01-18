Formatter = require './formatter'

class DelimitedTextFormatter extends Formatter
  delimiter: null

  constructor: (delimiter=@delimiter) ->
    @delimiter = delimiter
    if @delimiter?.length isnt 1
      throw new Error('delimiter must have just one character')

  format: (text) ->
    return '' unless text

    result = ''
    for char in text
      result += @delimiter if @hasDelimiterAtIndex result.length
      result += char
      result += @delimiter if @hasDelimiterAtIndex result.length
    result

  parse: (text, error) ->
    return '' unless text
    (char for char in text when char isnt @delimiter).join('')

  isChangeValid: (change, error) ->
    return no unless super change, error

    newText = change.proposed.text

    if change.deleted.text is @delimiter
      newText = newText.substring(0, change.deleted.start - 1) + newText.substring(change.deleted.end - 1)

    range = change.proposed.selectedRange
    hasSelection = range.length isnt 0
    startMovedLeft = range.start < change.current.selectedRange.start
    endMovedLeft = (range.start + range.length) < (change.current.selectedRange.start + change.current.selectedRange.length)

    if @hasDelimiterAtIndex range.start
      if startMovedLeft
        range.start--
        range.length++
      else
        range.start++
        range.length--

    if hasSelection
      if @hasDelimiterAtIndex range.start + range.length - 1
        if startMovedLeft or endMovedLeft
          range.length--
        else
          range.length++
    else
      range.length = 0

    isChangeValid = yes

    object = @parse newText, (args...) ->
      isChangeValid = no
      error args...

    if isChangeValid
      change.proposed.text = @format object

    return isChangeValid

module.exports = DelimitedTextFormatter
