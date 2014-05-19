/* jshint esnext:true, unused:true, undef:true */

import FakeEvent from './fake_event';
import WrappedFakeElements from './wrapped_fake_elements';

class Type {
  constructor(keys) {
    this.keys = keys;
  }

  into(element) {
    if (element.element instanceof WrappedFakeElements) {
      element = element.element;
    }
    this.element = element;
    this.perform();
    return this;
  }

  perform() {
    FakeEvent.eventsForKeys(this.keys).forEach(event => {
      this.element.trigger('keydown', event);
      if (shouldFireKeypress(this.element, event)) {
        event.type = 'keypress';
        this.element.trigger('keypress', event);
      }
      this.element.trigger('keyup', event);
    });
  }
}

function shouldFireKeypress(element, keyDownEvent) {
  var document = element.get(0).ownerDocument;
  var window = document.defaultView;
  return !keyDownEvent.isDefaultPrevented() ||
    window.navigator.FK_firesKeyPressWhenKeydownPrevented;
}

export function type(...keys) {
  return new Type(keys);
}
