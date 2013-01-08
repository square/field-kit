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
    return null unless text
    (char for char in text when char isnt @delimiter).join('')

  isChangeValid: (change, error) ->
    return no unless super change, error

    newText = change.proposed.text

    if change.deleted.text is @delimiter
      newText = newText.substring(0, newText.length - 1)

    caret = change.proposed.caret
    hasSelection = caret.start isnt caret.end
    startMovedLeft = caret.start < change.current.caret.start
    endMovedLeft = caret.end < change.current.caret.end

    if @hasDelimiterAtIndex caret.start
      if startMovedLeft
        caret.start--
      else
        caret.start++

    if hasSelection
      if @hasDelimiterAtIndex caret.end - 1
        if startMovedLeft or endMovedLeft
          caret.end--
        else
          caret.end++
    else
      caret.end = caret.start

    isChangeValid = yes

    object = @parse newText, (args...) ->
      isChangeValid = no
      error args...

    if isChangeValid
      change.proposed.text = @format object

    return isChangeValid

module.exports = DelimitedTextFormatter
