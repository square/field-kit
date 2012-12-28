KEYS =
  A:         65
  Z:         90
  a:         97
  z:        122
  ZERO:      48
  NINE:      57
  LEFT:      37
  "←":       37
  RIGHT:     39
  "→":       39
  UP:        38
  "↑":       38
  DOWN:      40
  "↓":       40
  BACKSPACE:  8
  "⌫":        8
  DELETE:    46

  PRINTABLE: [32..126]

class FakeEvent
  keyCode: 0
  altKey: no
  shiftKey: no
  metaKey: no
  ctrlKey: no
  type: null

  _defaultPrevented: no

  preventDefault: ->
    @_defaultPrevented = yes

  isDefaultPrevented: ->
    @_defaultPrevented

  @::__defineGetter__ 'charCode', ->
    if @type is 'keypress' and @keyCode in KEYS.PRINTABLE and not (@metaKey or @ctrlKey)
      @_charCode
    else
      0

  @::__defineSetter__ 'charCode', (charCode) ->
    @_charCode = charCode

  @withKeyCode: (keyCode) ->
    event = new @()
    charCode = keyCode

    # specially handle A-Z and a-z
    if KEYS.A <= keyCode <= KEYS.Z
      event.shiftKey = yes
    else if KEYS.a <= keyCode <= KEYS.z
      keyCode -= KEYS.a - KEYS.A

    event.keyCode = keyCode
    event.charCode = charCode
    return event

  @withKey: (character) ->
    event = new @()
    modifiers = []

    if character.length > 1
      modifiers = character.split('+')
      character = modifiers.pop()

    if character.length > 1
      keyCode = KEYS[character.toUpperCase()]
    else
      keyCode = character.charCodeAt(0)

    event = @withKeyCode keyCode

    for modifier in modifiers
      event["#{modifier}Key"] = yes

    return event

  @pasteEventWithData: (data) ->
    event = new @()
    event.clipboardData = new ClipboardData(data)
    return event

  # jQuery has an originalEvent property to get the real DOM event, but since
  # we're already faking it we might as well just use ourselves.
  @::__defineGetter__ 'originalEvent', ->
    this

class ClipboardData
  constructor: (data) ->
    @data = data

  getData: (type) ->
    @data[type]

  setData: (type, value) ->
    @data[type] = value

module.exports = FakeEvent
