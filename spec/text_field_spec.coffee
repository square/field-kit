{buildField} = require './helpers/builders'
{expectThatTyping, expectThatPasting} = require './helpers/expectations'
PassthroughFormatter = require './helpers/passthrough_formatter'

describe 'TextField', ->
  describe 'typing a character into an empty field', ->
    it 'allows the character to be inserted', ->
      expectThatTyping('a').willChange('|').to('a|')

  describe 'typing a backspace', ->
    describe 'with a non-empty selection', ->
      it 'clears the selection', ->
        expectThatTyping('backspace').willChange('12|34|5').to('12|5')
        expectThatTyping('backspace').willChange('12<34|5').to('12|5')
        expectThatTyping('backspace').willChange('12|34>5').to('12|5')

        expectThatTyping('alt+backspace').willChange('12|3 4|5').to('12|5')
        expectThatTyping('alt+backspace').willChange('12<3 4|5').to('12|5')
        expectThatTyping('alt+backspace').willChange('12|3 4>5').to('12|5')

        expectThatTyping('meta+backspace').willChange('12|3 4>5').to('12|5')

    describe 'with an empty selection', ->
      it 'works as expected', ->
        expectThatTyping('backspace').willNotChange('|12')
        expectThatTyping('backspace').willChange('1|2').to('|2')

        expectThatTyping('alt+backspace').willNotChange('|12')
        expectThatTyping('alt+backspace').willChange('12|').to('|')
        expectThatTyping('alt+backspace').willChange('12 34|').to('12 |')
        expectThatTyping('alt+backspace').willChange('12 3|4').to('12 |4')
        expectThatTyping('alt+backspace').willChange('12 |34').to('|34')

        expectThatTyping('meta+backspace').willChange('12 34 |56').to('|56')

  describe 'typing forward delete', ->
    describe 'with a non-empty selection', ->
      it 'clears the selection', ->
        expectThatTyping('delete').willChange('12|34|5').to('12|5')
        expectThatTyping('delete').willChange('12<34|5').to('12|5')
        expectThatTyping('delete').willChange('12|34>5').to('12|5')

        expectThatTyping('alt+delete').willChange('12|3 4|5').to('12|5')
        expectThatTyping('alt+delete').willChange('12<3 4|5').to('12|5')
        expectThatTyping('alt+delete').willChange('12|3 4>5').to('12|5')

    describe 'with an empty selection', ->
      it 'works as expected', ->
        expectThatTyping('delete').willNotChange('12|')
        expectThatTyping('delete').willChange('1|2').to('1|')

        expectThatTyping('alt+delete').willNotChange('12|')
        expectThatTyping('alt+delete').willChange('|12').to('|')
        expectThatTyping('alt+delete').willChange('|12 34').to('| 34')
        expectThatTyping('alt+delete').willChange('12| 34').to('12|')

  describe 'typing a left arrow', ->
    it 'works as expected', ->
      expectThatTyping('left').willNotChange('|4111')
      expectThatTyping('left').willChange('4|111').to('|4111')
      expectThatTyping('left').willChange('41|1|1').to('41|11')

      expectThatTyping('shift+left').willNotChange('<41|11')
      expectThatTyping('shift+left').willChange('4<1|11').to('<41|11')
      expectThatTyping('shift+left').willChange('|41>11').to('|4>111')
      expectThatTyping('shift+left').willChange('|4111 1>111').to('|4111 >1111')
      expectThatTyping('shift+left', 'shift+left').willChange('41|1>1').to('4<1|11')

      expectThatTyping('alt+left').willChange('41|11').to('|4111')
      expectThatTyping('alt+left').willChange('4111 11|11').to('4111 |1111')
      expectThatTyping('alt+left', 'alt+left').willChange('4111 11|11').to('|4111 1111')

      expectThatTyping('shift+alt+left').willChange('41|11').to('<41|11')
      expectThatTyping('shift+alt+left').willChange('4111 11|11').to('4111 <11|11')
      expectThatTyping('shift+alt+left', 'shift+alt+left').willChange('4111 11|11').to('<4111 11|11')

      expectThatTyping('meta+left').willChange('41|11').to('|4111')
      expectThatTyping('shift+meta+left').willChange('41|11').to('<41|11')
      expectThatTyping('shift+meta+left').willChange('41|1>1').to('<411|1')
      expectThatTyping('shift+meta+left').willNotChange('|4111')

  describe 'typing a right arrow', ->
    it 'works as expected', ->
      expectThatTyping('right').willChange('|4111').to('4|111')
      expectThatTyping('right').willNotChange('4111|')
      expectThatTyping('right').willChange('41|1|1').to('411|1')

      expectThatTyping('shift+right').willNotChange('41|11>')
      expectThatTyping('shift+right').willChange('<41|11').to('4<1|11')
      expectThatTyping('shift+right').willChange('|41>11').to('|411>1')
      expectThatTyping('shift+right').willChange('|4111> 1111').to('|4111 >1111')
      expectThatTyping('shift+right', 'shift+right').willChange('41<1|1').to('411|1>')

      expectThatTyping('alt+right').willChange('41|11').to('4111|')
      expectThatTyping('alt+right').willChange('41|11 1111').to('4111| 1111')
      expectThatTyping('alt+right', 'alt+right').willChange('41|11 1111').to('4111 1111|')

      expectThatTyping('shift+alt+right').willChange('41|11').to('41|11>')
      expectThatTyping('shift+alt+right').willChange('41|11 1111').to('41|11> 1111')
      expectThatTyping('shift+alt+right', 'shift+alt+right').willChange('41|11 1111').to('41|11 1111>')

      expectThatTyping('meta+right').willChange('41|11').to('4111|')
      expectThatTyping('shift+meta+right').willChange('41|11').to('41|11>')
      expectThatTyping('shift+meta+right').willChange('<41|11').to('|4111>')
      expectThatTyping('shift+meta+right').willNotChange('4111|')

  describe 'typing an up arrow', ->
    it 'works as expected', ->
      expectThatTyping('up').willChange('4111|').to('|4111')
      expectThatTyping('up').willChange('411|1').to('|4111')
      expectThatTyping('up').willChange('41|1|1').to('|4111')
      expectThatTyping('up').willChange('41|1>1').to('|4111')
      expectThatTyping('up').willChange('41<1|1').to('|4111')

      expectThatTyping('shift+up').willChange('41|11>').to('<41|11')
      expectThatTyping('shift+up').willNotChange('<41|11')
      expectThatTyping('shift+up').willChange('|41>11').to('|4111')
      expectThatTyping('shift+up').willChange('|4111> 1111').to('|4111 1111')
      expectThatTyping('shift+up').willChange('41<1|1').to('<411|1')

      expectThatTyping('alt+up').willChange('41|11').to('|4111')
      expectThatTyping('alt+up').willChange('41|11 1111').to('|4111 1111')

      expectThatTyping('shift+alt+up').willChange('41|11').to('<41|11')
      expectThatTyping('shift+alt+up').willChange('4111 11|11').to('<4111 11|11')
      expectThatTyping('shift+alt+up', 'shift+alt+up').willChange('4111 11|11').to('<4111 11|11')
      expectThatTyping('shift+alt+up').willChange('4111 |11>11').to('4111 |1111')

      expectThatTyping('meta+up').willChange('41|11').to('|4111')
      expectThatTyping('shift+meta+up').willChange('41|1>1').to('<411|1')
      expectThatTyping('shift+meta+up').willChange('41|11').to('<41|11')

  describe 'typing a down arrow', ->
    it 'works as expected', ->
      expectThatTyping('down').willChange('|4111').to('4111|')
      expectThatTyping('down').willChange('411|1').to('4111|')
      expectThatTyping('down').willChange('41|1|1').to('4111|')
      expectThatTyping('down').willChange('41|1>1').to('4111|')
      expectThatTyping('down').willChange('41<1|1').to('4111|')

      expectThatTyping('shift+down').willNotChange('41|11>')
      expectThatTyping('shift+down').willChange('<41|11').to('41|11>')
      expectThatTyping('shift+down').willChange('41<11|').to('4111|')
      expectThatTyping('shift+down').willChange('|4111> 1111').to('|4111 1111>')
      expectThatTyping('shift+down').willChange('41|1>1').to('41|11>')

      expectThatTyping('alt+down').willChange('41|11').to('4111|')
      expectThatTyping('alt+down').willChange('41|11 1111').to('4111 1111|')

      expectThatTyping('shift+alt+down').willChange('41|11').to('41|11>')
      expectThatTyping('shift+alt+down').willChange('41|11 1111').to('41|11 1111>')
      expectThatTyping('shift+alt+down').willChange('<41|11 1111').to('41|11 1111')
      expectThatTyping('shift+alt+down', 'shift+alt+down').willChange('4111| 1111').to('4111| 1111>')

      expectThatTyping('meta+down').willChange('41|11').to('4111|')
      expectThatTyping('shift+meta+down').willChange('4<1|11').to('4|111>')
      expectThatTyping('shift+meta+down').willChange('41|11').to('41|11>')

  describe 'selecting everything', ->
    ['ctrl', 'meta'].forEach (modifier) ->
      describe "with the #{modifier} key", ->
      it 'works without an existing selection', ->
        expectThatTyping("#{modifier}+a").willChange('123|4567').to('|1234567|')

      it 'works with an undirected selection', ->
        expectThatTyping("#{modifier}+a").willChange('|123|4567').to('|1234567|')

      it 'works with a right-directed selection and resets the direction', ->
        expectThatTyping("#{modifier}+a").willChange('|123>4567').to('|1234567|')

      it 'works with a left-directed selection and resets the direction', ->
        expectThatTyping("#{modifier}+a").willChange('<123|4567').to('|1234567|')

  it 'allows the formatter to prevent changes', ->
    field = buildField()
    field.formatter.isChangeValid = (change, error) -> error 'NO WAY'; return no
    expectThatTyping('backspace').into(field).willNotChange('3725 |').withError('NO WAY')
    expectThatTyping('a').into(field).willNotChange('3725 |').withError('NO WAY')

  it 'allows the formatter to alter caret changes', ->
    field = buildField()
    # disallow the caret at the start of text
    field.formatter.isChangeValid = (change) ->
      if change.proposed.caret.start is 0 and change.proposed.caret.end is 0
        change.proposed.caret = start: 1, end: 1
      return yes

    expectThatTyping('up').into(field).willChange(' 234|').to(' |234')

    # disallow selection
    field.formatter.isChangeValid = (change) ->
      caret = change.proposed.caret
      if caret.start isnt caret.end
        if change.field.selectionAnchor is caret.start
          caret.start = caret.end
        else
          caret.end = caret.start
      return yes

    expectThatTyping('shift+left').into(field).willChange('234|').to('23|4')
    expectThatTyping('shift+up').into(field).willChange('234|').to('|234')
    expectThatTyping('shift+right').into(field).willChange('2|34').to('23|4')
    expectThatTyping('shift+down').into(field).willChange('2|34').to('234|')
    expectThatTyping('meta+a').into(field).willNotChange('|1234')
    expectThatTyping('alt+shift+right').into(field).willChange('|12 34').to('12| 34')

  it 'handles pastes a any other input', ->
    expectThatPasting('eat').willChange('|').to('eat|')
    expectThatPasting('eat').willChange('Want something to |drink>?').to('Want something to eat|?')

  describe 'undo and redo', ->
    it 'undoes the last change', ->
      expectThatTyping('a', 'meta+z').willNotChange('1|')

    it 'can be done sequentially to effectively cancel each other', ->
      expectThatTyping('a', 'meta+z', 'meta+shift+z').willChange('1|').to('1a|')

    it 'work with selections', ->
      expectThatTyping('a', 'meta+z').willChange('a|b>c').to('a|b|c')
      expectThatTyping('a', 'meta+z', 'ctrl+y').willChange('a|b>c').to('aa|c')

    it 'have no effect when they run out of actions', ->
      expectThatTyping('meta+z').willNotChange('abc|')
      expectThatTyping('meta+shift+z').willNotChange('abc|')

    describe 'when the formatter rejects a change', ->
      formatter = null

      beforeEach ->
        formatter = new PassthroughFormatter()
        formatter.isChangeValid = (change) -> change.inserted.text isnt 'a'

      it 'does not count the rejected change as something to undo', ->
        expectThatTyping('0', 'a', '1', 'meta+z', 'meta+z').withFormatter(formatter).willNotChange('|')

  describe '#hasFocus', ->
    it 'is true when the document active element is the text field element', ->
      field = buildField()
      field.element.get(0).ownerDocument.activeElement = field.element.get(0)
      expect(field.hasFocus()).toBeTruthy()

    it 'is false when the document active element is not the text field element', ->
      field = buildField()
      field.element.get(0).ownerDocument.activeElement = null
      expect(field.hasFocus()).toBeFalsy()

  describe '#disabledPlaceholder', ->
    field = null

    beforeEach ->
      field = buildField()

    it 'is not set by default', ->
      expect(field.disabledPlaceholder()).toBeNull()

    it 'is not used as the placeholder when the text field is enabled', ->
      field.setEnabled yes
      field.setDisabledPlaceholder 'OMG CLICK ME'
      expect(field.placeholder()).not.toEqual('OMG CLICK ME')

    it 'is used as the placeholder when the text field is disabled', ->
      field.setEnabled no
      field.setDisabledPlaceholder 'OMG CLICK ME'
      expect(field.placeholder()).toEqual('OMG CLICK ME')
      expect(field.element.attr('placeholder')).toEqual(field.placeholder())

    it 'is used as the placeholder when the text field becomes disabled', ->
      field.setDisabledPlaceholder 'OMG CLICK ME'
      field.setEnabled no
      expect(field.placeholder()).toEqual('OMG CLICK ME')
      expect(field.element.attr('placeholder')).toEqual(field.placeholder())

  describe '#focusedPlaceholder', ->
    field = null
    hasFocus = null

    beforeEach ->
      field = buildField()
      spyOn(field, 'hasFocus').andCallFake -> hasFocus

    it 'is not set by default', ->
      expect(field.focusedPlaceholder()).toBeNull()

    it 'is not used as the placeholder when the text field is unfocused', ->
      hasFocus = no
      field.setFocusedPlaceholder 'laser focus!'
      expect(field.placeholder()).not.toEqual('laser focus!')

    it 'is used as the placeholder when the text field is focused', ->
      hasFocus = yes
      field.setFocusedPlaceholder 'laser focus!'
      expect(field.placeholder()).toEqual('laser focus!')

    it 'is used as the placeholder when the text field becomes focused', ->
      field.setFocusedPlaceholder 'laser focus!'
      hasFocus = yes
      expect(field.placeholder()).toEqual('laser focus!')

  describe '#unfocusedPlaceholder', ->
    field = null
    hasFocus = null

    beforeEach ->
      field = buildField()
      spyOn(field, 'hasFocus').andCallFake -> hasFocus

    it 'is not set by default', ->
      expect(field.unfocusedPlaceholder()).toBeNull()

    it 'is not used as the placeholder when the text field is focused', ->
      hasFocus = yes
      field.setUnfocusedPlaceholder 'fine, leave me'
      expect(field.placeholder()).not.toEqual('fine, leave me')

    it 'is used as the placeholder when the text field is unfocused', ->
      hasFocus = no
      field.setUnfocusedPlaceholder 'fine, leave me'
      expect(field.placeholder()).toEqual('fine, leave me')

    it 'is used as the placeholder when the text field becomes unfocused', ->
      field.setUnfocusedPlaceholder 'fine, leave me'
      hasFocus = no
      expect(field.placeholder()).toEqual('fine, leave me')
