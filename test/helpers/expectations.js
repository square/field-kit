/* jshint esnext:true, unused:true, undef:true */
/* global expect */

import FakeEvent from './fake_event';
import Selection from './selection';
import TextField from '../../lib/text_field';
import { buildInput } from './builders';
import { type } from './typing';
import Caret from '../../lib/caret';

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
    this.assert();
    return this;
  }

  withError(errorType) {
    expect(this.actualErrorType).to.equal(errorType);
  }

  onOSX() {
    return this.withUserAgent('osx.chrome.latest');
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
    this.field.element.value = value;
    Caret.set(this.field.element, caret.start, caret.end);
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
        caret: Caret.get(this.field.element),
        affinity: this.field.selectionAffinity,
        value: this.field.element.value
      });

    expect(actual).to.equal(this.expectedDescription);
  }

  get field() {
    if (!this._field) {
      var input = buildInput();
      if (this.userAgent) {
        input.ownerDocument.defaultView.navigator.userAgent = this.userAgent;
      }
      this._field = new TextField(input);
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
    type(...this.keys).into(this.field);
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
    this.field.paste(event);
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
