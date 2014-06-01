/* jshint esnext:true, unused:true, undef:true */

import FakeElement from './fake_element';

class FakeInput extends FakeElement {
  constructor(ownerDocument, type) {
    super(ownerDocument, 'input');
    this._selectionStart = 0;
    this._selectionEnd = 0;
    this.type = type || 'text';
    this.value = '';
    this.selfClosing = true;
  }

  get value() {
    return this.getAttribute('value');
  }

  set value(value) {
    this.setAttribute('value', value);
  }

  get type() {
    return this.getAttribute('type');
  }

  set type(type) {
    this.setAttribute('type', type);
  }

  get selectionStart() {
    return this._selectionStart;
  }

  set selectionStart(selectionStart) {
    if (selectionStart < 0) {
      selectionStart = 0;
    }
    if (selectionStart > this.value.length) {
      selectionStart = this.value.length;
    }
    this._selectionStart = selectionStart;
  }

  get selectionEnd() {
    return this._selectionEnd;
  }

  set selectionEnd(selectionEnd) {
    if (selectionEnd < 0) {
      selectionEnd = 0;
    }
    if (selectionEnd > this.value.length) {
      selectionEnd = this.value.length;
    }
    this._selectionEnd = selectionEnd;
  }

  select() {
    this.selectionStart = 0;
    this.selectionEnd = this.value.length;
  }
}

export default FakeInput;
