import Keysim from './keysim';
const Keyboard = Keysim.Keyboard;
const Keystroke = Keysim.Keystroke;
const KeyEvents = Keysim.KeyEvents;

const DEFAULT_KEYBOARD = Keyboard.US_ENGLISH;

const keyboardWrapper = (type, keyboardFilter=false) => (title, fn) => {
  [
    {
      keyboard: Keyboard.US_ENGLISH,
      name: 'English',
      tag: ['desktop']
    },
    {
      keyboard: ANDROID_CHROME,
      name: 'Android',
      tag: ['mobile']
    }
  ]
  .filter(keyboard => {
    return !keyboardFilter ||
      keyboard.tag.indexOf(keyboardFilter) >= 0;
  })
  .forEach(testKeyboard => {
    type(`KEYBOARD-${testKeyboard.name} :: ${title}`, () => {
      beforeEach(() => window.keyboard = testKeyboard.keyboard );

      fn.call(this);

      afterEach(() => window.keyboard = DEFAULT_KEYBOARD);
    });
  });
};

window.testsWithAllKeyboards = keyboardWrapper(describe);
window.testsWithDesktopKeyboards = keyboardWrapper(describe, 'desktop');

const DEFAULT_UA = navigator.userAgent;

beforeEach(() => {
  navigator.__defineGetter__('userAgent', function(){
    return DEFAULT_UA;
  });
});

const SHIFT = 1 << 3;

const ANDROID_CHROME_CHARCODE_KEYCODE_MAP = {
  32:  new Keystroke(0,     32),  // <space>
  33:  new Keystroke(SHIFT, 33),  // !
  34:  new Keystroke(SHIFT, 34),  // "
  35:  new Keystroke(SHIFT, 35),  // #
  36:  new Keystroke(SHIFT, 36),  // $
  37:  new Keystroke(SHIFT, 37),  // %
  38:  new Keystroke(SHIFT, 38),  // &
  39:  new Keystroke(0,     39),  // '
  40:  new Keystroke(SHIFT, 40),  // (
  41:  new Keystroke(SHIFT, 41),  // )
  42:  new Keystroke(SHIFT, 42),  // *
  43:  new Keystroke(SHIFT, 43),  // +
  44:  new Keystroke(0,     44),  // ,
  45:  new Keystroke(0,     45),  // -
  46:  new Keystroke(0,     46),  // .
  47:  new Keystroke(0,     47),  // /
  48:  new Keystroke(0,     48),  // 0
  49:  new Keystroke(0,     49),  // 1
  50:  new Keystroke(0,     50),  // 2
  51:  new Keystroke(0,     51),  // 3
  52:  new Keystroke(0,     52),  // 4
  53:  new Keystroke(0,     53),  // 5
  54:  new Keystroke(0,     54),  // 6
  55:  new Keystroke(0,     55),  // 7
  56:  new Keystroke(0,     56),  // 8
  57:  new Keystroke(0,     57),  // 9
  58:  new Keystroke(SHIFT, 58),  // :
  59:  new Keystroke(0,     59),  // ;
  60:  new Keystroke(SHIFT, 60),  // <
  61:  new Keystroke(0,     61),  // =
  62:  new Keystroke(SHIFT, 62),  // >
  63:  new Keystroke(SHIFT, 63),  // ?
  64:  new Keystroke(SHIFT, 64),  // @
  65:  new Keystroke(SHIFT, 65),  // A
  66:  new Keystroke(SHIFT, 66),  // B
  67:  new Keystroke(SHIFT, 67),  // C
  68:  new Keystroke(SHIFT, 68),  // D
  69:  new Keystroke(SHIFT, 69),  // E
  70:  new Keystroke(SHIFT, 70),  // F
  71:  new Keystroke(SHIFT, 71),  // G
  72:  new Keystroke(SHIFT, 72),  // H
  73:  new Keystroke(SHIFT, 73),  // I
  74:  new Keystroke(SHIFT, 74),  // J
  75:  new Keystroke(SHIFT, 75),  // K
  76:  new Keystroke(SHIFT, 76),  // L
  77:  new Keystroke(SHIFT, 77),  // M
  78:  new Keystroke(SHIFT, 78),  // N
  79:  new Keystroke(SHIFT, 79),  // O
  80:  new Keystroke(SHIFT, 80),  // P
  81:  new Keystroke(SHIFT, 81),  // Q
  82:  new Keystroke(SHIFT, 82),  // R
  83:  new Keystroke(SHIFT, 83),  // S
  84:  new Keystroke(SHIFT, 84),  // T
  85:  new Keystroke(SHIFT, 85),  // U
  86:  new Keystroke(SHIFT, 86),  // V
  87:  new Keystroke(SHIFT, 87),  // W
  88:  new Keystroke(SHIFT, 88),  // X
  89:  new Keystroke(SHIFT, 89),  // Y
  90:  new Keystroke(SHIFT, 90),  // Z
  91:  new Keystroke(0,     219), // [
  92:  new Keystroke(0,     220), // \
  93:  new Keystroke(0,     221), // ]
  96:  new Keystroke(0,     192), // `
  97:  new Keystroke(0,     97),  // a
  98:  new Keystroke(0,     98),  // b
  99:  new Keystroke(0,     99),  // c
  100: new Keystroke(0,     100), // d
  101: new Keystroke(0,     101), // e
  102: new Keystroke(0,     102), // f
  103: new Keystroke(0,     103), // g
  104: new Keystroke(0,     104), // h
  105: new Keystroke(0,     105), // i
  106: new Keystroke(0,     106), // j
  107: new Keystroke(0,     107), // k
  108: new Keystroke(0,     108), // l
  109: new Keystroke(0,     109), // m
  110: new Keystroke(0,     110), // n
  111: new Keystroke(0,     111), // o
  112: new Keystroke(0,     112), // p
  113: new Keystroke(0,     113), // q
  114: new Keystroke(0,     114), // r
  115: new Keystroke(0,     115), // s
  116: new Keystroke(0,     116), // t
  117: new Keystroke(0,     117), // u
  118: new Keystroke(0,     118), // v
  119: new Keystroke(0,     119), // w
  120: new Keystroke(0,     120), // x
  121: new Keystroke(0,     121), // y
  122: new Keystroke(0,     122), // z
  123: new Keystroke(SHIFT, 123), // {
  124: new Keystroke(SHIFT, 124), // |
  125: new Keystroke(SHIFT, 125), // }
  126: new Keystroke(SHIFT, 126)  // ~
};

