/* jshint esnext:true, unused:true, undef:true */

import Caret from './caret';

class WrappedFakeElements {
  constructor(elements) {
    this._elements = elements.slice();
    this._data = {};
    this._events = {};
  }

  caret(value) {
    if (!this._caret) {
      this._caret = new Caret(this._elements[0]);
      this._caret.start = 0;
      this._caret.end = 0;
    }

    if (value !== undefined) {
      if (typeof value.start !== 'number' || typeof value.end !== 'number') {
        throw new Error(
          'expected caret start and end to be numbers, got start=' + value.start +
          ' (' + typeof value.start + '), end=' + value.end + ' (' + typeof value.end + ')'
        );
      }

      this._caret.start = Math.max(value.start, 0);
      this._caret.end = Math.min(value.end, this.val().length);
    } else {
      return this._caret;
    }
  }

  data(key, value) {
    if (arguments.length === 1) {
      return this._data[key];
    } else {
      this._data[key] = value;
      return this;
    }
  }

  val(value) {
    if (value !== undefined) {
      this._elements[0].setAttribute('value', value);
      return this;
    } else {
      return this._elements[0].getAttribute('value');
    }
  }

  each(iterator) {
    for (var i = 0, l = this._elements.length; i < l; i++) {
      iterator.call(this._elements[i], i, this._elements[i]);
    }
    return this;
  }

  trigger(type, event) {
    type = type.split('.')[0];
    if (typeof event === 'undefined' || event === null) {
      event = {};
    }
    event.type = type;
    return this.each(function(_, element) {
      element.dispatchEvent(event);
    });
  }

  on(type, callback) {
    type = type.split('.')[0];
    return this.each(function(_, element) {
      element.addEventListener(type, callback);
    });
  }

  off(type, callback) {
    type = type.split('.')[0];
    return this.each(function(_, element) {
      element.removeEventListener(type, callback);
    });
  }

  get(index) {
    return this._elements[index];
  }

  attr(name, value) {
    if (arguments.length === 1) {
      return this._elements[0] && this._elements[0].getAttribute(name);
    } else {
      return this.each(function(_, element) {
        element.setAttribute(name, value);
      });
    }
  }

  blur() {
    return this._elements[0] && this._elements[0].blur();
  }

  focus() {
    return this._elements[0] && this._elements[0].focus();
  }

  select() {
    this._caret.start = 0;
    this._caret.end = this.val().length;
  }
}

export default WrappedFakeElements;
