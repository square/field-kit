UndoManager = require './undo_manager'

KEYS =
  A:         65
  Y:         89
  Z:         90
  ZERO:      48
  NINE:      57
  LEFT:      37
  RIGHT:     39
  UP:        38
  DOWN:      40
  BACKSPACE:  8
  DELETE:    46
  TAB:        9
  ENTER:     13

KEYS.isDigit = (keyCode) ->
  @ZERO <= keyCode <= @NINE

KEYS.isDirectional = (keyCode) ->
  keyCode in [@LEFT, @RIGHT, @UP, @DOWN]

AFFINITY =
  UPSTREAM:   0
  DOWNSTREAM: 1
  NONE:       null

isWordChar = (char) -> char and /^\w$/.test(char)

class TextField
  # Internal: Contains one of the AFFINITY enum to indicate the preferred
  # direction of selection.
  selectionAffinity: AFFINITY.NONE

  _delegate: null

  # Gets the current delegate for this text field.
  #
  # Returns an object implementing the TextField delegate interface.
  delegate: ->
    @_delegate

  # Sets the current delegate for this text field.
  #
  # delegate - An object implementing the TextField delegate interface.
  #
  # Returns nothing.
  setDelegate: (delegate) ->
    @_delegate = delegate
    return null

  constructor: (@element) ->
    @_jQuery = @element.constructor
    @element.on 'keydown', @keyDown
    @element.on 'keypress', @keyPress
    @element.on 'keyup', @keyUp
    @element.on 'click', @click
    @element.on 'paste', @paste
    @element.on 'focus', @_focus
    @element.on 'blur', @_blur
    @element.data 'field-kit-text-field', this

  # Handles a key event that is trying to insert a character.
  #
  # Returns nothing.
  insertText: (text) ->
    # clear any selection
    @clearSelection() if @hasSelection()

    # insert the text
    @replaceSelection text
    range = @selectedRange()
    range.start += range.length
    range.length = 0
    @setSelectedRange range

  insertNewline: (event) ->
    @_textFieldDidEndEditing()
    @_didEndEditingButKeptFocus = yes

  # Internal: Performs actions necessary for text change.
  #
  # Returns nothing.
  _textDidChange: ->
    @textDidChange()
    @_delegate?.textDidChange?(this)

  # Internal: Called when the user has changed the text of the field.
  #
  # Can be used in subclasses to perform actions suitable for this event.
  #
  # Returns nothing.
  textDidChange: ->

  # Internal: Performs actions necessary for ending editing.
  #
  # Returns nothing.
  _textFieldDidEndEditing: ->
    @textFieldDidEndEditing()
    @_delegate?.textFieldDidEndEditing?(this)

  # Internal: Called when the user has in some way declared that they are done
  # editing, such as leaving the field or perhaps pressing enter.
  #
  # Can be used in subclasses to perform actions suitable for this event.
  #
  # Returns nothing.
  textFieldDidEndEditing: ->

  # Internal: Performs actions necessary for beginning editing.
  #
  # Returns nothing.
  _textFieldDidBeginEditing: ->
    @textFieldDidBeginEditing()
    @_delegate?.textFieldDidBeginEditing?(this)

  # Internal: Called when the user has in some way declared that they are
  # starting editing, such as entering the field or perhaps a key after
  # pressing enter.
  #
  # Can be used in subclasses to perform actions suitable for this event.
  #
  # Returns nothing.
  textFieldDidBeginEditing: ->

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
    @setSelectedRange start: 0, length: 0

  # Moves the cursor up to the beginning of the current paragraph, which
  # because this is a single-line text field, means moving to the beginning of
  # the value.
  #
  # Examples
  #
  #   Hey guys|
  #   moveToBeginningOfParagraph(event)
  #   |Hey guys
  #
  #   Hey |guys|
  #   moveToBeginningOfParagraph(event)
  #   |Hey guys
  #
  # Returns nothing.
  moveToBeginningOfParagraph: (event) ->
    @moveUp event

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
    event.preventDefault()
    range = @selectedRange()

    switch @selectionAffinity
      when AFFINITY.UPSTREAM, AFFINITY.NONE
        # 12<34 56|78  =>  <1234 56|78
        range.length += range.start
        range.start = 0
      when AFFINITY.DOWNSTREAM
        # 12|34 56>78   =>   <12|34 5678
        range.length = range.start
        range.start = 0

    @setSelectedRangeWithAffinity range, AFFINITY.UPSTREAM

  # Moves the free end of the selection to the beginning of the paragraph, or
  # since this is a single-line text field to the beginning of the line.
  #
  # Returns nothing.
  moveParagraphBackwardAndModifySelection: (event) ->
    event.preventDefault()
    range = @selectedRange()

    switch @selectionAffinity
      when AFFINITY.UPSTREAM, AFFINITY.NONE
        # 12<34 56|78  =>  <1234 56|78
        range.length += range.start
        range.start = 0
      when AFFINITY.DOWNSTREAM
        # 12|34 56>78  =>  12|34 5678
        range.length = 0

    @setSelectedRangeWithAffinity range, AFFINITY.UPSTREAM

  # Moves the cursor to the beginning of the document.
  #
  # Returns nothing.
  moveToBeginningOfDocument: (event) ->
    # Since we only support a single line this is just an alias.
    @moveToBeginningOfLine event

  # Moves the selection start to the beginning of the document.
  #
  # Returns nothing.
  moveToBeginningOfDocumentAndModifySelection: (event) ->
    event.preventDefault()
    range = @selectedRange()
    range.length += range.start
    range.start = 0
    @setSelectedRangeWithAffinity range, AFFINITY.UPSTREAM

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
    event.preventDefault()
    # 12|34 56|78  =>  1234 5678|
    range = start: @text().length, length: 0
    @setSelectedRangeWithAffinity range, AFFINITY.NONE

  # Moves the cursor up to the end of the current paragraph, which because this
  # is a single-line text field, means moving to the end of the value.
  #
  # Examples
  #
  #   |Hey guys
  #   moveToEndOfParagraph(event)
  #   Hey guys|
  #
  #   Hey |guys|
  #   moveToEndOfParagraph(event)
  #   Hey guys|
  #
  # Returns nothing.
  moveToEndOfParagraph: (event) ->
    @moveDown event

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
    event.preventDefault()
    range = @selectedRange()
    end = @text().length

    if @selectionAffinity is AFFINITY.UPSTREAM
      range.start += range.length

    range.length = end - range.start
    @setSelectedRangeWithAffinity range, AFFINITY.DOWNSTREAM

  # Moves the free end of the selection to the end of the paragraph, or since
  # this is a single-line text field to the end of the line.
  #
  # Returns nothing.
  moveParagraphForwardAndModifySelection: (event) ->
    event.preventDefault()
    range = @selectedRange()

    switch @selectionAffinity
      when AFFINITY.DOWNSTREAM, AFFINITY.NONE
        # 12|34 56>78  =>  12|34 5678>
        range.length = @text().length - range.start
      when AFFINITY.UPSTREAM
        # 12<34 56|78  =>  12|34 5678
        range.start += range.length
        range.length = 0

    @setSelectedRangeWithAffinity range, AFFINITY.DOWNSTREAM

  # Moves the cursor to the end of the document.
  #
  # Returns nothing.
  moveToEndOfDocument: (event) ->
    # Since we only support a single line this is just an alias.
    @moveToEndOfLine event

  # Moves the selection end to the end of the document.
  #
  # Returns nothing.
  moveToEndOfDocumentAndModifySelection: (event) ->
    event.preventDefault()
    range = @selectedRange()
    range.length = @text().length - range.start
    @setSelectedRangeWithAffinity range, AFFINITY.DOWNSTREAM

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
    event.preventDefault()
    range = @selectedRange()

    if range.length isnt 0
      range.length = 0
    else
      range.start--

    @setSelectedRangeWithAffinity range, AFFINITY.NONE

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
    event.preventDefault()
    range = @selectedRange()

    switch @selectionAffinity
      when AFFINITY.UPSTREAM, AFFINITY.NONE
        @selectionAffinity = AFFINITY.UPSTREAM
        range.start--
        range.length++
      when AFFINITY.DOWNSTREAM
        range.length--

    @setSelectedRange range

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
    index = @lastWordBreakBeforeIndex @selectedRange().start - 1
    @setSelectedRange start: index, length: 0

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
    event.preventDefault()
    range = @selectedRange()

    switch @selectionAffinity
      when AFFINITY.UPSTREAM, AFFINITY.NONE
        @selectionAffinity = AFFINITY.UPSTREAM
        start = @lastWordBreakBeforeIndex range.start - 1
        range.length += range.start - start
        range.start = start
      when AFFINITY.DOWNSTREAM
        end = @lastWordBreakBeforeIndex range.start + range.length
        end = range.start if end < range.start
        range.length -= range.start + range.length - end

    @setSelectedRange range

  # Moves the cursor to the beginning of the current line.
  #
  # Examples
  #
  #   Hey guys, where| are ya?
  #   moveToBeginningOfLine(event)
  #   |Hey guys, where are ya?
  #
  # Returns nothing.
  moveToBeginningOfLine: (event) ->
    event.preventDefault()
    @setSelectedRange start: 0, length: 0

  # Select from the free end of the selection to the beginning of line.
  #
  # Examples
  #
  #   Hey guys, where| are ya?
  #   moveToBeginningOfLineAndModifySelection(event)
  #   <Hey guys, where| are ya?
  #
  #   Hey guys, where| are> ya?
  #   moveToBeginningOfLineAndModifySelection(event)
  #   <Hey guys, where are| ya?
  #
  # Returns nothing.
  moveToBeginningOfLineAndModifySelection: (event) ->
    event.preventDefault()
    range = @selectedRange()
    range.length += range.start
    range.start = 0
    @setSelectedRangeWithAffinity range, AFFINITY.UPSTREAM

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
    event.preventDefault()
    range = @selectedRange()

    if range.length isnt 0
      range.start += range.length
      range.length = 0
    else
      range.start++

    @setSelectedRangeWithAffinity range, AFFINITY.NONE

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
    event.preventDefault()
    range = @selectedRange()

    switch @selectionAffinity
      when AFFINITY.UPSTREAM
        range.start++
        range.length--
      when AFFINITY.DOWNSTREAM, AFFINITY.NONE
        @selectionAffinity = AFFINITY.DOWNSTREAM
        range.length++

    @setSelectedRange range

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
    range = @selectedRange()
    index = @nextWordBreakAfterIndex range.start + range.length
    @setSelectedRange start: index, length: 0

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
    event.preventDefault()
    range = @selectedRange()
    start = range.start
    end = range.start + range.length

    switch @selectionAffinity
      when AFFINITY.UPSTREAM
        start = Math.min @nextWordBreakAfterIndex(start), end
      when AFFINITY.DOWNSTREAM, AFFINITY.NONE
        @selectionAffinity = AFFINITY.DOWNSTREAM
        end = @nextWordBreakAfterIndex range.start + range.length

    @setSelectedRange start: start, length: end - start

  # Moves the cursor to the end of the current line.
  #
  # Examples
  #
  #   Hey guys, where| are ya?
  #   moveToEndOfLine(event)
  #   |Hey guys, where are ya?
  #
  # Returns nothing.
  moveToEndOfLine: (event) ->
    event.preventDefault()
    @setSelectedRange start: @text().length, length: 0

  # Moves the free end of the selection to the end of the current line.
  #
  # Examples
  #
  #   Hey guys, where| are ya?
  #   moveToEndofLineAndModifySelection(event)
  #   Hey guys, where| are ya?>
  #
  #   Hey guys, <where| are ya?
  #   moveToEndofLineAndModifySelection(event)
  #   Hey guys, |where are ya?>
  #
  # Returns nothing.
  moveToEndOfLineAndModifySelection: (event) ->
    event.preventDefault()
    range = @selectedRange()
    range.length = @text().length - range.start
    @setSelectedRangeWithAffinity range, AFFINITY.DOWNSTREAM

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
    range = @selectedRange()

    if range.length is 0
      range.start--
      range.length++
      @setSelectedRange range

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
    if @hasSelection()
      return @deleteBackward event

    event.preventDefault()
    range = @selectedRange()

    start = @lastWordBreakBeforeIndex range.start
    range.length += range.start - start
    range.start = start

    @setSelectedRange range
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

  # Deletes all characters before the cursor or clears a non-empty selection.
  #
  # Examples
  #
  #   The quick |brown fox.
  #   deleteBackwardToBeginningOfLine(event)
  #   |brown fox.
  #
  #   The |quick |brown fox.
  #   deleteBackwardToBeginningOfLine(event)
  #   The brown fox.
  #
  # Returns nothing.
  deleteBackwardToBeginningOfLine: (event) ->
    if @hasSelection()
      return @deleteBackward event

    event.preventDefault()
    range = @selectedRange()
    range.length = range.start
    range.start = 0
    @setSelectedRange range
    @clearSelection()

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
    range = @selectedRange()

    if range.length is 0
      range.length++
      @setSelectedRange range

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
    if @hasSelection()
      return @deleteForward event

    event.preventDefault()
    range = @selectedRange()

    end = @nextWordBreakAfterIndex range.start + range.length

    @setSelectedRange start: range.start, length: end - range.start
    @clearSelection()

  # Handles the tab key.
  #
  # Returns nothing.
  insertTab: (event) ->

  # Handles the back tab key.
  #
  # Returns nothing.
  insertBackTab: (event) ->

  # Determines whether this field has any selection.
  #
  # Returns true if there is at least one character selected, false otherwise.
  hasSelection: ->
    @selectedRange().length isnt 0

  # Internal: Finds the start of the "word" before index.
  #
  # index - The position in value at which to start looking.
  #
  # Returns an index in value less than or equal to the given index.
  lastWordBreakBeforeIndex: (index) ->
    indexes = @leftWordBreakIndexes()
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
  #   >> leftWordBreakIndexes()
  #   => [0, 3, 5]
  #
  # Returns an Array of Numbers mapping to indexes in the value at which
  # "words" start.
  leftWordBreakIndexes: ->
    result = []
    text = @text()

    for i in [0..text.length-1]
      result.push i if not isWordChar(text[i-1]) and isWordChar(text[i])

    return result

  # Internal: Finds the end of the "word" after index.
  #
  # index - The position in value at which to start looking.
  #
  # Returns an index in value greater than or equal to the given index.
  nextWordBreakAfterIndex: (index) ->
    indexes = @rightWordBreakIndexes().reverse()
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
  #   >> rightWordBreakIndexes()
  #   => [3, 5, 9]
  #
  # Returns an Array of Numbers mapping to indexes in the value at which
  # "words" end.
  rightWordBreakIndexes: ->
    result = []
    text = @text()

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
  replaceSelection: (replacement) ->
    range = @selectedRange()
    end = range.start + range.length
    text = @text()

    text = text.substring(0, range.start) + replacement + text.substring(end)
    range.length = replacement.length

    @setText text
    @setSelectedRangeWithAffinity range, AFFINITY.NONE

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
    event.preventDefault()
    @setSelectedRangeWithAffinity {start: 0, length: @text().length}, AFFINITY.NONE

  # Replaces the current selection with text from the given pasteboard.
  #
  # pasteboard - A DOM event's clipboardData property value.
  #
  # Returns nothing.
  readSelectionFromPasteboard: (pasteboard) ->
    text = pasteboard.getData 'Text'
    @replaceSelection text
    range = @selectedRange()
    range.start += range.length
    range.length = 0
    @setSelectedRange range

  # Internal: Handles keyDown events. This method essentially just delegates to
  # other, more semantic, methods based on the modifier keys and the pressed
  # key of the event.
  #
  # Returns nothing.
  keyDown: (event) =>
    {keyCode, metaKey, ctrlKey, shiftKey, altKey} = event
    modifiers = []
    modifiers.push 'alt' if altKey
    modifiers.push 'ctrl' if ctrlKey
    modifiers.push 'meta' if metaKey
    modifiers.push 'shift' if shiftKey
    modifiers = modifiers.join '+'

    if @_didEndEditingButKeptFocus
      @_textFieldDidBeginEditing()
      @_didEndEditingButKeptFocus = no

    if keyCode is KEYS.Z and modifiers in ['meta', 'ctrl']
      @undoManager().undo() if @undoManager().canUndo()
      event.preventDefault()
    else if (keyCode is KEYS.Z and modifiers is 'meta+shift') or (keyCode is KEYS.Y and modifiers is 'ctrl')
      @undoManager().redo() if @undoManager().canRedo()
      event.preventDefault()

    @rollbackInvalidChanges =>
      if (metaKey or ctrlKey) and keyCode is KEYS.A
        @selectAll event

      else if keyCode is KEYS.LEFT
        switch modifiers
          when ''
            @moveLeft event
          when 'alt'
            @moveWordLeft event
          when 'shift'
            @moveLeftAndModifySelection event
          when 'alt+shift'
            @moveWordLeftAndModifySelection event
          when 'meta'
            @moveToBeginningOfLine event
          when 'meta+shift'
            @moveToBeginningOfLineAndModifySelection event
          else
            throw new Error("unhandled left+#{modifiers}")

      else if keyCode is KEYS.RIGHT
        switch modifiers
          when ''
            @moveRight event
          when 'alt'
            @moveWordRight event
          when 'shift'
            @moveRightAndModifySelection event
          when 'alt+shift'
            @moveWordRightAndModifySelection event
          when 'meta'
            @moveToEndOfLine event
          when 'meta+shift'
            @moveToEndOfLineAndModifySelection event
          else
            throw new Error("unhandled right+#{modifiers}")

      else if keyCode is KEYS.UP
        switch modifiers
          when ''
            @moveUp event
          when 'alt'
            @moveToBeginningOfParagraph event
          when 'shift'
            @moveUpAndModifySelection event
          when 'alt+shift'
            @moveParagraphBackwardAndModifySelection event
          when 'meta'
            @moveToBeginningOfDocument event
          when 'meta+shift'
            @moveToBeginningOfDocumentAndModifySelection event
          else
            throw new Error("unhandled up+#{modifiers}")

      else if keyCode is KEYS.DOWN
        switch modifiers
          when ''
            @moveDown event
          when 'alt'
            @moveToEndOfParagraph event
          when 'shift'
            @moveDownAndModifySelection event
          when 'alt+shift'
            @moveParagraphForwardAndModifySelection event
          when 'meta'
            @moveToEndOfDocument event
          when 'meta+shift'
            @moveToEndOfDocumentAndModifySelection event
          else
            throw new Error("unhandled down+#{modifiers}")

      # ⌫
      else if keyCode is KEYS.BACKSPACE
        switch modifiers
          when '', 'shift'
            @deleteBackward event
          when 'alt', 'alt+shift'
            @deleteWordBackward event
          when 'ctrl', 'ctrl+shift'
            @deleteBackwardByDecomposingPreviousCharacter event
          when 'meta', 'meta+shift'
            @deleteBackwardToBeginningOfLine event
          else
            throw new Error("unhandled backspace+#{modifiers}")

      else if keyCode is KEYS.DELETE
        if altKey
          @deleteWordForward event
        else
          @deleteForward event

      else if keyCode is KEYS.TAB
        if shiftKey
          @insertBackTab event
        else
          @insertTab event

      else if keyCode is KEYS.ENTER
        @insertNewline event

      return null

  # Internal: Handles inserting characters based on the typed key.
  #
  # Returns nothing.
  keyPress: (event) =>
    # Only handle keypresses that look like insertable text.
    if not event.metaKey and not event.ctrlKey and event.keyCode not in [KEYS.ENTER, KEYS.TAB, KEYS.BACKSPACE]
      event.preventDefault()
      @rollbackInvalidChanges =>
        @insertText String.fromCharCode(event.charCode)

  # Internal: Handles keyup events.
  #
  # Returns nothing.
  keyUp: (event) =>
    @rollbackInvalidChanges =>
      if event.keyCode is KEYS.TAB
        @selectAll event

  # Internal: Handles paste events.
  #
  # Returns nothing.
  paste: (event) =>
    event.preventDefault()
    @rollbackInvalidChanges =>
      @readSelectionFromPasteboard event.originalEvent.clipboardData

  # Internal: Checks changes after invoking the passed function for validity
  # and rolls them back if the changes turned out to be invalid.
  #
  # Returns whatever the given callback returns.
  rollbackInvalidChanges: (callback) ->
    result    = null
    errorType = null
    change    = TextFieldStateChange.build this, -> result = callback()
    error     = (type) -> errorType = type

    if change.hasChanges()
      if typeof @formatter()?.isChangeValid is 'function'
        if @formatter().isChangeValid(change, error)
          change.recomputeDiff()
          @setText change.proposed.text
          @setSelectedRange change.proposed.selectedRange
        else
          @delegate()?.textFieldDidFailToValidateChange?(this, change, errorType)
          @setText change.current.text
          @setSelectedRange change.current.selectedRange
          return result # change is rejected, don't do undo processing

      if change.inserted.text.length or change.deleted.text.length
        @undoManager().proxyFor(this)._applyChangeFromUndoManager(change)
        @_textDidChange()

    return result

  # Internal: Handles clicks by resetting the selection affinity.
  #
  # Returns nothing.
  click: (event) =>
    @selectionAffinity = AFFINITY.NONE

  on: (args...) ->
    @element.on args...

  off: (args...) ->
    @element.off args...

  # Gets the formatted text value. This is the same as the value of the
  # underlying input element.
  #
  # Returns a String containing the input value.
  text: ->
    @element.val()

  # Sets the formatted text value. This generally should not be used. Instead,
  # use the value setter.
  setText: (text) ->
    @element.val(text)

  # Gets the object value. This is the value that should be considered the
  # "real" value of the field.
  #
  # Returns an Object containing the parsed value of the field.
  value: ->
    value = @text()
    return value unless @_formatter
    @_formatter.parse value, (errorType) => @_delegate?.textFieldDidFailToParseString?(this, value, errorType)

  # Sets the object value of the field.
  setValue: (value) ->
    value = @_formatter.format(value) if @_formatter
    @setText "#{value}"
    @element.trigger 'change'

  # Gets the current formatter. Formatters are used to translate between #text
  # and #value propertiees of the field.
  formatter: ->
    @_formatter

  # Sets the current formatter.
  setFormatter: (formatter) ->
    value = @value()
    @_formatter = formatter
    @setValue value

  # Gets the range of the current selection.
  #
  # Returns an Object with 'start', 'length', and 'end' keys.
  selectedRange: ->
    caret = @element.caret()
    return start: caret.start, length: caret.end - caret.start

  # Sets the range of the current selection without changing the affinity.
  #
  # Returns nothing.
  setSelectedRange: (range) ->
    @setSelectedRangeWithAffinity range, @selectionAffinity

  # Sets the range of the current selection and the selection affinity.
  #
  # Returns nothing.
  setSelectedRangeWithAffinity: (range, affinity) ->
    min = 0
    max = @text().length
    caret =
      start: Math.max(min, Math.min(max, range.start))
      end: Math.max(min, Math.min(max, range.start + range.length))
    @element.caret caret
    @selectionAffinity = if range.length is 0 then AFFINITY.NONE else affinity

  # Gets the position of the current selection's anchor point, i.e. the point
  # that the selection extends from, if any.
  #
  # Returns an index within the current text.
  selectionAnchor: ->
    range = @selectedRange()
    switch @selectionAffinity
      when AFFINITY.UPSTREAM
        range.start + range.length
      when AFFINITY.DOWNSTREAM
        range.start
      else
        null

  ##
  ## Undo support
  ##

  # Gets the UndoManager for this text field.
  #
  # Returns an instance of UndoManager.
  undoManager: ->
    @_undoManager ||= new UndoManager()

  # Gets whether this text field records undo actions with its undo manager.
  #
  # Returns true if it does record undo actions, false otherwise.
  allowsUndo: ->
    @_allowsUndo

  # Sets whether this text field records undo actions with its undo manager.
  #
  # allowsUndo - true to record undo actions, false to prevent recording.
  #
  # Returns nothing.
  setAllowsUndo: (allowsUndo) ->
    @_allowsUndo = allowsUndo

  # Internal: Applies the given change as an undo/redo.
  #
  # Returns nothing.
  _applyChangeFromUndoManager: (change) ->
    @undoManager().proxyFor(this)._applyChangeFromUndoManager(change)

    if @undoManager().isUndoing()
      @setText change.current.text
      @setSelectedRange change.current.selectedRange
    else
      @setText change.proposed.text
      @setSelectedRange change.proposed.selectedRange

    @_textDidChange()

  ##
  ## Enabled/disabled support
  ##

  _enabled: yes

  isEnabled: ->
    @_enabled

  setEnabled: (@_enabled) ->
    @_syncPlaceholder()
    return null

  ##
  ## Focus/blur support
  ##

  hasFocus: ->
    @element.get(0).ownerDocument.activeElement is @element.get(0)

  _focus: (event) =>
    @_textFieldDidBeginEditing()
    @_syncPlaceholder()

  _blur: (event) =>
    @_textFieldDidEndEditing()
    @_syncPlaceholder()

  _didEndEditingButKeptFocus: no

  # Removes focus from this field if it has focus.
  #
  # Returns nothing.
  becomeFirstResponder: (event) ->
    @element.focus()
    @rollbackInvalidChanges =>
      @element.select()
      @_syncPlaceholder()

  # Removes focus from this field if it has focus.
  #
  # Returns nothing.
  resignFirstResponder: (event) ->
    event?.preventDefault()
    @element.blur()
    @_syncPlaceholder()

  ##
  ## Placeholder support
  ##

  _placeholder: null
  _disabledPlaceholder: null
  _focusedPlaceholder: null
  _unfocusedPlaceholder: null

  disabledPlaceholder: ->
    @_disabledPlaceholder

  setDisabledPlaceholder: (@_disabledPlaceholder) ->
    @_syncPlaceholder()
    return null

  focusedPlaceholder: ->
    @_focusedPlaceholder

  setFocusedPlaceholder: (@_focusedPlaceholder) ->
    @_syncPlaceholder()
    return null

  unfocusedPlaceholder: ->
    @_unfocusedPlaceholder

  setUnfocusedPlaceholder: (@_unfocusedPlaceholder) ->
    @_syncPlaceholder()
    return null

  placeholder: ->
    @_placeholder

  setPlaceholder: (@_placeholder) ->
    @element.attr 'placeholder', @_placeholder

  _syncPlaceholder: ->
    if not @_enabled
      @setPlaceholder @_disabledPlaceholder if @_disabledPlaceholder?
    else if @hasFocus()
      @setPlaceholder @_focusedPlaceholder if @_focusedPlaceholder?
    else
      @setPlaceholder @_unfocusedPlaceholder if @_unfocusedPlaceholder?

  ##
  ## Debug support
  ##

  inspect: ->
    "#<TextField text=\"#{@text()}\">"


