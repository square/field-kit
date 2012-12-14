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
  charCode: 0
  altKey: no
  shiftKey: no
  metaKey: no
  ctrlKey: no

  _defaultPrevented: no

  preventDefault: ->
    @_defaultPrevented = yes

  isDefaultPrevented: ->
    @_defaultPrevented

  @withKeyCode: (keyCode) ->
    event = new @()
    charCode = keyCode if keyCode in KEYS.PRINTABLE

    # specially handle A-Z and a-z
    if KEYS.A <= keyCode <= KEYS.Z
      event.shiftKey = yes
    else if KEYS.a <= keyCode <= KEYS.z
      keyCode -= KEYS.a - KEYS.A

    event.charCode = charCode
    event.keyCode = keyCode
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

module.exports = FakeEvent
