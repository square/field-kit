FakeElement = require './helpers/fake_element'
FakeEvent = require './helpers/fake_event'
Caret = require './helpers/caret'
PanField = require '../lib/pan_field'

class FakeFormatter
  @GAP_INDEXES: []
  length: 16

  format: (value) ->
    value

  parse: (text) ->
    text

describe 'PanField', ->
  element = null
  panField = null

  applyValueAndCaretDescription = (description) ->
    { caret, direction, value } = Caret.parseDescription description
    element.val value
    element.caret caret
    panField.selectionDirection = direction

  assertKeyPressTransform = (from, keys..., to) ->
    applyValueAndCaretDescription from

    for key in keys
      event = FakeEvent.withKey(key)
      panField.keyDown event
      if not event.isDefaultPrevented()
        panField.keyPress event if event.charCode
        if not event.isDefaultPrevented()
          panField.keyUp event

    description = Caret.printDescription
                    caret: element.caret()
                    direction: panField.selectionDirection
                    value: element.val()

    expect(description).toEqual(to)

  beforeEach ->
    element = new FakeElement()
    panField = new PanField(element)
    panField.formatter = new FakeFormatter()

  describe 'typing a digit into an empty field', ->
    it 'allows the digit to be inserted', ->
      assertKeyPressTransform '|', '0', '0|'

  describe 'typing a digit into a full field', ->
    it 'does not allow the digit to be inserted', ->
      assertKeyPressTransform '1234567890123456|', '0', '1234567890123456|'

    describe 'with part of the value selected', ->
      it 'replaces the selection with the typed character', ->
        assertKeyPressTransform '|123|4567890123456', '0', '0|4567890123456'

  describe 'typing a non-digit character', ->
    it 'is not inserted', ->
      assertKeyPressTransform '12|', 'a', '12|'

  describe 'typing a left arrow', ->
    it 'works as expected', ->
      assertKeyPressTransform '|4111', 'left', '|4111'
      assertKeyPressTransform '4|111', 'left', '|4111'
      assertKeyPressTransform '41|1|1', 'left', '41|11'

      assertKeyPressTransform '<41|11', 'shift+left', '<41|11'
      assertKeyPressTransform '4<1|11', 'shift+left', '<41|11'
      assertKeyPressTransform '|41>11', 'shift+left', '|4>111'
      assertKeyPressTransform '|4111 1>111', 'shift+left', '|4111 >1111'
      assertKeyPressTransform '41|1>1', 'shift+left', 'shift+left', '4<1|11'

      assertKeyPressTransform '41|11', 'alt+left', '|4111'
      assertKeyPressTransform '4111 11|11', 'alt+left', '4111 |1111'
      assertKeyPressTransform '4111 11|11', 'alt+left', 'alt+left', '|4111 1111'

      assertKeyPressTransform '41|11', 'shift+alt+left', '<41|11'
      assertKeyPressTransform '4111 11|11', 'shift+alt+left', '4111 <11|11'
      assertKeyPressTransform '4111 11|11', 'shift+alt+left', 'shift+alt+left', '<4111 11|11'

  describe 'typing a right arrow', ->
    it 'works as expected', ->
      assertKeyPressTransform '|4111', 'right', '4|111'
      assertKeyPressTransform '4111|', 'right', '4111|'
      assertKeyPressTransform '41|1|1', 'right', '411|1'

      assertKeyPressTransform '41|11>', 'shift+right', '41|11>'
      assertKeyPressTransform '<41|11', 'shift+right', '4<1|11'
      assertKeyPressTransform '|41>11', 'shift+right', '|411>1'
      assertKeyPressTransform '|4111> 1111', 'shift+right', '|4111 >1111'
      assertKeyPressTransform '41<1|1', 'shift+right', 'shift+right', '411|1>'

      assertKeyPressTransform '41|11', 'alt+right', '4111|'
      assertKeyPressTransform '41|11 1111', 'alt+right', '4111| 1111'
      assertKeyPressTransform '41|11 1111', 'alt+right', 'alt+right', '4111 1111|'

      assertKeyPressTransform '41|11', 'shift+alt+right', '41|11>'
      assertKeyPressTransform '41|11 1111', 'shift+alt+right', '41|11> 1111'
      assertKeyPressTransform '41|11 1111', 'shift+alt+right', 'shift+alt+right', '41|11 1111>'

  describe 'typing an up arrow', ->
    it 'works as expected', ->
      assertKeyPressTransform '4111|', 'up', '|4111'
      assertKeyPressTransform '411|1', 'up', '|4111'
      assertKeyPressTransform '41|1|1', 'up', '|4111'

      assertKeyPressTransform '41|11>', 'shift+up', '<41|11'
      assertKeyPressTransform '<41|11', 'shift+up', '<41|11'
      assertKeyPressTransform '|41>11', 'shift+up', '|4111'
      assertKeyPressTransform '|4111> 1111', 'shift+up', '|4111 1111'
      assertKeyPressTransform '41<1|1', 'shift+up', '<411|1'

      assertKeyPressTransform '41|11', 'alt+up', '|4111'
      assertKeyPressTransform '41|11 1111', 'alt+up', '|4111 1111'

      assertKeyPressTransform '41|11', 'shift+alt+up', '<41|11'
      assertKeyPressTransform '4111 11|11', 'shift+alt+up', '<4111 11|11'
      assertKeyPressTransform '4111 11|11', 'shift+alt+up', 'shift+alt+up', '<4111 11|11'

  describe 'typing a down arrow', ->
    it 'works as expected', ->
      assertKeyPressTransform '|4111', 'down', '4111|'
      assertKeyPressTransform '411|1', 'down', '4111|'
      assertKeyPressTransform '41|1|1', 'down', '4111|'

      assertKeyPressTransform '41|11>', 'shift+down', '41|11>'
      assertKeyPressTransform '<41|11', 'shift+down', '41|11>'
      assertKeyPressTransform '41<11|', 'shift+down', '4111|'
      assertKeyPressTransform '|4111> 1111', 'shift+down', '|4111 1111>'
      assertKeyPressTransform '41|1>1', 'shift+down', '41|11>'

      assertKeyPressTransform '41|11', 'alt+down', '4111|'
      assertKeyPressTransform '41|11 1111', 'alt+down', '4111 1111|'

      assertKeyPressTransform '41|11', 'shift+alt+down', '41|11>'
      assertKeyPressTransform '41|11 1111', 'shift+alt+down', '41|11 1111>'
      assertKeyPressTransform '4111| 1111', 'shift+alt+down', 'shift+alt+down', '4111| 1111>'