const ANDROID_CHROME_ACTION_KEYCODE_MAP = {
  BACKSPACE: 8,
  TAB:       9,
  ENTER:    13,
  SHIFT:    16,
  CTRL:     17,
  ALT:      18,
  PAUSE:    19,
  CAPSLOCK: 20,
  ESCAPE:   27,
  PAGEUP:   33,
  PAGEDOWN: 34,
  END:      35,
  HOME:     36,
  LEFT:     37,
  UP:       38,
  RIGHT:    39,
  DOWN:     40,
  INSERT:   45,
  DELETE:   46,
  META:     91,
  F1:      112,
  F2:      113,
  F3:      114,
  F4:      115,
  F5:      116,
  F6:      117,
  F7:      118,
  F8:      119,
  F9:      120,
  F10:     121,
  F11:     122,
  F12:     123
};

function replaceStringSelection(replacement, text, range) {
  var end = range.start + range.length;
  return text.substring(0, range.start) + replacement + text.substring(end);
}

/**
 * NOTE: Some Androids keyboards will always return 229
 * This keyboard also only produces the keyDown and
 * keyUp event. FieldKit uses what the browser enters in keyDown
 * to process with the formatter. So this keyboard needs to also
 * insert the character into the field.
 *
 * https://code.google.com/p/chromium/issues/detail?id=118639
 */
const ANDROID_CHROME = new Keyboard(
  ANDROID_CHROME_CHARCODE_KEYCODE_MAP,
  ANDROID_CHROME_ACTION_KEYCODE_MAP
);

const originalDispatch = ANDROID_CHROME.dispatchEventsForKeystroke;

ANDROID_CHROME.dispatchEventsForKeystroke = function(keystroke, target, mods=true) {
  if (!keystroke.modifiers && !mods) {
    const transitionModifiers = false;
    // Dispatch keyDown Events
    originalDispatch.call(this, new Keystroke(0, 229), target, transitionModifiers, KeyEvents.DOWN);

    const field = target['field-kit-text-field'];
    const currentSelectedRange = field.selectedRange();

    // Mock the browser inputting the character from keyDown
    field.element.value = replaceStringSelection(
      String.fromCharCode(keystroke.keyCode),
      field.text(),
      currentSelectedRange
    );
    field.setSelectedRange({ start: currentSelectedRange.start + 1, length: 0 });

    // Dispatch keyUp
    // This is where we do most of the processing for this type of Android Keyboard
    return originalDispatch.call(this, new Keystroke(0, 229), target, transitionModifiers, KeyEvents.UP);
  } else {
    if (keystroke.keyCode === 97) {
      keystroke.keyCode = 65;
    } else if (keystroke.keyCode === 122) {
      keystroke.keyCode = 90;
    }
    originalDispatch.call(this, keystroke, target, mods);
  }
};
