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

class FakeEvent
  keyCode: 0
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
    event.keyCode = keyCode
    return event

  @withKey: (character) ->
    event = new @()

    if character.length > 1
      modifiers = character.split('+')
      character = modifiers.pop()
      for modifier in modifiers
        event["#{modifier}Key"] = yes

    if character.length > 1
      keyCode = KEYS[character.toUpperCase()]
    else
      keyCode = character.charCodeAt(0)

    # specially handle A-Z and a-z
    if KEYS.A <= keyCode <= KEYS.Z
      shiftKey = yes
    else if KEYS.a <= keyCode <= KEYS.z
      keyCode -= KEYS.a - KEYS.A

    event.keyCode = keyCode
    return event

module.exports = FakeEvent
