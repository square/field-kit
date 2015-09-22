import { expectThatTyping, expectThatPasting } from './helpers/expectations';
import { buildField, buildInput } from './helpers/builders';
import Selection from './helpers/selection';
import FakeEvent from './helpers/fake_event';
import PassthroughFormatter from './helpers/passthrough_formatter';
import Keysim from 'keysim';
import FieldKit from '../../src';
import sinon from 'sinon';
import {expect} from 'chai';

testsWithAllKeyboards('FieldKit.TextField', function() {
  var keyboard = Keysim.Keyboard.US_ENGLISH;

  describe('class constructor', function() {
    it('allows setting the formatter', function() {
      var formatter = new PassthroughFormatter();
      var field = buildField({ formatter });
      expect(field.formatter()).to.equal(formatter);
    });

    it('does not attempt to reformat existing text', function() {
      var formatter = { format: text => `${text}!` };
      var $input = buildInput({ value: 'hey' });
      var field = new FieldKit.TextField($input, formatter);
      expect(field).to.be.selected('hey|');
    });

    it('keeps `autocapitalize` `on` on the input', function() {
      var formatter = new PassthroughFormatter();
      var field = buildField({
        autocapitalize: true,
        formatter
      });
      expect(field.element.getAttribute('autocapitalize')).to.equal('on');
    });

    it('turns `autocapitalize` `off` for the input', function() {
      var formatter = new PassthroughFormatter();
      var field = buildField({ formatter });
      expect(field.element.getAttribute('autocapitalize')).to.equal('off');
    });

    it('throws if there is already a TextField attached to the input', function() {
      var $input = buildInput();
      new FieldKit.TextField($input);
      try {
        new FieldKit.TextField($input);
        throw new Error('this should have thrown an exception');
      } catch (ex) {
        expect(ex.message).to.equal('already attached a TextField to this element');
      }
    });
  });

  describe('typing a character into an empty field', function() {
    it('allows the character to be inserted', function() {
      expectThatTyping('a').willChange('|').to('a|');
    });
  });

  describe('typing a backspace', function() {
    describe('with a non-empty selection', function() {
      it('clears the selection', function() {
        expectThatTyping('backspace').willChange('12|341|5').to('12|5');
        expectThatTyping('backspace').willChange('12|341>5').to('12|5');
        expectThatTyping('backspace').willChange('12<341|5').to('12|5');

        expectThatTyping('shift+backspace').willChange('12|342|5').to('12|5');
        expectThatTyping('shift+backspace').willChange('12<342|5').to('12|5');
        expectThatTyping('shift+backspace').willChange('12|342>5').to('12|5');

        expectThatTyping('alt+backspace').willChange('12|3 43|5').to('12|5');
        expectThatTyping('alt+backspace').willChange('12<3 43|5').to('12|5');
        expectThatTyping('alt+backspace').willChange('12|3 43>5').to('12|5');
        expectThatTyping('alt+backspace').willChange('+|').to('|');

        expectThatTyping('meta+backspace').onOSX().willChange('12|3 44>5').to('12|5');
      });
    });

    describe('with an empty selection', function() {
      it('works as expected', function() {
        expectThatTyping('backspace').willNotChange('|12');
        expectThatTyping('backspace').willChange('1|2').to('|2');

        expectThatTyping('alt+backspace').willNotChange('|12');
        expectThatTyping('alt+backspace').willChange('12|').to('|');
        expectThatTyping('alt+backspace').willChange('12 34|').to('12 |');
        expectThatTyping('alt+backspace').willChange('12 3|4').to('12 |4');
        expectThatTyping('alt+backspace').willChange('12 |34').to('|34');

        expectThatTyping('meta+backspace').onOSX().willChange('12 34 |56').to('|56');
      });
    });
  });

  describe('typing forward delete', function() {
    describe('with a non-empty selection', function() {
      it('clears the selection', function() {
        expectThatTyping('delete').willChange('12|34|5').to('12|5');
        expectThatTyping('delete').willChange('12<34|5').to('12|5');
        expectThatTyping('delete').willChange('12|34>5').to('12|5');

        expectThatTyping('alt+delete').willChange('12|3 4|5').to('12|5');
        expectThatTyping('alt+delete').willChange('12<3 4|5').to('12|5');
        expectThatTyping('alt+delete').willChange('12|3 4>5').to('12|5');

        expectThatTyping('alt+delete').willChange('|+').to('|');
      });
    });

    describe('with an empty selection', function() {
      it('works as expected', function() {
        expectThatTyping('delete').willNotChange('12|');
        expectThatTyping('delete').willChange('1|2').to('1|');

        expectThatTyping('alt+delete').willNotChange('12|');
        expectThatTyping('alt+delete').willChange('|12').to('|');
        expectThatTyping('alt+delete').willChange('|12 34').to('| 34');
        expectThatTyping('alt+delete').willChange('12| 34').to('12|');
      });
    });
  });

  describe('typing a left arrow', function() {
    it('works as expected', function() {
      expectThatTyping('left').willNotChange('|4111');
      expectThatTyping('left').willChange('4|111').to('|4111');
      expectThatTyping('left').willChange('41|1|1').to('41|11');

      expectThatTyping('shift+left').willNotChange('<41|11');
      expectThatTyping('shift+left').willChange('4<1|11').to('<41|11');
      expectThatTyping('shift+left').willChange('|41>11').to('|4>111');
      expectThatTyping('shift+left').willChange('|4111 1>111').to('|4111 >1111');
      expectThatTyping('shift+left', 'shift+left').willChange('41|1>1').to('4<1|11');

      expectThatTyping('alt+left').willChange('41|11').to('|4111');
      expectThatTyping('alt+left').willChange('4111 11|11').to('4111 |1111');
      expectThatTyping('alt+left', 'alt+left').willChange('4111 11|11').to('|4111 1111');

      expectThatTyping('shift+alt+left').willChange('41|11').to('<41|11');
      expectThatTyping('shift+alt+left').willChange('4111 11|11').to('4111 <11|11');
      expectThatTyping('shift+alt+left', 'shift+alt+left').willChange('4111 11|11').to('<4111 11|11');

      expectThatTyping('meta+left').onOSX().willChange('41|11').to('|4111');
      expectThatTyping('shift+meta+left').onOSX().willChange('41|11').to('<41|11');
      expectThatTyping('shift+meta+left').onOSX().willChange('41|1>1').to('<411|1');
      expectThatTyping('shift+meta+left').onOSX().willNotChange('|4111');
    });
  });

  describe('typing a right arrow', function() {
    it('works as expected', function() {
      expectThatTyping('right').willChange('|4111').to('4|111');
      expectThatTyping('right').willNotChange('4111|');
      expectThatTyping('right').willChange('41|1|1').to('411|1');

      expectThatTyping('shift+right').willNotChange('41|11>');
      expectThatTyping('shift+right').willChange('<41|11').to('4<1|11');
      expectThatTyping('shift+right').willChange('|41>11').to('|411>1');
      expectThatTyping('shift+right').willChange('|4111> 1111').to('|4111 >1111');
      expectThatTyping('shift+right', 'shift+right').willChange('41<1|1').to('411|1>');

      expectThatTyping('alt+right').willChange('41|11').to('4111|');
      expectThatTyping('alt+right').willChange('41|11 1111').to('4111| 1111');
      expectThatTyping('alt+right', 'alt+right').willChange('41|11 1111').to('4111 1111|');

      expectThatTyping('shift+alt+right').willChange('41|11').to('41|11>');
      expectThatTyping('shift+alt+right').willChange('41|11 1111').to('41|11> 1111');
      expectThatTyping('shift+alt+right', 'shift+alt+right').willChange('41|11 1111').to('41|11 1111>');

      expectThatTyping('meta+right').onOSX().willChange('41|11').to('4111|');
      expectThatTyping('shift+meta+right').onOSX().willChange('41|11').to('41|11>');
      expectThatTyping('shift+meta+right').onOSX().willChange('<41|11').to('|4111>');
      expectThatTyping('shift+meta+right').onOSX().willNotChange('4111|');
    });
  });

  describe('typing an up arrow', function() {
    it('works as expected', function() {
      expectThatTyping('up').willChange('4111|').to('|4111');
      expectThatTyping('up').willChange('411|1').to('|4111');
      expectThatTyping('up').willChange('41|1|1').to('|4111');
      expectThatTyping('up').willChange('41|1>1').to('|4111');
      expectThatTyping('up').willChange('41<1|1').to('|4111');

      expectThatTyping('shift+up').willChange('41|11>').to('<41|11');
      expectThatTyping('shift+up').willNotChange('<41|11');
      expectThatTyping('shift+up').willChange('|41>11').to('|4111');
      expectThatTyping('shift+up').willChange('|4111> 1111').to('|4111 1111');
      expectThatTyping('shift+up').willChange('41<1|1').to('<411|1');

      expectThatTyping('alt+up').willChange('41|11').to('|4111');
      expectThatTyping('alt+up').willChange('41|11 1111').to('|4111 1111');

      expectThatTyping('shift+alt+up').willChange('41|11').to('<41|11');
      expectThatTyping('shift+alt+up').willChange('4111 11|11').to('<4111 11|11');
      expectThatTyping('shift+alt+up', 'shift+alt+up').willChange('4111 11|11').to('<4111 11|11');
      expectThatTyping('shift+alt+up').willChange('4111 |11>11').to('4111 |1111');

      expectThatTyping('meta+up').onOSX().willChange('41|11').to('|4111');
      expectThatTyping('shift+meta+up').onOSX().willChange('41|1>1').to('<411|1');
      expectThatTyping('shift+meta+up').onOSX().willChange('41|11').to('<41|11');
    });
  });

  describe('typing a down arrow', function() {
    it('works as expected', function() {
      expectThatTyping('down').willChange('|4111').to('4111|');
      expectThatTyping('down').willChange('411|1').to('4111|');
      expectThatTyping('down').willChange('41|1|1').to('4111|');
      expectThatTyping('down').willChange('41|1>1').to('4111|');
      expectThatTyping('down').willChange('41<1|1').to('4111|');

      expectThatTyping('shift+down').willNotChange('41|11>');
      expectThatTyping('shift+down').willChange('<41|11').to('41|11>');
      expectThatTyping('shift+down').willChange('41<11|').to('4111|');
      expectThatTyping('shift+down').willChange('|4111> 1111').to('|4111 1111>');
      expectThatTyping('shift+down').willChange('41|1>1').to('41|11>');

      expectThatTyping('alt+down').willChange('41|11').to('4111|');
      expectThatTyping('alt+down').willChange('41|11 1111').to('4111 1111|');

      expectThatTyping('shift+alt+down').willChange('41|11').to('41|11>');
      expectThatTyping('shift+alt+down').willChange('41|11 1111').to('41|11 1111>');
      expectThatTyping('shift+alt+down').willChange('<41|11 1111').to('41|11 1111');
      expectThatTyping('shift+alt+down', 'shift+alt+down').willChange('4111| 1111').to('4111| 1111>');

      expectThatTyping('meta+down').onOSX().willChange('41|11').to('4111|');
      expectThatTyping('shift+meta+down').onOSX().willChange('4<1|11').to('4|111>');
      expectThatTyping('shift+meta+down').onOSX().willChange('41|11').to('41|11>');
    });
  });

  describe('pressing enter', function() {
    it('is allowed to use the default action on keyPress so form submission works', function() {
      var field = buildField();
      var event = FakeEvent.withKey('enter');
      field._keyPress(event);
      expect(event.isDefaultPrevented()).to.be.false;
    });
  });

  describe('pressing tab', function() {
    it('is allowed to use the default action on keyPress so tabbing between fields', function() {
      var field = buildField();
      var event = FakeEvent.withKey('tab');
      field._keyPress(event);
      expect(event.isDefaultPrevented()).to.be.false;
    });
  });

  describe('commands', function() {
    it('are not prevented', function() {
      var field = buildField();
      var event = FakeEvent.withKey('meta+r');
      field._keyPress(event);
      expect(event.isDefaultPrevented()).to.be.false;

      event = FakeEvent.withKey('ctrl+r');
      field._keyPress(event);
      expect(event.isDefaultPrevented()).to.be.false;
    });
  });

  describe('selecting everything', function() {
    [['ctrl', 'Windows'], ['meta', 'OSX']].forEach(function(ctrlAndPlatform) {
      var ctrl = ctrlAndPlatform[0];
      var platform = ctrlAndPlatform[1];

      describe('with the '+ctrl+' key on '+platform, function() {
        it('works without an existing selection', function() {
          expectThatTyping(ctrl+'+a')['on'+platform]().willChange('123|4567').to('|1234567|');
        });

        it('works with an undirected selection', function() {
          expectThatTyping(ctrl+'+a')['on'+platform]().willChange('|123|4567').to('|1234567|');
        });

        it('works with a right-directed selection and resets the direction', function() {
          expectThatTyping(ctrl+'+a')['on'+platform]().willChange('|123>4567').to('|1234567|');
        });

        it('works with a left-directed selection and resets the direction', function() {
          expectThatTyping(ctrl+'+a')['on'+platform]().willChange('<123|4567').to('|1234567|');
        });
      });
    });
  });

  it('allows the formatter to prevent changes', function() {
    var field = buildField();
    field.formatter().isChangeValid = (change, error) => { error('NO WAY'); return false; };
    expectThatTyping('backspace').into(field).willNotChange('3725 |').withError('NO WAY');
    expectThatTyping('a').into(field).willNotChange('3725 |').withError('NO WAY');
  });

  it('allows the formatter to alter selection range changes', function() {
    var field = buildField();
    // disallow empty selection at the start of text
    field.formatter().isChangeValid = (change) => {
      var range = change.proposed.selectedRange;
      if (range.start === 0 && range.length === 0) {
        range.start = 1;
      }
      return true;
    };

    expectThatTyping('up').into(field).willChange(' 234|').to(' |234');

    // disallow selection
    field.formatter().isChangeValid = (change) => {
      var range = change.proposed.selectedRange;
      if (range.length !== 0) {
        if (change.field.selectionAnchor() === range.start) {
          range.start += range.length;
        } else {
          range.end -= range.length;
        }
        range.length = 0;
      }
      return true;
    };

    expectThatTyping('shift+left').into(field).willChange('234|').to('23|4');
    expectThatTyping('shift+up').into(field).willChange('234|').to('|234');
    expectThatTyping('shift+right').into(field).willChange('2|34').to('23|4');
    expectThatTyping('shift+down').into(field).willChange('2|34').to('234|');
    expectThatTyping('meta+a').onOSX().into(field).willNotChange('|1234');
    expectThatTyping('alt+shift+right').into(field).willChange('|12 34').to('12| 34');
  });

  it('handles pastes a any other input', function() {
    expectThatPasting('eat').willChange('|').to('eat|');
    expectThatPasting('eat').willChange('Want something to |drink>?').to('Want something to eat|?');
  });

  // Mobile doesn't have undo and redo with keyboard
  // Currently it works on Android but the caret is in the incorrect place
  // Because of Android Bug
  testsWithDesktopKeyboards('undo and redo', function() {
    it('undoes the last change', function() {
      expectThatTyping('a', 'meta+z').onOSX().willNotChange('1|');
    });

    it('only undoes when the right platform-specific key is pressed', function() {
      expectThatTyping('a', 'meta+z').onWindows().willChange('1|').to('1a|');
    });

    it('can be done sequentially to effectively cancel each other', function() {
      expectThatTyping('a', 'meta+z', 'meta+shift+z').onOSX().willChange('1|').to('1a|');
    });

    it('work with selections', function() {
      expectThatTyping('a', 'ctrl+z').onWindows().willChange('a|b>c').to('a|b|c');
      expectThatTyping('a', 'ctrl+z', 'ctrl+y').onWindows().willChange('a|b>c').to('aa|c');
    });

    it('have no effect when they run out of actions', function() {
      expectThatTyping('meta+z').onOSX().willNotChange('abc|');
      expectThatTyping('meta+shift+z').onOSX().willNotChange('abc|');
    });

    describe('when the formatter rejects a change', function() {
      var formatter;

      beforeEach(function() {
        formatter = new PassthroughFormatter();
        formatter.isChangeValid = change => change.inserted.text !== 'a';
      });

      it('does not count the rejected change as something to undo', function() {
        expectThatTyping('0', 'a', '1', 'meta+z', 'meta+z').onOSX().withFormatter(formatter).willNotChange('|');
      });
    });
  });

  describe('#hasFocus', function() {
    it('is true when the document active element is the text field element', function() {
      var field = buildField();
      field.element.focus();
      expect(field.hasFocus()).to.be.true;
    });

    it('is false when the document active element is not the text field element', function() {
      var field = buildField();
      field.element.blur();
      expect(field.hasFocus()).to.be.false;
    });
  });

  describe('#disabledPlaceholder', function() {
    var field;

    beforeEach(function() {
      field = buildField();
    });

    it('is not set by default', function() {
      expect(field.disabledPlaceholder()).to.be.null;
    });

    it('is not used as the placeholder when the text field is enabled', function() {
      field.setEnabled(true);
      field.setDisabledPlaceholder('OMG CLICK ME');
      expect(field.placeholder()).not.to.equal('OMG CLICK ME');
    });

    it('is used as the placeholder when the text field is disabled', function() {
      field.setEnabled(false);
      field.setDisabledPlaceholder('OMG CLICK ME');
      expect(field.placeholder()).to.equal('OMG CLICK ME');
      expect(field.element.getAttribute('placeholder')).to.equal(field.placeholder());
    });

    it('is used as the placeholder when the text field becomes disabled', function() {
      field.setDisabledPlaceholder('OMG CLICK ME');
      field.setEnabled(false);
      expect(field.placeholder()).to.equal('OMG CLICK ME');
      expect(field.element.getAttribute('placeholder')).to.equal(field.placeholder());
    });
  });

  describe('#focusedPlaceholder', function() {
    var field;
    var hasFocus;

    beforeEach(function() {
      field = buildField();
      sinon.stub(field, 'hasFocus', () => hasFocus);
    });

    it('is not set by default', function() {
      expect(field.focusedPlaceholder()).to.be.null;
    });

    it('is not used as the placeholder when the text field is unfocused', function() {
      hasFocus = false;
      field.setFocusedPlaceholder('laser focus!');
      expect(field.placeholder()).not.to.equal('laser focus!');
    });

    it('is used as the placeholder when the text field is focused', function() {
      hasFocus = true;
      field.setFocusedPlaceholder('laser focus!');
      expect(field.placeholder()).to.equal('laser focus!');
    });

    it('is used as the placeholder when the text field becomes focused', function() {
      field.setFocusedPlaceholder('laser focus!');
      hasFocus = true;
      expect(field.placeholder()).to.equal('laser focus!');
    });
  });

  describe('#unfocusedPlaceholder', function() {
    var field;
    var hasFocus;

    beforeEach(function() {
      field = buildField();
      sinon.stub(field, 'hasFocus', () => hasFocus);
    });

    it('is not set by default', function() {
      expect(field.unfocusedPlaceholder()).to.be.null;
    });

    it('is not used as the placeholder when the text field is focused', function() {
      hasFocus = true;
      field.setUnfocusedPlaceholder('fine, leave me');
      expect(field.placeholder()).not.to.equal('fine, leave me');
    });

    it('is used as the placeholder when the text field is unfocused', function() {
      hasFocus = false;
      field.setUnfocusedPlaceholder('fine, leave me');
      expect(field.placeholder()).to.equal('fine, leave me');
    });

    it('is used as the placeholder when the text field becomes unfocused', function() {
      field.setUnfocusedPlaceholder('fine, leave me');
      hasFocus = false;
      expect(field.placeholder()).to.equal('fine, leave me');
    });
  });

  describe('HTML5 events', function() {
    var field;

    describe('input', function() {
      var inputSpy;

      beforeEach(function() {
        inputSpy = sinon.spy();
        field = buildField();
        field.element.addEventListener('input', inputSpy);
      });

      it('is fired when making a successful input', function() {
        expectThatTyping('a').into(field).willChange('|').to('a|');
        expect(inputSpy.called).to.equal(true);
      });

      it('is not fired when making an empty input', function() {
        expectThatTyping('left').into(field).willChange('|').to('|');
        expect(inputSpy.called).to.equal(false);
      });
    });

    describe('change', function() {
      var changeSpy;

      beforeEach(function() {
        changeSpy = sinon.spy();
        field = buildField();
        field.element.addEventListener('change', changeSpy);
      });

      it('is not fired when leaving the field without making input', function() {
        field.element.focus();
        field.element.blur();
        expect(changeSpy.called).to.equal(false);
      });

      it('is not fired when leaving the field after making an empty input', function() {
        field.element.focus();
        expectThatTyping('left').into(field).before(() => field.element.blur()).willChange('|').to('|');
        expect(changeSpy.called).to.equal(false);
      });

      it('is fired when leaving the field after making a change', function() {
        field.element.focus();
        expectThatTyping('a').into(field).before(() => {
          expect(changeSpy.called).to.equal(false);
          field.element.blur();
        }).willChange('|').to('a|');
        expect(changeSpy.called).to.equal(true);
      });

      it('is fired when leaving the field after pressing backspace', function() {
        field.element.focus();
        expectThatTyping('ab').into(field).before(() => {
          field.element.blur();
          field.element.focus();
        }).willChange('|').to('ab|');

        field.element.focus();
        expectThatTyping('backspace').into(field).before(() => {
          field.element.blur();
        }).willChange('ab|').to('a|');

        expect(changeSpy.callCount).to.equal(2);
      });

      it('is not fired when leaving the field that has the same value as before it was focused', function() {
        field.element.focus();
        expectThatTyping('a,backspace').into(field).before(() => {
          field.element.blur();
        }).willChange('|').to('|');
        expect(changeSpy.called).to.equal(false);
      });

      it('status resets properly when leaving a field', function() {
        field.element.focus();
        expectThatTyping('a').into(field).before(() => {
          field.element.blur();
        }).willChange('|').to('a|');
        expect(changeSpy.called).to.equal(true);

        field.element.focus();
        expectThatTyping('left').into(field).before(() => {
          field.element.blur();
        }).willChange('a|').to('|a');

        expect(changeSpy.callCount).to.equal(1);
      });
    });
  });

  describe('when we have a delegate', function() {
    var field;

    beforeEach(function() {
      field = buildField(null, this.fieldOptions || {});
      field.setDelegate({
        textFieldDidBeginEditing: sinon.spy(),
        textFieldDidEndEditing: sinon.spy(),
        textDidChange: sinon.spy()
      });
      expect(field.delegate().textFieldDidEndEditing.callCount).to.equal(0);
    });

    it('calls the delegate method for ending editing on enter', function() {
      keyboard.dispatchEventsForAction('enter', field.element);
      expect(field.delegate().textFieldDidEndEditing.firstCall.args).to.eql([field]);
    });

    it('calls the delegate method for ending editing on focus out', function() {
      field.becomeFirstResponder();
      field.resignFirstResponder();
      expect(field.delegate().textFieldDidEndEditing.firstCall.args).to.eql([field]);
    });

    it('does not call the delegate method for text change when moving the cursor', function() {
      field.setText('abc');
      field.setSelectedRange({start: 0, length: 0});
      keyboard.dispatchEventsForAction('left', field.element);
      expect(field.delegate().textDidChange.callCount).to.equal(0);
    });

    it('calls the delegate method for text change on any change', function() {
      keyboard.dispatchEventsForInput('a', field.element);
      expect(field.delegate().textDidChange.firstCall.args).to.eql([field]);
    });

    it('calls the delegate method for text change when a change is undone by the user', function() {
      keyboard.dispatchEventsForInput('a', field.element);
      field.delegate().textDidChange.reset();
      keyboard.dispatchEventsForAction('meta+z', field.element);
      expect(field.delegate().textDidChange.firstCall.args).to.eql([field]);
    });

    it('calls the delegate method for text change when a change is redone by the user', function() {
      keyboard.dispatchEventsForInput('a', field.element);
      keyboard.dispatchEventsForAction('meta+z', field.element);
      field.delegate().textDidChange.reset();
      keyboard.dispatchEventsForAction('meta+shift+z', field.element);
      expect(field.delegate().textDidChange.firstCall.args).to.eql([field]);
    });

    it('calls the delegate method for text change when a change is undone manually', function() {
      keyboard.dispatchEventsForInput('a', field.element);
      field.delegate().textDidChange.reset();
      field.undoManager().undo();
      expect(field.delegate().textDidChange.firstCall.args).to.eql([field]);
    });

    it('calls the delegate method for text change when a change is redone manually', function() {
      keyboard.dispatchEventsForInput('a', field.element);
      keyboard.dispatchEventsForAction('meta+z', field.element);
      field.delegate().textDidChange.reset();
      field.undoManager().redo();
      expect(field.delegate().textDidChange.firstCall.args).to.eql([field]);
    });

    it('does not call the delegate method for ending editing on a change', function() {
      keyboard.dispatchEventsForInput('a', field.element);
      expect(field.delegate().textFieldDidEndEditing.callCount).to.equal(0);
    });

    it('calls the delegate method for beginning editing on focus', function() {
      field.becomeFirstResponder();
      expect(field.delegate().textFieldDidBeginEditing.firstCall.args).to.eql([field]);
    });

    it('calls the delegate method for beginning editing on keydown after pressing enter', function() {
      field.becomeFirstResponder();
      field.delegate().textFieldDidBeginEditing.reset();

      expect(field.delegate().textFieldDidEndEditing.callCount).to.equal(0);
      keyboard.dispatchEventsForAction('enter', field.element);
      expect(field.delegate().textFieldDidEndEditing.firstCall.args).to.eql([field]);

      keyboard.dispatchEventsForInput('a', field.element);
      expect(field.delegate().textFieldDidBeginEditing.firstCall.args).to.eql([field]);
    });

    context('in a browser that doesn\'t support focusin/out', function() {
      // lazy('fieldOptions', function() {
      //   return {'userAgent': 'osx.firefox.v24'};
      // });

      it('calls the delegate method for beginning editing and ending editing in a browser that doesn\'t support focusin/out', function() {
        field.element.focus();
        expect(field.delegate().textFieldDidBeginEditing.callCount).to.eql(1);

        field.element.blur();
        expect(field.delegate().textFieldDidEndEditing.callCount).to.eql(1);
      });
    });
  });

  describe('#destroy', function() {
    it('removes observers from the attached input', function() {
      var $input = buildInput();
      var field1 = buildField({input: $input});

      keyboard.dispatchEventsForInput('a', $input);
      expect($input.value).to.equal('a');

      field1.destroy();
      buildField({input: $input});
      keyboard.dispatchEventsForInput('b', $input);
      expect($input.value).to.equal('ab');
    });
  });

  describe('without a formatter', function() {
    var field;

    it('uses a default formatter', function() {
      field = buildField();
      field.setFormatter(null);
      expect(field.formatter() instanceof FieldKit.Formatter).to.be.true;
    });

    it('respects maxlength set on the element', function() {
      field = buildField();
      field.element.setAttribute('maxlength', '2');
      field.setFormatter(null);
      expectThatTyping('abc').into(field).willChange('|').to('ab|');
    });
  });

  describe('with a browser that sends keypress events for non-printable keys', function() {
    it('ignores the keypress event', function() {
      expectThatTyping('left').withUserAgent('osx.firefox.v24').willChange('a|').to('|a');
    });
  });
});
