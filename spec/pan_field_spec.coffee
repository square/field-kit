FakeElement = require './helpers/fake_element'
FakeEvent = require './helpers/fake_event'
PanField = require '../lib/pan_field'

class FakeFormatter
  @GAP_INDEXES: []
  length: 16

  format: (value) ->
    value

describe 'PanField', ->
  element = null
  panField = null

  beforeEach ->
    element = new FakeElement()
    panField = new PanField(element)
    panField.formatter = new FakeFormatter()

  describe 'typing a digit into an empty field', ->
    it 'does not prevent the default behavior', ->
      event = FakeEvent.withKey('0')
      panField.keyDown event
      expect(event.isDefaultPrevented()).toBeFalsy()

  describe 'typing a digit into a full field', ->
    beforeEach ->
      panField.value = '1234 5678 9012 3456'
      panField.caret = start: 0, end: 0

    it 'does prevent default', ->
      event = FakeEvent.withKey('0')
      panField.keyDown event
      expect(event.isDefaultPrevented()).toBeTruthy()

    describe 'with part of the value selected', ->
      beforeEach ->
        panField.caret = start: 0, end: 3

      it 'does prevent default', ->
        event = FakeEvent.withKey('0')
        panField.keyDown event
        expect(panField.value).toEqual('4567890123456')
        expect(event.isDefaultPrevented()).toBeFalsy()

  describe 'typing a left arrow', ->
    event = null

    beforeEach ->
      panField.value = '4111'
      event = FakeEvent.withKey('left')

    describe 'when the caret is already at the beginning', ->
      beforeEach ->
        panField.caret = start: 0, end: 0

      it 'does not change the caret', ->
        panField.keyDown event
        {start, end} = panField.caret
        expect({start, end}).toEqual(start: 0, end: 0)

    describe 'when the caret is not at the beginning', ->
      beforeEach ->
        panField.caret = start: 1, end: 1

      it 'moves one character to the left', ->
        panField.keyDown event
        {start, end} = panField.caret
        expect({start, end}).toEqual(start: 0, end: 0)

    describe 'when there is a selection', ->
      beforeEach ->
        panField.caret = start: 2, end: 3

      it 'places the caret at the start of the selection', ->
        panField.keyDown event
        {start, end} = panField.caret
        expect({start, end}).toEqual(start: 2, end: 2)

    describe 'with the shift key', ->
      beforeEach ->
        event = FakeEvent.withKey('shift+left')

      describe 'and the caret anchor is the end', ->
        beforeEach ->
          panField.selectionDirection = 'left'

        describe 'and the selection start is already at the beginning', ->
          beforeEach ->
            panField.caret = start: 0, end: 2

          it 'does not change the selection', ->
            panField.keyDown event
            {start, end} = panField.caret
            expect({start, end}).toEqual(start: 0, end: 2)

        describe 'and the selection start is not at the beginning', ->
          beforeEach ->
            panField.caret = start: 1, end: 2

          it 'extends the selection one character to the left', ->
            panField.keyDown event
            {start, end} = panField.caret
            expect({start, end}).toEqual(start: 0, end: 2)

      describe 'and the caret anchor is the start', ->
        beforeEach ->
          panField.selectionDirection = 'right'

        describe 'and the selection start is at the beginning', ->
          beforeEach ->
            panField.caret = start: 0, end: 2

          it 'shrinks the selection on the right', ->
            panField.keyDown event
            {start, end} = panField.caret
            expect({start, end}).toEqual(start: 0, end: 1)
