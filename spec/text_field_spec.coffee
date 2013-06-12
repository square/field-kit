TextField                             = require '../lib/text_field'
{buildField, buildInput}              = require './helpers/builders'
FakeEvent                             = require './helpers/fake_event'
{expectThatTyping, expectThatPasting} = require './helpers/expectations'
{type}                                = require './helpers/typing'
PassthroughFormatter                  = require './helpers/passthrough_formatter'

describe 'TextField', ->
  describe 'constructor', ->
    it 'allows setting the formatter', ->
      formatter = new PassthroughFormatter()
      field = buildField({ formatter })
      expect(field.formatter()).toBe(formatter)

    it 'does not attempt to reformat existing text', ->
      formatter = format: (text) -> text + '!'
      $input = buildInput()
      $input.val('hey')
      field = new TextField($input, formatter)
      expect(field.text()).toEqual('hey')

    it 'throws if there is already a TextField attached to the input', ->
      $input = buildInput()
      new TextField($input)
      expect(-> new TextField($input)).toThrow("already attached a TextField to this element")

  describe 'typing a character into an empty field', ->
    it 'allows the character to be inserted', ->
      expectThatTyping('a').willChange('|').to('a|')

  describe 'typing a backspace', ->
    describe 'with a non-empty selection', ->
      it 'clears the selection', ->
        expectThatTyping('backspace').willChange('12|34|5').to('12|5')
        expectThatTyping('backspace').willChange('12<34|5').to('12|5')
        expectThatTyping('backspace').willChange('12|34>5').to('12|5')

        expectThatTyping('shift+backspace').willChange('12|34|5').to('12|5')
        expectThatTyping('shift+backspace').willChange('12<34|5').to('12|5')
        expectThatTyping('shift+backspace').willChange('12|34>5').to('12|5')

        expectThatTyping('alt+backspace').willChange('12|3 4|5').to('12|5')
        expectThatTyping('alt+backspace').willChange('12<3 4|5').to('12|5')
        expectThatTyping('alt+backspace').willChange('12|3 4>5').to('12|5')
        expectThatTyping('alt+backspace').willChange('+|').to('|')

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

        expectThatTyping('meta+backspace').onOSX().willChange('12 34 |56').to('|56')

  describe 'typing forward delete', ->
    describe 'with a non-empty selection', ->
      it 'clears the selection', ->
        expectThatTyping('delete').willChange('12|34|5').to('12|5')
        expectThatTyping('delete').willChange('12<34|5').to('12|5')
        expectThatTyping('delete').willChange('12|34>5').to('12|5')

        expectThatTyping('alt+delete').willChange('12|3 4|5').to('12|5')
        expectThatTyping('alt+delete').willChange('12<3 4|5').to('12|5')
        expectThatTyping('alt+delete').willChange('12|3 4>5').to('12|5')

        expectThatTyping('alt+delete').willChange('|+').to('|')

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

      expectThatTyping('meta+left').onOSX().willChange('41|11').to('|4111')
      expectThatTyping('shift+meta+left').onOSX().willChange('41|11').to('<41|11')
      expectThatTyping('shift+meta+left').onOSX().willChange('41|1>1').to('<411|1')
      expectThatTyping('shift+meta+left').onOSX().willNotChange('|4111')

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

      expectThatTyping('meta+right').onOSX().willChange('41|11').to('4111|')
      expectThatTyping('shift+meta+right').onOSX().willChange('41|11').to('41|11>')
      expectThatTyping('shift+meta+right').onOSX().willChange('<41|11').to('|4111>')
      expectThatTyping('shift+meta+right').onOSX().willNotChange('4111|')

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

  describe 'pressing enter', ->
    it 'is allowed to use the default action on keyPress so form submission works', ->
      field = buildField()
      event = FakeEvent.withKey('enter')
      field.keyPress(event)
      expect(event.isDefaultPrevented()).toBeFalsy()

  describe 'pressing tab', ->
    it 'is allowed to use the default action on keyPress so tabbing between fields', ->
      field = buildField()
      event = FakeEvent.withKey('tab')
      field.keyPress(event)
      expect(event.isDefaultPrevented()).toBeFalsy()

  describe 'commands', ->
    it 'are not prevented', ->
      field = buildField()

      event = FakeEvent.withKey('meta+r')
      field.keyPress(event)
      expect(event.isDefaultPrevented()).toBeFalsy()

      event = FakeEvent.withKey('ctrl+r')
      field.keyPress(event)
      expect(event.isDefaultPrevented()).toBeFalsy()

  describe 'selecting everything', ->
    for own ctrl, platform of { ctrl: 'Windows', meta: 'OSX' }
      describe "with the #{ctrl} key", ->
      it 'works without an existing selection', ->
        expectThatTyping("#{ctrl}+a")["on#{platform}"]().willChange('123|4567').to('|1234567|')

      it 'works with an undirected selection', ->
        expectThatTyping("#{ctrl}+a")["on#{platform}"]().willChange('|123|4567').to('|1234567|')

      it 'works with a right-directed selection and resets the direction', ->
        expectThatTyping("#{ctrl}+a")["on#{platform}"]().willChange('|123>4567').to('|1234567|')

      it 'works with a left-directed selection and resets the direction', ->
        expectThatTyping("#{ctrl}+a")["on#{platform}"]().willChange('<123|4567').to('|1234567|')

  it 'allows the formatter to prevent changes', ->
    field = buildField()
    field.formatter().isChangeValid = (change, error) -> error 'NO WAY'; return no
    expectThatTyping('backspace').into(field).willNotChange('3725 |').withError('NO WAY')
    expectThatTyping('a').into(field).willNotChange('3725 |').withError('NO WAY')

  it 'allows the formatter to alter selection range changes', ->
    field = buildField()
    # disallow empty selection at the start of text
    field.formatter().isChangeValid = (change) ->
      range = change.proposed.selectedRange
      if range.start is 0 and range.length is 0
        range.start = 1
      return yes

    expectThatTyping('up').into(field).willChange(' 234|').to(' |234')

    # disallow selection
    field.formatter().isChangeValid = (change) ->
      range = change.proposed.selectedRange
      if range.length isnt 0
        if change.field.selectionAnchor() is range.start
          range.start += range.length
        else
          range.end -= range.length
        range.length = 0
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
      expectThatTyping('a', 'meta+z').onOSX().willNotChange('1|')

    it 'only undoes when the right platform-specific key is pressed', ->
      expectThatTyping('a', 'meta+z').onWindows().willChange('1|').to('1a|')

    it 'can be done sequentially to effectively cancel each other', ->
      expectThatTyping('a', 'meta+z', 'meta+shift+z').onOSX().willChange('1|').to('1a|')

    it 'work with selections', ->
      expectThatTyping('a', 'ctrl+z').onWindows().willChange('a|b>c').to('a|b|c')
      expectThatTyping('a', 'ctrl+z', 'ctrl+y').onWindows().willChange('a|b>c').to('aa|c')

    it 'have no effect when they run out of actions', ->
      expectThatTyping('meta+z').onOSX().willNotChange('abc|')
      expectThatTyping('meta+shift+z').onOSX().willNotChange('abc|')

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

  describe 'when we have a delegate', ->
    field = null

    beforeEach ->
      field = buildField()
      field.setDelegate
        textFieldDidBeginEditing: jasmine.createSpy('delegate.textFieldDidBeginEditing')
        textFieldDidEndEditing: jasmine.createSpy('delegate.textFieldDidEndEditing')
        textDidChange: jasmine.createSpy('delegate.textDidChange')
      expect(field.delegate().textFieldDidEndEditing).not.toHaveBeenCalled()

    it 'calls the delegate method for ending editing on enter', ->
      type('enter').into(field)
      expect(field.delegate().textFieldDidEndEditing).toHaveBeenCalledWith(field)

    it 'calls the delegate method for ending editing on focus out', ->
      field.becomeFirstResponder()
      field.resignFirstResponder()
      expect(field.delegate().textFieldDidEndEditing).toHaveBeenCalledWith(field)

    it 'does not call the delegate method for text change when moving the cursor', ->
      field.setText('abc')
      field.setSelectedRange(start: 0, length: 0)
      type('left').into(field)
      expect(field.delegate().textDidChange).not.toHaveBeenCalled()

    it 'calls the delegate method for text change on any change', ->
      type('a').into(field)
      expect(field.delegate().textDidChange).toHaveBeenCalledWith(field)

    it 'calls the delegate method for text change when a change is undone by the user', ->
      type('a').into(field)
      field.delegate().textDidChange.reset()
      type('meta+z').into(field)
      expect(field.delegate().textDidChange).toHaveBeenCalledWith(field)

    it 'calls the delegate method for text change when a change is redone by the user', ->
      type('a', 'meta+z').into(field)
      field.delegate().textDidChange.reset()
      type('meta+shift+z').into(field)
      expect(field.delegate().textDidChange).toHaveBeenCalledWith(field)

    it 'calls the delegate method for text change when a change is undone manually', ->
      type('a').into(field)
      field.delegate().textDidChange.reset()
      field.undoManager().undo()
      expect(field.delegate().textDidChange).toHaveBeenCalledWith(field)

    it 'calls the delegate method for text change when a change is redone manually', ->
      type('a', 'meta+z').into(field)
      field.delegate().textDidChange.reset()
      field.undoManager().redo()
      expect(field.delegate().textDidChange).toHaveBeenCalledWith(field)

    it 'does not call the delegate method for ending editing on a change', ->
      type('a').into(field)
      expect(field.delegate().textFieldDidEndEditing).not.toHaveBeenCalled()

    it 'calls the delegate method for beginning editing on focus', ->
      field.becomeFirstResponder()
      expect(field.delegate().textFieldDidBeginEditing).toHaveBeenCalledWith(field)

    it 'calls the delegate method for beginning editing on keydown after pressing enter', ->
      field.becomeFirstResponder()
      field.delegate().textFieldDidBeginEditing.reset()

      expect(field.delegate().textFieldDidEndEditing).not.toHaveBeenCalled()
      type('enter').into(field)
      expect(field.delegate().textFieldDidEndEditing).toHaveBeenCalledWith(field)

      type('a').into(field)
      expect(field.delegate().textFieldDidBeginEditing).toHaveBeenCalledWith(field)

  describe '#destroy', ->
    it 'removes observers from the attached input', ->
      $input = buildInput()
      field1 = buildField(input: $input)

      type('a').into($input)
      expect($input.val()).toEqual('a')

      field1.destroy()
      field2 = buildField(input: $input)
      type('b').into($input)
      expect($input.val()).toEqual('ab')
