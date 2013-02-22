Formatter = require './formatter'

class DelimitedTextFormatter extends Formatter
  delimiter: null

  delimiterAt: (index) ->
    return '' unless @hasDelimiterAtIndex index
    @delimiter

  isDelimiter: (char) ->
    char is @delimiter

  constructor: (delimiter=@delimiter) ->
    @delimiter = delimiter
    if @delimiter?.length isnt 1
      throw new Error('delimiter must have just one character')

  format: (value) ->
    @_textFromValue value

  _textFromValue: (value) ->
    return '' unless value

    result = ''
    for char in value
      result += delimiter while delimiter = @delimiterAt result.length
      result += char
      result += delimiter while delimiter = @delimiterAt result.length
    result

  parse: (text, error) ->
    @_valueFromText text

  _valueFromText: (text) ->
    return '' unless text
    (char for char in text when not @isDelimiter(char)).join('')

  isChangeValid: (change, error) ->
    return no unless super change, error

    newText = change.proposed.text

    range        = change.proposed.selectedRange
    hasSelection = range.length isnt 0

    startMovedLeft  = range.start < change.current.selectedRange.start
    startMovedRight = range.start > change.current.selectedRange.start
    endMovedLeft    = (range.start + range.length) < (change.current.selectedRange.start + change.current.selectedRange.length)
    endMovedRight   = (range.start + range.length) > (change.current.selectedRange.start + change.current.selectedRange.length)

    startMovedOverADelimiter = startMovedLeft and @hasDelimiterAtIndex(range.start) \
                               or startMovedRight and @hasDelimiterAtIndex(range.start - 1)
    endMovedOverADelimiter   = endMovedLeft and @hasDelimiterAtIndex(range.start + range.length) \
                               or endMovedRight and @hasDelimiterAtIndex(range.start + range.length - 1)

    if @isDelimiter change.deleted.text
      newCursorPosition = change.deleted.start - 1
      # delete any immediately preceding delimiters
      while @isDelimiter newText.charAt(newCursorPosition)
        newText = newText.substring(0, newCursorPosition) + newText.substring(newCursorPosition + 1)
        newCursorPosition--
      # finally delete the real character that was intended
      newText = newText.substring(0, newCursorPosition) + newText.substring(newCursorPosition + 1)

    # adjust the cursor / selection
    if startMovedLeft and startMovedOverADelimiter
      # move left over any immediately preceding delimiters
      while @delimiterAt range.start - 1
        range.start--
        range.length++
      # finally move left over the real intended character
      range.start--
      range.length++

    if startMovedRight
      # move right over any immediately following delimiters
      # In all but one scenario, the cursor should already be placed after the delimiter group,
      # the one exception is when the format has a leading delimiter. In this case,
      # we need to move past all leading delimiters before placing the real character input
      while @delimiterAt range.start
        range.start++
        range.length--
      # if the first character was a delimiter, then move right over the real character that was intended
      if startMovedOverADelimiter
        range.start++
        range.length--
        # move right over any delimiters that might immediately follow the real character
        while @delimiterAt range.start
          range.start++
          range.length--

    if hasSelection # Otherwise, the logic for the range start takes care of everything.
      if endMovedOverADelimiter
        if endMovedLeft
          # move left over any immediately preceding delimiters
          while @delimiterAt range.start + range.length - 1
            range.length--
          # finally move left over the real intended character
          range.length--

        if endMovedRight
          # move right over any immediately following delimters
          while @delimiterAt range.start + range.length
            range.length++
          # finally move right over the real intended character
          range.length++

      # trailing delimiters in the selection
      while @hasDelimiterAtIndex range.start + range.length - 1
        if startMovedLeft or endMovedLeft
          range.length--
        else
          range.length++

      while @hasDelimiterAtIndex range.start
        if startMovedRight or endMovedRight
          range.start++
          range.length--
        else
          range.start--
          range.length++
    else
      range.length = 0

    isChangeValid = yes

    value = @_valueFromText newText, (args...) ->
      isChangeValid = no
      error args...

    if isChangeValid
      change.proposed.text = @_textFromValue value

    return isChangeValid

module.exports = DelimitedTextFormatter
