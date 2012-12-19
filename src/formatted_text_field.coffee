KEYS =
  A:         65
  ZERO:      48
  NINE:      57
  LEFT:      37
  RIGHT:     39
  UP:        38
  DOWN:      40
  BACKSPACE:  8
  DELETE:    46

KEYS.isDigit = (keyCode) ->
  @ZERO <= keyCode <= @NINE

KEYS.isDirectional = (keyCode) ->
  keyCode in [@LEFT, @RIGHT, @UP, @DOWN]

isWordChar = (char) -> char and /^\w$/.test(char)

class FormattedTextField
  # Internal: Contains either "left", "right", or null to indicate the
  # direction the free end of the selection is from its anchor.
  selectionDirection: null

  constructor: (@element) ->
    @element.on 'keydown', @keyDown
    @element.on 'keypress', @keyPress
    @element.on 'keyup', @keyUp
    @element.on 'click', @click

  # Handles a key event that is trying to insert a character.
  #
  # Returns nothing.
  insertCharacter: (event) ->
    event.preventDefault()

    # clear any selection and cut out if we're full
    @clearSelection() if @hasSelection
    return if @formatter.length and @value.length >= @formatter.length

    # insert the character
    @replaceSelection String.fromCharCode(event.charCode)
    caret = @caret
    caret.start = caret.end
    @caret = caret

  # Moves the cursor up, which because this is a single-line text field, means
  # moving to the beginning of the value.
  #
  # Examples
  #
  #   Hey guys|
  #   moveUp(event)
  #   |Hey guys
  #
  #   Hey |guys|
  #   moveUp(event)
  #   |Hey guys
  #
  # Returns nothing.
  moveUp: (event) ->
    event.preventDefault()

    @caret = start: 0, end: 0
    @selectionDirection = null

  # Moves the cursor up, keeping the current anchor point and extending the
  # selection to the beginning as #moveUp would.
  #
  # Examples
  #
  #   # rightward selections are shrunk
  #   Hey guys, |where> are you?
  #   moveUpAndModifySelection(event)
  #   <Hey guys, |where are you?
  #
  #   # leftward selections are extended
  #   Hey guys, <where| are you?
  #   moveUpAndModifySelection(event)
  #   <Hey guys, where| are you?
  #
  #   # neutral selections are extended
  #   Hey guys, |where| are you?
  #   moveUpAndModifySelection(event)
  #   <Hey guys, where| are you?
  #
  # Returns nothing.
  moveUpAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left', null
        # 12<34 56|78  =>  <1234 56|78
        caret.start = 0
      when 'right'
        # 12|34 56>78   =>   <12|34 5678
        caret.end = caret.start
        caret.start = 0

    @caret = caret
    @selectionDirection = if caret.start is caret.end then null else 'left'

  # Moves the cursor down, which because this is a single-line text field,
  # means moving to the end of the value.
  #
  # Examples
  #
  #   Hey |guys
  #   moveDown(event)
  #   Hey guys|
  #
  #   |Hey| guys
  #   moveDown(event)
  #   Hey guys|
  #
  # Returns nothing.
  moveDown: (event) ->
    end = @value.length
    event.preventDefault()

    # 12|34 56|78  =>  1234 5678|
    @caret = start: end, end: end
    @selectionDirection = null

  # Moves the cursor down, keeping the current anchor point and extending the
  # selection to the end as #moveDown would.
  #
  # Examples
  #
  #   # leftward selections are shrunk
  #   Hey guys, <where| are you?
  #   moveDownAndModifySelection(event)
  #   Hey guys, |where are you?>
  #
  #   # rightward selections are extended
  #   Hey guys, |where> are you?
  #   moveDownAndModifySelection(event)
  #   Hey guys, where| are you?>
  #
  #   # neutral selections are extended
  #   Hey guys, |where| are you?
  #   moveDownAndModifySelection(event)
  #   Hey guys, |where are you?>
  #
  # Returns nothing.
  moveDownAndModifySelection: (event) ->
    caret = @caret
    end = @value.length
    event.preventDefault()

    switch @selectionDirection
      when 'left'
        caret.start = caret.end
        caret.end = end
      when 'right', null
        caret.end = end

    @caret = caret
    @selectionDirection = if caret.start is caret.end then null else 'right'

  # Moves the cursor to the left, counting selections as a thing to move past.
  #
  # Examples
  #
  #   # no selection just moves the cursor left
  #   Hey guys|
  #   moveLeft(event)
  #   Hey guy|s
  #
  #   # selections are removed
  #   Hey |guys|
  #   moveLeft(event)
  #   Hey |guys
  #
  # Returns nothing.
  moveLeft: (event) ->
    caret = @caret
    event.preventDefault()

    if @hasSelection
      # 1234 5678  =>  1234 5678
      #   |--|           |
      caret.end = caret.start
    else
      # 1234 5678  =>  1234 5678
      #   |             |
      caret.start--
      caret.end--

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  # Moves the free end of the selection one to the left.
  #
  # Examples
  #
  #   # no selection just selects to the left
  #   Hey guys|
  #   moveLeftAndModifySelection(event)
  #   Hey guy<s|
  #
  #   # left selections are extended
  #   Hey <guys|
  #   moveLeftAndModifySelection(event)
  #   Hey< guys|
  #
  #   # right selections are shrunk
  #   Hey |guys>
  #   moveLeftAndModifySelection(event)
  #   Hey |guy>s
  #
  #   # neutral selections are extended
  #   Hey |guys|
  #   moveLeftAndModifySelection(event)
  #   Hey< guys|
  #
  # Returns nothing.
  moveLeftAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left', null
        @selectionDirection = 'left'
        caret.start--
      when 'right'
        caret.end--

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  # Moves the cursor left until the start of a word is found.
  #
  # Examples
  #
  #   # no selection just moves the cursor left
  #   Hey guys|
  #   moveWordLeft(event)
  #   Hey |guys
  #
  #   # selections are removed
  #   Hey |guys|
  #   moveWordLeft(event)
  #   |Hey guys
  #
  # Returns nothing.
  moveWordLeft: (event) ->
    event.preventDefault()
    index = @lastWordBreakBeforeIndex @caret.start - 1
    @caret = start: index, end: index
    @selectionDirection = null

  # Moves the free end of the current selection to the beginning of the
  # previous word.
  #
  # Examples
  #
  #   # no selection just selects to the left
  #   Hey guys|
  #   moveWordLeftAndModifySelection(event)
  #   Hey |guys|
  #
  #   # left selections are extended
  #   Hey <guys|
  #   moveWordLeftAndModifySelection(event)
  #   <Hey guys|
  #
  #   # right selections are shrunk
  #   |Hey guys>
  #   moveWordLeftAndModifySelection(event)
  #   |Hey >guys
  #
  #   # neutral selections are extended
  #   Hey |guys|
  #   moveWordLeftAndModifySelection(event)
  #   <Hey guys|
  #
  # Returns nothing.
  moveWordLeftAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left', null
        @selectionDirection = 'left'
        caret.start = @lastWordBreakBeforeIndex caret.start - 1
      when 'right'
        caret.end = @lastWordBreakBeforeIndex caret.end
        caret.end = caret.start if caret.end < caret.start

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  # Moves the cursor to the right, counting selections as a thing to move past.
  #
  # Examples
  #
  #   # no selection just moves the cursor right
  #   Hey guy|s
  #   moveRight(event)
  #   Hey guys|
  #
  #   # selections are removed
  #   Hey |guys|
  #   moveRight(event)
  #   Hey guys|
  #
  # Returns nothing.
  moveRight: (event) ->
    caret = @caret
    event.preventDefault()

    if @hasSelection
      caret.start = caret.end
    else
      caret.start++
      caret.end++

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  # Moves the free end of the selection one to the right.
  #
  # Examples
  #
  #   # no selection just selects to the right
  #   Hey |guys
  #   moveRightAndModifySelection(event)
  #   Hey |g>uys
  #
  #   # right selections are extended
  #   Hey |gu>ys
  #   moveRightAndModifySelection(event)
  #   Hey |guy>s
  #
  #   # left selections are shrunk
  #   <Hey |guys
  #   moveRightAndModifySelection(event)
  #   H<ey |guys
  #
  #   # neutral selections are extended
  #   |Hey| guys
  #   moveRightAndModifySelection(event)
  #   |Hey >guys
  #
  # Returns nothing.
  moveRightAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left'
        caret.start++
      when 'right', null
        @selectionDirection = 'right'
        caret.end++

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  # Moves the cursor right until the end of a word is found.
  #
  # Examples
  #
  #   # no selection just moves the cursor right
  #   Hey| guys
  #   moveWordRight(event)
  #   Hey guys|
  #
  #   # selections are removed
  #   |Hey| guys
  #   moveWordRight(event)
  #   Hey guys|
  #
  # Returns nothing.
  moveWordRight: (event) ->
    event.preventDefault()
    index = @nextWordBreakAfterIndex @caret.end
    @caret = start: index, end: index
    @selectionDirection = null

  # Moves the free end of the current selection to the next end of word.
  #
  # Examples
  #
  #   # no selection just selects to the right
  #   Hey |guys
  #   moveWordRightAndModifySelection(event)
  #   Hey |guys|
  #
  #   # right selections are extended
  #   Hey |g>uys
  #   moveWordRightAndModifySelection(event)
  #   Hey |guys>
  #
  #   # left selections are shrunk
  #   He<y |guys
  #   moveWordRightAndModifySelection(event)
  #   Hey< |guys
  #
  #   # neutral selections are extended
  #   He|y |guys
  #   moveWordRightAndModifySelection(event)
  #   He|y guys>
  #
  # Returns nothing.
  moveWordRightAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left'
        caret.start = @nextWordBreakAfterIndex caret.start
        caret.start = caret.end if caret.start > caret.end
      when 'right', null
        @selectionDirection = 'right'
        caret.end = @nextWordBreakAfterIndex caret.end

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  # Deletes backward one character or clears a non-empty selection.
  #
  # Examples
  #
  #   |What's up, doc?
  #   deleteBackward(event)
  #   |What's up, doc?
  #
  #   What'|s up, doc?
  #   deleteBackward(event)
  #   What|s up, doc?
  #
  #   |What's| up, doc?
  #   deleteBackward(event)
  #   | up, doc?
  #
  # Returns nothing.
  deleteBackward: (event) ->
    event.preventDefault()

    unless @hasSelection
      caret = @caret
      caret.start--
      @caret = caret

    @clearSelection()

  # Deletes backward one word or clears a non-empty selection.
  #
  # Examples
  #
  #   |What's up, doc?
  #   deleteWordBackward(event)
  #   |What's up, doc?
  #
  #   What'|s up, doc?
  #   deleteWordBackward(event)
  #   |s up, doc?
  #
  #   |What's| up, doc?
  #   deleteWordBackward(event)
  #   | up, doc?
  #
  # Returns nothing.
  deleteWordBackward: (event) ->
    if @hasSelection
      return @deleteBackward event

    event.preventDefault()
    caret = @caret

    caret.start = @lastWordBreakBeforeIndex caret.start - 1

    @caret = caret
    @clearSelection()

  # Deletes backward one character, clears a non-empty selection, or decomposes
  # an accented character to its simple form.
  #
  # TODO: Make this work as described.
  #
  # Examples
  #
  #   |fiancée
  #   deleteBackwardByDecomposingPreviousCharacter(event)
  #   |What's up, doc?
  #
  #   fianc|é|e
  #   deleteBackwardByDecomposingPreviousCharacter(event)
  #   fianc|e
  #
  #   fiancé|e
  #   deleteBackwardByDecomposingPreviousCharacter(event)
  #   fiance|e
  #
  # Returns nothing.
  deleteBackwardByDecomposingPreviousCharacter: (event) ->
    @deleteBackward event

  # Deletes forward one character or clears a non-empty selection.
  #
  # Examples
  #
  #   What's up, doc?|
  #   deleteForward(event)
  #   What's up, doc?|
  #
  #   What'|s up, doc?
  #   deleteForward(event)
  #   What'| up, doc?
  #
  #   |What's| up, doc?
  #   deleteForward(event)
  #   | up, doc?
  #
  # Returns nothing.
  deleteForward: (event) ->
    event.preventDefault()

    unless @hasSelection
      caret = @caret
      caret.end++
      @caret = caret

    @clearSelection()

  # Deletes forward one word or clears a non-empty selection.
  #
  # Examples
  #
  #   What's up, doc?|
  #   deleteWordForward(event)
  #   What's up, doc?|
  #
  #   What's |up, doc?
  #   deleteWordForward(event)
  #   What's |, doc?
  #
  #   |What's| up, doc?
  #   deleteWordForward(event)
  #   | up, doc?
  #
  # Returns nothing.
  deleteWordForward: (event) ->
    if @hasSelection
      return @deleteForward event

    caret = @caret
    event.preventDefault()

    caret.end = @nextWordBreakAfterIndex caret.end

    @caret = caret
    @clearSelection()

  # Determines whether this field has any selection.
  #
  # Returns true if there is at least one character selected, false otherwise.
  @::__defineGetter__ 'hasSelection', ->
    caret = @caret
    caret.start isnt caret.end

  # Internal: Finds the start of the "word" before index.
  #
  # index - The position in value at which to start looking.
  #
  # Returns an index in value less than or equal to the given index.
  lastWordBreakBeforeIndex: (index) ->
    indexes = @leftWordBreakIndexes
    result = indexes[0]

    for wordBreakIndex in indexes
      if index > wordBreakIndex
        result = wordBreakIndex
      else
        break

    return result

  # Internal: Find starts of "words" for navigational purposes.
  #
  # Examples
  #
  #   # given value of "123456789" and text of "123-45-6789"
  #   >> leftWordBreakIndexes
  #   => [0, 3, 5]
  #
  # Returns an Array of Numbers mapping to indexes in the value at which
  # "words" start.
  @::__defineGetter__ 'leftWordBreakIndexes', ->
    result = []
    text = @text

    for i in [0..text.length-1]
      result.push i if not isWordChar(text[i-1]) and isWordChar(text[i])

    return result

  # Internal: Finds the end of the "word" after index.
  #
  # index - The position in value at which to start looking.
  #
  # Returns an index in value greater than or equal to the given index.
  nextWordBreakAfterIndex: (index) ->
    indexes = @rightWordBreakIndexes.reverse()
    result = indexes[0]

    for wordBreakIndex in indexes
      if index < wordBreakIndex
        result = wordBreakIndex
      else
        break

    return result

  # Internal: Find ends of "words" for navigational purposes.
  #
  # Examples
  #
  #   # given value of "123456789" and text of "123-45-6789"
  #   >> rightWordBreakIndexes
  #   => [3, 5, 9]
  #
  # Returns an Array of Numbers mapping to indexes in the value at which
  # "words" end.
  @::__defineGetter__ 'rightWordBreakIndexes', ->
    result = []
    text = @text

    for i in [0..text.length-1]
      result.push i+1 if isWordChar(text[i]) and not isWordChar(text[i+1])

    return result

  # Internal: Clears all characters in the existing selection.
  #
  # Examples
  #
  #   12|34567|8
  #   clearSelection()
  #   12|8
  #
  # Returns nothing.
  clearSelection: ->
    @replaceSelection ''

  # Internal: Replaces the characters within the selection with given text.
  #
  # Examples
  #
  #   12|34567|8
  #   replaceSelection("00")
  #   12|00|8
  #
  # Returns nothing.
  replaceSelection: (text) ->
    caret = @caret
    value = @value

    value = value.substring(0, caret.start) + text + value.substring(caret.end)
    caret.end = caret.start + text.length

    @value = value
    @caret = caret
    @selectionDirection = null

  # Internal: Expands the selection to contain all the characters in the content.
  #
  # Examples
  #
  #   123|45678
  #   selectAll(event)
  #   |12345678|
  #
  # Returns nothing.
  selectAll: (event) ->
    # Let the browser act as normal, but also do it ourselves.
    value = @value
    @caret = start: 0, end: value.length
    @selectionDirection = null

  # Internal: Handles keyDown events. This method essentially just delegates to
  # other, more semantic, methods based on the modifier keys and the pressed
  # key of the event.
  #
  # Returns nothing.
  keyDown: (event) =>
    @rollbackInvalidChanges =>
      {keyCode, metaKey, ctrlKey, shiftKey, altKey} = event

      # cmd / ctrl + A (select all) should reset selection direction
      if (metaKey or ctrlKey) and keyCode is KEYS.A
        @selectAll event

      # cmd / ctrl, probably doing some action
      else if metaKey or ctrlKey
        -> # pass

      # ← ↑ → ↓
      else if KEYS.isDirectional keyCode
        switch keyCode
          when KEYS.LEFT
            if shiftKey and altKey
              @moveWordLeftAndModifySelection event
            else if shiftKey
              @moveLeftAndModifySelection event
            else if altKey
              @moveWordLeft event
            else
              @moveLeft event
          when KEYS.RIGHT
            if shiftKey and altKey
              @moveWordRightAndModifySelection event
            else if shiftKey
              @moveRightAndModifySelection event
            else if altKey
              @moveWordRight event
            else
              @moveRight event
          when KEYS.UP
            if shiftKey then @moveUpAndModifySelection event
            else @moveUp event
          when KEYS.DOWN
            if shiftKey then @moveDownAndModifySelection event
            else @moveDown event

      # ⌫
      else if keyCode is KEYS.BACKSPACE
        if altKey
          @deleteWordBackward event
        else if ctrlKey
          @deleteBackwardByDecomposingPreviousCharacter event
        else
          @deleteBackward event

      else if keyCode is KEYS.DELETE
        if altKey
          @deleteWordForward event
        else
          @deleteForward event

      return null

  # Internal: Handles inserting characters based on the typed key.
  #
  # Returns nothing.
  keyPress: (event) =>
    @rollbackInvalidChanges =>
      @insertCharacter event

  # Internal: Handles keyUp events by reformatting the text after a
  # (presumably) unhandled key event may have modified the value.
  #
  # Returns nothing.
  keyUp: (event) =>
    caret = @caret
    value = @value

    @value = value
    @caret = caret

  # Internal: Checks changes after invoking the passed function for validity
  # and rolls them back if the changes turned out to be invalid.
  #
  # Returns whatever the given callback returns.
  rollbackInvalidChanges: (callback) ->
    change = current: { @caret, @value }
    result = callback()
    change.proposed = { @caret, @value }

    if typeof @formatter.isChangeValid is 'function'
      if @formatter.isChangeValid(change)
        @value = change.proposed.value
        @caret = change.proposed.caret
      else
        @value = change.current.value
        @caret = change.current.caret

    return result

  # Internal: Handles clicks by resetting the selection direction.
  #
  # Returns nothing.
  click: (event) =>
    @selectionDirection = null

  on: (args...) ->
    @element.on args...

  off: (args...) ->
    @element.off args...

  # Gets the formatted text value. This is the same as the value of the
  # underlying input element.
  #
  # Returns a String containing the input value.
  @::__defineGetter__ 'text', ->
    @element.val()

  # Sets the formatted text value. This generally should not be used. Instead,
  # use the value setter.
  @::__defineSetter__ 'text', (text) ->
    @element.val(text)

  # Gets the object value. This is the value that should be considered the
  # "real" value of the field.
  #
  # Returns an Object containing the parsed value of the field.
  @::__defineGetter__ 'value', ->
    value = @element.val()
    return value unless @_formatter
    @_formatter.parse value

  # Sets the object value of the field.
  @::__defineSetter__ 'value', (value) ->
    value = @_formatter.format(value) if @_formatter
    @element.val "#{value}"
    @element.trigger 'change'

  # Gets the current formatter. Formatters are used to translate between #text
  # and #value propertiees of the field.
  @::__defineGetter__ 'formatter', ->
    @_formatter

  # Sets the current formatter.
  @::__defineSetter__ 'formatter', (formatter) ->
    value = @value
    @_formatter = formatter
    @value = value

  # Gets the selection caret with start and end indexes relative to #value.
  #
  # Returns an Object with 'start' and 'end' keys.
  @::__defineGetter__ 'caret', ->
    { start, end } = @element.caret()
    return { start, end }

  # Sets the current selection caret.
  @::__defineSetter__ 'caret', (caret) ->
    min = 0
    max = @value.length
    caret =
      start: Math.max(min, Math.min(max, caret.start))
      end: Math.max(min, Math.min(max, caret.end))
    @element.caret caret

if module?
  module.exports = FormattedTextField
else if window?
  window.FormattedTextField = FormattedTextField
