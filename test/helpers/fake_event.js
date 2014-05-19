/* jshint esnext:true, unused:true, undef:true */

var KEYS = {
  A:         65,
  Z:         90,
  a:         97,
  z:        122,
  ZERO:      48,
  NINE:      57,
  LEFT:      37,
  RIGHT:     39,
  UP:        38,
  DOWN:      40,
  BACKSPACE:  8,
  DELETE:    46,
  ENTER:     13,
  TAB:        9,

  PRINTABLE_START: 32,
  PRINTABLE_END:  126
};

KEYS.CHARCODE_ZERO = [
  KEYS.LEFT,
  KEYS.RIGHT,
  KEYS.UP,
  KEYS.DOWN
];

var MODIFIERS = [
  'meta',
  'alt',
  'shift',
  'ctrl'
];

class FakeEvent {
  constructor() {
    this.keyCode = 0;
    this.altKey = false;
    this.shiftKey = false;
    this.metaKey = false;
    this.ctrlKey = false;
    this.type = null;
    this._defaultPrevented = false;
  }

  preventDefault() {
    this._defaultPrevented = true;
  }

  isDefaultPrevented() {
    return this._defaultPrevented;
  }

  isPrintable() {
    return !this.metaKey &&
      !this.ctrlKey &&
      this.keyCode >= KEYS.PRINTABLE_START &&
      this.keyCode <= KEYS.PRINTABLE_END;
  }

  get charCode() {
    if (KEYS.CHARCODE_ZERO.indexOf(this.keyCode) >= 0) {
      return 0;
    } else if (this.type === 'keypress' && this.isPrintable()) {
      return this._charCode;
    } else {
      return 0;
    }
  }

  set charCode(charCode) {
    this._charCode = charCode;
  }

  static eventsForKeys(keys) {
    var events = [];
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      var event = this.withKey(key);
      if (event) {
        events.push(event);
      } else {
        events.push(...this.eventsForKeys(key));
      }
    }
    return events;
  }

  static withKey(key) {
    var event = this.withSimpleKey(key);
    if (event) { return event; }

    // try to parse it as e.g. ctrl+shift+a
    var parts = key.split('+');
    key = parts.pop();
    var modifiers = parts;
    var modifiersAreReal = true;
    for (var i = 0, l = modifiers.length; i < l; i++) {
      var modifier = modifiers[i];
      if (MODIFIERS.indexOf(modifier) < 0) {
        modifiersAreReal = false;
        break;
      }
    }

    if (modifiersAreReal) {
      event = this.withSimpleKey(key);
    }

    // return early if we can't parse it
    if (!modifiersAreReal || !event) {
      return null;
    }

    modifiers.forEach(function(modifier) {
      event[modifier+'Key'] = true;
    });
    return event;
  }

  static withSimpleKey(key) {
    if (key.length === 1) {
      return this.withKeyCode(key.charCodeAt(0));
    } else if (key.toUpperCase() in KEYS) {
      return this.withKeyCode(KEYS[key.toUpperCase()]);
    }
  }

  static withKeyCode(keyCode) {
    var event = new this();
    var charCode = keyCode;

    // specially handle A-Z and a-z
    if (KEYS.A <= keyCode && keyCode <= KEYS.Z) {
      event.shiftKey = true;
    } else if (KEYS.a <= keyCode && keyCode <= KEYS.z) {
      keyCode -= KEYS.a - KEYS.A;
    }

    event.keyCode = keyCode;
    event.charCode = charCode;
    return event;
  }

  static pasteEventWithData(data) {
    var event = new this();
    event.clipboardData = new ClipboardData(data);
    return event;
  }

  // jQuery has an originalEvent property to get the real DOM event, but since
  // we're already faking it we might as well just use ourselves.
  get originalEvent() {
    return this;
  }
}

class ClipboardData {
  constructor(data) {
    this.data = data;
  }

  getData(type) {
    return this.data[type];
  }

  setData(type, value) {
    this.data[type] = value;
  }
}

export default FakeEvent;
