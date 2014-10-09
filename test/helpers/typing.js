/* jshint esnext:true, unused:true, undef:true */

import FakeEvent from './fake_event';

class Type {
  constructor(keys) {
    this.keys = keys;
  }

  into(element) {
    if (!element.ownerDocument) {
      element = element.element;
    }
    this.element = element;
    this.element = element;
    this.perform();
    return this;
  }

  perform() {
    FakeEvent.eventsForKeys(this.keys).forEach(event => {
      event.type = 'keydown';
      if (shouldFireKeypress(this.element, !this.element.dispatchEvent(event))) {
        event.type = 'keypress';
        this.element.dispatchEvent(event);
      }
      event.type = 'keyup';
      this.element.dispatchEvent(event);
    });
  }
}

function shouldFireKeypress(element, keyDownEventPreventedDefault) {
  var document = element.ownerDocument;
  var window = document.defaultView;
  return !keyDownEventPreventedDefault ||
    window.navigator.FK_firesKeyPressWhenKeydownPrevented;
}

export function type(...keys) {
  return new Type(keys);
}