class TextFieldStateChange
  field: null
  current: null
  proposed: null

  constructor: (@field) ->

  @build: (field, callback) ->
    change = new @(field)
    change.current = text: field.text(), selectedRange: field.selectedRange()
    callback()
    change.proposed = text: field.text(), selectedRange: field.selectedRange()
    change.recomputeDiff()
    return change

  hasChanges: ->
    @recomputeDiff()
    @current.text isnt @proposed.text or
      @current.selectedRange.start isnt @proposed.selectedRange.start or
      @current.selectedRange.length isnt @proposed.selectedRange.length

  recomputeDiff: ->
    if @proposed.text isnt @current.text
      ctext = @current.text
      ptext = @proposed.text
      sharedPrefixLength = 0
      sharedSuffixLength = 0
      minTextLength = Math.min(ctext.length, ptext.length)

      for i in [0...minTextLength]
        if ptext[i] is ctext[i]
          sharedPrefixLength = i + 1
        else
          break

      for i in [0...(minTextLength-sharedPrefixLength)]
        if ptext[ptext.length - 1 - i] is ctext[ctext.length - 1 - i]
          sharedSuffixLength = i + 1
        else
          break

      inserted = start: sharedPrefixLength, end: ptext.length - sharedSuffixLength
      deleted = start: sharedPrefixLength, end: ctext.length - sharedSuffixLength

      inserted.text = ptext.substring(inserted.start, inserted.end)
      deleted.text = ctext.substring(deleted.start, deleted.end)

      @inserted = inserted
      @deleted = deleted
    else
      @inserted =
        start: @proposed.selectedRange.start
        end: @proposed.selectedRange.start + @proposed.selectedRange.length
        text: ''
      @deleted =
        start: @current.selectedRange.start
        end: @current.selectedRange.start + @current.selectedRange.length
        text: ''

    return null

module.exports = TextField
