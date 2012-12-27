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
  TAB:        9

KEYS.isDigit = (keyCode) ->
  @ZERO <= keyCode <= @NINE

KEYS.isDirectional = (keyCode) ->
  keyCode in [@LEFT, @RIGHT, @UP, @DOWN]

DIRECTION =
  LEFT:  'left'
  RIGHT: 'right'
  NONE:  null

isWordChar = (char) -> char and /^\w$/.test(char)

XPATH_FOCUSABLE_FIELD = '*[name(.)="input" or name(.)="select"][not(type="hidden")][not(contains(@class, "formatted-text-field-interceptor"))]'

findFieldFollowing = (element) ->
  result = document.evaluate "following::#{XPATH_FOCUSABLE_FIELD}", element, null, XPathResult.ANY_TYPE, null
  return result.iterateNext()

findFieldPreceding = (element) ->
  result = document.evaluate "preceding::#{XPATH_FOCUSABLE_FIELD}", element, null, XPathResult.ANY_TYPE, null
  return result.iterateNext()

makeFirstResponder = (field, event) ->
  if formattedTextField = $(field).data('formatted-text-field')
    formattedTextField.becomeFirstResponder event
  else
    field.focus?()
    field.select?()

class FormattedTextField
  # Internal: Contains one of the DIRECTION enum to indicate the direction the
  # free end of the selection is from its anchor.
  selectionDirection: DIRECTION.NONE

  constructor: (@element) ->
    @element.on 'keydown', @keyDown
    @element.on 'keypress', @keyPress
    @element.on 'keyup', @keyUp
    @element.on 'click', @click
    @element.data 'formatted-text-field', this
    @createTabInterceptors()

  # Internal: Creates phantom input elements that intercept tab / shift+tab
  # navigation so we can handle them appropriately.
  createTabInterceptors: ->
    input = @element.get(0)

    createInterceptor = ->
      interceptor = input.ownerDocument.createElement 'input'
      interceptor.style.position = 'absolute'
      interceptor.style.top = '0'
      interceptor.style.left = '0'
      interceptor.style.opacity = 0
      interceptor.style.zIndex = -9999
      interceptor.style.pointerEvents = 'none'
      interceptor.className = 'formatted-text-field-interceptor'
      interceptor

    beforeInterceptor = createInterceptor()
    beforeInterceptor.onkeyup = @beforeInterceptorKeyUp
    input.parentNode.insertBefore beforeInterceptor, input

    afterInterceptor = createInterceptor()
    afterInterceptor.onkeyup = @afterInterceptorKeyUp
    if input.nextSibling
      input.parentNode.insertBefore afterInterceptor, input.nextSibling
    else
      input.parentNode.appendChild afterInterceptor

  # Internal: Handles keyup events in the input that intercepts tab-induced
  # focus events before this one.
  #
  # TODO: Test this somehow.
  #
  # Returns nothing.
  beforeInterceptorKeyUp: (event) =>
    if event.keyCode is KEYS.TAB and event.shiftKey
      if previousField = findFieldPreceding event.target
        makeFirstResponder previousField

  # Internal: Handles keyup events in the input that intercepts tab-induced
  # focus events after this one.
  #
  # TODO: Test this somehow.
  #
  # Returns nothing.
  afterInterceptorKeyUp: (event) =>
    if event.keyCode is KEYS.TAB and not event.shiftKey
      if nextField = findFieldFollowing event.target
        makeFirstResponder nextField

  # Handles a key event that is trying to insert a character.
  #
  # Returns nothing.
  insertCharacter: (event) ->
    event.preventDefault()

    # clear any selection and cut out if we're full
    @clearSelection() if @hasSelection
    return if @formatter.length and @text.length >= @formatter.length

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
    caret = @caret

    switch @selectionDirection
      when DIRECTION.LEFT, DIRECTION.NONE
        # 12<34 56|78  =>  <1234 56|78
        caret.start = 0
      when DIRECTION.RIGHT
        # 12|34 56>78   =>   <12|34 5678
        caret.end = caret.start
        caret.start = 0

    @selectionDirection = DIRECTION.LEFT
    @caret = caret

  # Moves the free end of the selection to the beginning of the paragraph, or
  # since this is a single-line text field to the beginning of the line.
  #
  # Returns nothing.
  moveParagraphBackwardAndModifySelection: (event) ->
    event.preventDefault()
    caret = @caret

    switch @selectionDirection
      when DIRECTION.LEFT, DIRECTION.NONE
        # 12<34 56|78  =>  <1234 56|78
        caret.start = 0
      when DIRECTION.RIGHT
        # 12|34 56>78  =>  12|34 5678
        caret.end = caret.start

    @selectionDirection = DIRECTION.LEFT
    @caret = caret

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
    caret = @caret
    caret.start = 0
    @selectionDirection = DIRECTION.LEFT
    @caret = caret

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
    end = @text.length

    # 12|34 56|78  =>  1234 5678|
    @caret = start: end, end: end

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
    caret = @caret
    end = @text.length

    switch @selectionDirection
      when DIRECTION.LEFT
        caret.start = caret.end
        caret.end = end
      when DIRECTION.RIGHT, DIRECTION.NONE
        caret.end = end

    @selectionDirection = DIRECTION.RIGHT
    @caret = caret

  # Moves the free end of the selection to the end of the paragraph, or since
  # this is a single-line text field to the end of the line.
  #
  # Returns nothing.
  moveParagraphForwardAndModifySelection: (event) ->
    event.preventDefault()
    caret = @caret

    switch @selectionDirection
      when DIRECTION.RIGHT, DIRECTION.NONE
        # 12|34 56>78  =>  12|34 5678>
        caret.end = @text.length
      when DIRECTION.LEFT
        # 12<34 56|78  =>  12|34 5678
        caret.start = caret.end

    @selectionDirection = DIRECTION.RIGHT
    @caret = caret

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
    caret = @caret
    caret.end = @text.length
    @selectionDirection = DIRECTION.RIGHT
    @caret = caret

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
    caret = @caret

    if @hasSelection
      caret.end = caret.start
    else
      caret.start--
      caret.end--

    @caret = caret

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
    caret = @caret

    switch @selectionDirection
      when DIRECTION.LEFT, DIRECTION.NONE
        @selectionDirection = DIRECTION.LEFT
        caret.start--
      when DIRECTION.RIGHT
        caret.end--

    @caret = caret

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
    caret = @caret

    switch @selectionDirection
      when DIRECTION.LEFT, DIRECTION.NONE
        @selectionDirection = DIRECTION.LEFT
        caret.start = @lastWordBreakBeforeIndex caret.start - 1
      when DIRECTION.RIGHT
        caret.end = @lastWordBreakBeforeIndex caret.end
        caret.end = caret.start if caret.end < caret.start

    @caret = caret

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
    @caret = start: 0, end: 0

  # Select from the free end of the caret to the beginning of line.
  #
  # Examples
  #
  #   Hey guys, where| are ya?
  #   moveToBeginningOfLineAndModifySelection(event)
  #   <Hey guys, where| are ya?
  #
  #   Hey guys, where| are> ya?
  #   moveToBeginningOfLineAndModifySelection(event)
  #   <Hey guys, where| are ya?
  #
  # Returns nothing.
  moveToBeginningOfLineAndModifySelection: (event) ->
    event.preventDefault()
    caret = @caret

    switch @selectionDirection
      when DIRECTION.LEFT, DIRECTION.NONE
        @selectionDirection = DIRECTION.LEFT
        caret.start = 0
      when DIRECTION.RIGHT
        caret.end = caret.start
        caret.start = 0

    @caret = caret

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
    caret = @caret

    if @hasSelection
      caret.start = caret.end
    else
      caret.start++
      caret.end++

    @caret = caret

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
    caret = @caret

    switch @selectionDirection
      when DIRECTION.LEFT
        caret.start++
      when DIRECTION.RIGHT, DIRECTION.NONE
        @selectionDirection = DIRECTION.RIGHT
        caret.end++

    @caret = caret

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
    caret = @caret

    switch @selectionDirection
      when DIRECTION.LEFT
        caret.start = @nextWordBreakAfterIndex caret.start
        caret.start = caret.end if caret.start > caret.end
      when DIRECTION.RIGHT, DIRECTION.NONE
        @selectionDirection = DIRECTION.RIGHT
        caret.end = @nextWordBreakAfterIndex caret.end

    @caret = caret

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
    text = @text
    @caret = start: text.length, end: text.length

  # Moves the free end of the caret to the end of the current line.
  #
  # Examples
  #
  #   Hey guys, where| are ya?
  #   moveToEndofLineAndModifySelection(event)
  #   Hey guys, where| are ya?>
  #
  #   Hey guys, <where| are ya?
  #   moveToEndofLineAndModifySelection(event)
  #   Hey guys, where| are ya?>
  #
  # Returns nothing.
  moveToEndOfLineAndModifySelection: (event) ->
    event.preventDefault()
    caret = @caret

    switch @selectionDirection
      when DIRECTION.RIGHT, DIRECTION.NONE
        @selectionDirection = DIRECTION.RIGHT
        caret.end = @text.length
      when DIRECTION.LEFT
        caret.start = caret.end
        caret.end = @text.length

    @caret = caret


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

    caret.start = @lastWordBreakBeforeIndex caret.start

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
    if @hasSelection
      return @deleteBackward event

    event.preventDefault()
    caret = @caret
    caret.start = 0
    @caret = caret
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

  # Handles the tab key.
  #
  # Returns nothing.
  insertTab: (event) ->

  # Handles the back tab key.
  #
  # Returns nothing.
  insertBackTab: (event) ->

  # Removes focus from this field if it has focus.
  #
  # Returns nothing.
  becomeFirstResponder: (event) ->
    @element.focus()
    @rollbackInvalidChanges =>
      @element.select()

  # Removes focus from this field if it has focus.
  #
  # Returns nothing.
  resignFirstResponder: (event) ->
    event.preventDefault()
    @element.blur()
    $('#no-selection-test').focus()

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
  replaceSelection: (replacement) ->
    caret = @caret
    text = @text

    text = text.substring(0, caret.start) + replacement + text.substring(caret.end)
    caret.end = caret.start + replacement.length

    @text = text
    @caret = caret
    @selectionDirection = DIRECTION.NONE

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
    text = @text
    @caret = start: 0, end: text.length
    @selectionDirection = DIRECTION.NONE

  # Internal: Handles keyDown events. This method essentially just delegates to
  # other, more semantic, methods based on the modifier keys and the pressed
  # key of the event.
  #
  # Returns nothing.
  keyDown: (event) =>
    @rollbackInvalidChanges =>
      {keyCode, metaKey, ctrlKey, shiftKey, altKey} = event
      modifiers = []
      modifiers.push 'alt' if altKey
      modifiers.push 'ctrl' if ctrlKey
      modifiers.push 'meta' if metaKey
      modifiers.push 'shift' if shiftKey
      modifiers = modifiers.join '+'

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
          when ''
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

      return null

  # Internal: Handles inserting characters based on the typed key.
  #
  # Returns nothing.
  keyPress: (event) =>
    @rollbackInvalidChanges =>
      @insertCharacter event

  # Internal: Handles keyup events.
  #
  # Returns nothing.
  keyUp: (event) =>
    @rollbackInvalidChanges =>
      if event.keyCode is KEYS.TAB
        @selectAll event

  # Internal: Checks changes after invoking the passed function for validity
  # and rolls them back if the changes turned out to be invalid.
  #
  # Returns whatever the given callback returns.
  rollbackInvalidChanges: (callback) ->
    change = field: this, current: { @caret, @text }
    result = callback()
    change.proposed = { @caret, @text }

    if change.proposed.text isnt change.current.text
      ctext = change.current.text
      ptext = change.proposed.text
      sharedPrefixLength = ctext.length
      sharedSuffixLength = 0

      for i in [0...ctext.length]
        if ptext[i] isnt ctext[i]
          sharedPrefixLength = i
          break

      for i in [0...(ctext.length-sharedPrefixLength)]
        if ptext[ptext.length - 1 - i] isnt ctext[ctext.length - 1 - i]
          sharedSuffixLength = i
          break

      inserted = start: sharedPrefixLength, end: ptext.length - sharedSuffixLength
      deleted = start: sharedPrefixLength, end: ctext.length - sharedSuffixLength

      inserted.text = ptext.substring(inserted.start, inserted.end)
      deleted.text = ctext.substring(deleted.start, deleted.end)

      change.inserted = inserted
      change.deleted = deleted
    else
      change.inserted =
        start: change.proposed.caret.start
        end: change.proposed.caret.end
        text: ''
      change.deleted =
        start: change.current.caret.start
        end: change.current.caret.end
        text: ''

    if typeof @formatter?.isChangeValid is 'function'
      if @formatter.isChangeValid(change)
        @text = change.proposed.text
        @caret = change.proposed.caret
      else
        @text = change.current.text
        @caret = change.current.caret

    return result

  # Internal: Handles clicks by resetting the selection direction.
  #
  # Returns nothing.
  click: (event) =>
    @selectionDirection = DIRECTION.NONE

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
    max = @text.length
    caret =
      start: Math.max(min, Math.min(max, caret.start))
      end: Math.max(min, Math.min(max, caret.end))
    @element.caret caret
    @selectionDirection = DIRECTION.NONE if caret.start is caret.end

  # Gets the position of the current selection's anchor point, i.e. the point
  # that the selection extends from, if any.
  #
  # Returns an index within the current text.
  @::__defineGetter__ 'selectionAnchor', ->
    switch @selectionDirection
      when DIRECTION.LEFT
        @caret.end
      when DIRECTION.RIGHT
        @caret.start
      else
        null

if module?
  module.exports = FormattedTextField
else if window?
  (@FieldKit ||= {}).FormattedTextField = FormattedTextField
