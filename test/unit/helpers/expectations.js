import './setup';
import Keysim from 'keysim';
import FakeEvent from './fake_event';
import Selection from './selection';
import TextField from '../../../src/text_field';
import { buildField } from './builders';
import { getCaret, setCaret } from '../../../src/caret';
import {expect} from 'chai';

class FieldExpectationBase {
  into(field) {
    this.field = field;
    return this;
  }

  withFormatter(formatter) {
    this.field.setFormatter(formatter);
    return this;
  }

  willChange(currentDescription) {
    this.currentDescription = currentDescription;
    return this;
  }

  willNotChange(currentDescription) {
    this.currentDescription = currentDescription;
    return this.to(currentDescription);
  }

  to(expectedDescription) {
    this.expectedDescription = expectedDescription;
    this.applyDescription();
    this.proxyDelegate();
    this.perform();

    if (this.beforeAssert) {
      this.beforeAssert();
    }

    this.assert();
    return this;
  }

  before(fn) {
    this.beforeAssert = fn;
    return this;
  }

  withError(errorType) {
    expect(this.actualErrorType).to.equal(errorType);
  }

  onOSX() {
    return this.withUserAgent('Mozilla/5.0 (Macintosh Chrome');
  }

  onWindows() {
    return this.withUserAgent('windows.chrome.latest');
  }

  onAndroid() {
    return this.withUserAgent('android.chrome.latest');
  }

  withUserAgent(userAgent) {
    this.userAgent = userAgent;
    return this;
  }

  applyDescription() {
    var description = Selection.parseDescription(this.currentDescription);
    var caret = description.caret;
    var affinity = description.affinity;
    var value = description.value;

    this.field.setText(value);

    setCaret(this.field.element, caret.start, caret.end);
    this.field.selectionAffinity = affinity;
  }

  proxyDelegate() {
    var currentDelegate = this.field.delegate();
    this.field.setDelegate({
      textFieldDidFailToValidateChange: (textField, change, errorType) => {
        this.actualErrorType = errorType;
        if (currentDelegate && typeof currentDelegate.textFieldDidFailToValidateChange === 'function') {
          currentDelegate.textFieldDidFailToValidateChange(change, errorType);
        }
      },

      textFieldDidFailToParseString: (textField, change, errorType) => {
        this.actualErrorType = errorType;
        if (currentDelegate && typeof currentDelegate.textFieldDidFailToParseString === 'function') {
          currentDelegate.textFieldDidFailToParseString(change, errorType);
        }
      }
    });
  }

  assert() {
    var actual =
      Selection.printDescription({
        caret: getCaret(this.field.element),
        affinity: this.field.selectionAffinity,
        value: this.field.element.value
      });

    expect(actual).to.equal(this.expectedDescription);
  }

  get field() {
    if (!this._field) {
      var options = {};
      if (this.userAgent) {
        options['userAgent'] = this.userAgent;
      }
      this._field = buildField(TextField, options);
    }
    return this._field;
  }

  set field(field) {
    this._field = field;
  }
}

class ExpectThatTyping extends FieldExpectationBase {
  constructor(keys) {
    super();
    this.keys = keys;
  }

  perform() {
    this.typeKeys();
  }

  typeKeys() {
    var modifier = false;
    var keyboard = window.keyboard;
    var KEYS = [
      'zero',
      'nine',
      'left',
      'right',
      'up',
      'down',
      'backspace',
      'delete',
      'enter',
      'tab',
      'printable_start',
      'printable_end',
      'meta',
      'alt',
      'shift',
      'ctrl'
    ];

    this.keys.forEach((key) => {
      key.split(',').forEach((command) => {
        command.split('+').forEach((key) => {
          if(KEYS.indexOf(key) >= 0) {
            modifier = true;
          }
        });

        if(modifier) {
          keyboard.dispatchEventsForAction(command, this.field.element);
        } else {
          keyboard.dispatchEventsForInput(command, this.field.element);
        }
      });
    });
  }
}

class ExpectThatPasting extends FieldExpectationBase {
  constructor(text) {
    super();
    this.text = text;
  }

  perform() {
    this.paste();
  }

  paste() {
    var event = FakeEvent.pasteEventWithData({Text: this.text});
    this.field._paste(event);
  }
}


class ExpectThatLeaving extends FieldExpectationBase {
  constructor(field) {
    super();
    this.field = field;
  }

  perform() {
    this.field.element.focus();
    this.field.element.blur();
  }
}

export function expectThatTyping(...keys) {
  return new ExpectThatTyping(keys);
}

export function expectThatPasting(text) {
  return new ExpectThatPasting(text);
}

export function expectThatLeaving(field) {
  return new ExpectThatLeaving(field);
}
