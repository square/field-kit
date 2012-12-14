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

class PanField
  constructor: (@element) ->
    @element.on 'keydown', @keyDown
    # @element.on 'keypress', @keyPress
    @element.on 'keyup', @keyUp
    @element.on 'click', @click

  keyDown: (event) =>
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

    # shift / option / alt, probably inserting something not a digit
    else if shiftKey or altKey
      event.preventDefault()

    # 0-9
    else
      @insertCharacter event

    return null

  moveUp: (event) ->
    event.preventDefault()

    # 1234 5678  =>  1234 5678
    #   |---|        |
    @caret = start: 0, end: 0
    @selectionDirection = null

  moveUpAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left', null
        # 1234 5678   =>   1234 5678
        #   <---|          <-----|
        caret.start = 0
      when 'right'
        # 1234 5678   =>   1234 5678
        #   |--->          <-|
        caret.end = caret.start
        caret.start = 0

    @caret = caret
    @selectionDirection = if caret.start is caret.end then null else 'left'

  moveDown: (event) ->
    end = @value.length
    event.preventDefault()

    # 1234 5678  =>  1234 5678
    #   |---|                |
    @caret = start: end, end: end
    @selectionDirection = null

  moveDownAndModifySelection: (event) ->
    caret = @caret
    end = @value.length
    event.preventDefault()

    switch @selectionDirection
      when 'left'
        # 1234 5678  =>  1234 5678
        #   <---|              |->
        caret.start = caret.end
        caret.end = end
      when 'right', null
        # 1234 5678  =>  1234 5678
        #   |--->          |----->
        caret.end = end

    @caret = caret
    @selectionDirection = if caret.start is caret.end then null else 'right'

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

  moveWordLeft: (event) ->
    event.preventDefault()
    index = @lastWordBreakBeforeIndex @caret.start - 1
    @caret = start: index, end: index
    @selectionDirection = null

  moveWordLeftAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left', null
        @selectionDirection = 'left'
        # 1234 5678  =>  1234 5678
        #      <-|       <------|
        caret.start = @lastWordBreakBeforeIndex caret.start - 1
      when 'right'
        # 1234 5678  =>  1234 5678
        #       |->            |
        caret.end = @lastWordBreakBeforeIndex caret.end
        caret.end = caret.start if caret.end < caret.start

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  moveLeftAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left', null
        @selectionDirection = 'left'
        # 1234 5678  =>  1234 5678
        #   <---|         <----|
        caret.start--
      when 'right'
        # 1234 5678   =>   1234 5678
        #   |--->            |-->
        caret.end--

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  moveRight: (event) ->
    caret = @caret
    event.preventDefault()

    if @hasSelection
      # 1234 5678  =>  1234 5678
      #   |--|              |
      caret.start = caret.end
    else
      # 1234 5678  =>  1234 5678
      #   |               |
      caret.start++
      caret.end++

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  moveWordRight: (event) ->
    event.preventDefault()
    index = @nextWordBreakAfterIndex @caret.end
    @caret = start: index, end: index
    @selectionDirection = null

  moveWordRightAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left'
        # 1234 5678  =>  1234 5678
        #   <---|             <|
        caret.start = @nextWordBreakAfterIndex caret.start
        caret.start = caret.end if caret.start > caret.end
      when 'right', null
        @selectionDirection = 'right'
        # 1234 5678  =>  1234 5678
        #   |--->         |------>
        caret.end = @nextWordBreakAfterIndex caret.end

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  moveRightAndModifySelection: (event) ->
    caret = @caret
    event.preventDefault()

    switch @selectionDirection
      when 'left'
        # 1234 5678  =>  1234 5678
        #   |---|           |--|
        caret.start++
      when 'right', null
        @selectionDirection = 'right'
        # 1234 5678  =>  1234 5678
        #   |---|         |-----|
        caret.end++

    @caret = caret
    @selectionDirection = null if caret.start is caret.end

  deleteBackward: (event) ->
    caret = @caret
    event.preventDefault()

    caret.start--

    @caret = caret
    @clearSelection()

  deleteWordBackward: (event) ->
    if @hasSelection
      return @deleteBackward event

    event.preventDefault()
    caret = @caret

    caret.start = @lastWordBreakBeforeIndex caret.start - 1

    @caret = caret
    @clearSelection()

  deleteBackwardByDecomposingPreviousCharacter: (event) ->
    @deleteBackward event

  deleteForward: (event) ->
    caret = @caret
    event.preventDefault()

    caret.end++

    @caret = caret
    @clearSelection()

  deleteWordForward: (event) ->
    if @hasSelection
      return @deleteForward event

    caret = @caret
    event.preventDefault()

    caret.end = @nextWordBreakAfterIndex caret.end

    @caret = caret
    @clearSelection()

  @::__defineGetter__ 'hasSelection', ->
    caret = @caret
    caret.start isnt caret.end

  # Find starts of "words".
  @::__defineGetter__ 'leftWordBreakIndexes', ->
    result = []
    text = @text
    mapping = @textToValueMapping

    for i in [0..text.length-1]
      result.push mapping[i] if not isWordChar(text[i-1]) and isWordChar(text[i])

    return result

  # Find ends of "words".
  @::__defineGetter__ 'rightWordBreakIndexes', ->
    result = []
    text = @text
    mapping = @textToValueMapping

    for i in [0..text.length-1]
      result.push mapping[i+1] if isWordChar(text[i]) and not isWordChar(text[i+1])

    return result

  lastWordBreakBeforeIndex: (index) ->
    indexes = @leftWordBreakIndexes
    result = indexes[0]

    for wordBreakIndex in indexes
      if index > wordBreakIndex
        result = wordBreakIndex
      else
        break

    return result

  nextWordBreakAfterIndex: (index) ->
    indexes = @rightWordBreakIndexes.reverse()
    result = indexes[0]

    for wordBreakIndex in indexes
      if index < wordBreakIndex
        result = wordBreakIndex
      else
        break

    return result

  clearSelection: ->
    # 12345678  =>  128
    #   |---|         |
    @replaceSelection ''

  replaceSelection: (text) ->
    caret = @caret
    value = @value

    # 12345678  =>  12098
    #   |---|         ||
    value = value.substring(0, caret.start) + text + value.substring(caret.end)
    caret.end = caret.start + text.length

    @value = value
    @caret = caret
    @selectionDirection = null

  selectAll: (event) ->
    # Let the browser act as normal, but also forget the selection direction.
    @selectionDirection = null

  keyPress: (event) =>

  keyUp: (event) =>
    caret = @caret
    value = @value

    @value = value
    @caret = caret

  click: =>
    @selectionDirection = null

  insertCharacter: (event) ->
    event.preventDefault()

    # prevent inserting anything but digits
    return unless KEYS.isDigit event.charCode

    # clear any selection and cut out if we're full
    @clearSelection() if @hasSelection
    return if @value.length >= @formatter.length

    # insert the digit
    @replaceSelection String.fromCharCode(event.charCode)
    caret = @caret
    caret.start = caret.end
    @caret = caret

  selectionDirection: null

  on: (args...) ->
    @element.on args...

  off: (args...) ->
    @element.off args...

  @::__defineGetter__ 'text', ->
    @element.val()

  @::__defineSetter__ 'text', (text) ->
    @element.val(text)

  @::__defineGetter__ 'value', ->
    value = @element.val()
    return value unless @_formatter
    @_formatter.parse value

  @::__defineSetter__ 'value', (value) ->
    value = @_formatter.format(value) if @_formatter
    @element.val value
    @element.trigger 'change'

  @::__defineGetter__ 'formatter', ->
    @_formatter

  @::__defineSetter__ 'formatter', (formatter) ->
    value = @value
    @_formatter = formatter
    @value = value

  @::__defineGetter__ 'textToValueMapping', ->
    value = @value
    text = @text
    mapping = {}

    valueIndex = 0
    textIndex = 0

    while textIndex <= text.length
      mapping[textIndex] = valueIndex

      if text[textIndex] is value[valueIndex]
        textIndex++
        valueIndex++
      else
        textIndex++

    return mapping

  @::__defineGetter__ 'caret', ->
    mapping = @textToValueMapping
    textCaret = @element.caret()
    return start: mapping[textCaret.start], end: mapping[textCaret.end]

  @::__defineSetter__ 'caret', (valueCaret) ->
    min = 0
    max = @value.length
    valueCaret =
      start: Math.max(min, Math.min(max, valueCaret.start))
      end: Math.max(min, Math.min(max, valueCaret.end))
    textCaret = {}

    for own textIndex, valueIndex of @textToValueMapping
      textCaret.start = textIndex if valueCaret.start is valueIndex
      textCaret.end = textIndex if valueCaret.end is valueIndex

    if not textCaret.start? or not textCaret.end?
      throw new Error("unable to map value caret #{JSON.stringify valueCaret} to text caret, so far got: #{JSON.stringify textCaret}, mapping=#{JSON.stringify @textToValueMapping}")

    @element.caret textCaret

if module?
  module.exports = PanField
else if window?
  window.PanField = PanField
