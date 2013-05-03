KEYS =
  A:         65
  Z:         90
  a:         97
  z:        122
  ZERO:      48
  NINE:      57
  LEFT:      37
  RIGHT:     39
  UP:        38
  DOWN:      40
  BACKSPACE:  8
  DELETE:    46
  ENTER:     13
  TAB:        9

  PRINTABLE: [32..126]

MODIFIERS = [
  'meta'
  'alt'
  'shift'
  'ctrl'
]

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

  this::__defineGetter__ 'charCode', ->
    if @type is 'keypress' and @keyCode in KEYS.PRINTABLE and not (@metaKey or @ctrlKey)
      @_charCode
    else
      0

  this::__defineSetter__ 'charCode', (charCode) ->
    @_charCode = charCode

  @eventsForKeys: (keys...) ->
    events = []
    for key in keys
      if event = @withKey key
        events.push(event)
      else
        events.push(@eventsForKeys(key.split('')...)...)
    return events

  @withKey: (key) ->
    event = @withSimpleKey key
    return event if event?

    # try to parse it as e.g. ctrl+shift+a
    [modifiers..., key] = key.split('+')
    modifiersAreReal = yes
    modifiersAreReal &&= modifier in MODIFIERS for modifier in modifiers

    if modifiersAreReal
      event = @withSimpleKey key

    # return early if we can't parse it
    return null unless modifiersAreReal and event?

    for modifier in modifiers
      event["#{modifier}Key"] = yes
    return event

  @withSimpleKey: (key) ->
    if key.length is 1
      @withKeyCode(key.charCodeAt(0))
    else if key.toUpperCase() of KEYS
      @withKeyCode(KEYS[key.toUpperCase()])

  @withKeyCode: (keyCode) ->
    event = new this()
    charCode = keyCode

    # specially handle A-Z and a-z
    if KEYS.A <= keyCode <= KEYS.Z
      event.shiftKey = yes
    else if KEYS.a <= keyCode <= KEYS.z
      keyCode -= KEYS.a - KEYS.A

    event.keyCode = keyCode
    event.charCode = charCode
    return event

  @pasteEventWithData: (data) ->
    event = new this()
    event.clipboardData = new ClipboardData(data)
    return event

  # jQuery has an originalEvent property to get the real DOM event, but since
  # we're already faking it we might as well just use ourselves.
  this::__defineGetter__ 'originalEvent', ->
    this

class ClipboardData
  constructor: (data) ->
    @data = data

  getData: (type) ->
    @data[type]

  setData: (type, value) ->
    @data[type] = value

module.exports = FakeEvent
