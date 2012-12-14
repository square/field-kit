FakeElement = require './helpers/fake_element'
FakeEvent = require './helpers/fake_event'
Caret = require './helpers/caret'
PanField = require '../lib/pan_field'

class FakeFormatter
  @GAP_INDEXES: []
  length: 16

  format: (value) ->
    value

  parse: (value) ->
    value

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
      assertKeyPressTransform '|4111 1>111', 'shift+left', '|4111> 1111'
      assertKeyPressTransform '41|1>1', 'shift+left', 'shift+left', '4<1|11'
