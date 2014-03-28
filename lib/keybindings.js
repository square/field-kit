/* jshint esnext:true */

var A = 65;
var Y = 89;
var Z = 90;
var ZERO = 48;
var NINE = 57;
var LEFT = 37;
var RIGHT = 39;
var UP = 38;
var DOWN = 40;
var BACKSPACE = 8;
var DELETE = 46;
var TAB = 9;
var ENTER = 13;

var KEYS = {
  A: A,
  Y: Y,
  Z: Z,
  ZERO: ZERO,
  NINE: NINE,
  LEFT: LEFT,
  RIGHT: RIGHT,
  UP: UP,
  DOWN: DOWN,
  BACKSPACE: BACKSPACE,
  DELETE: DELETE,
  TAB: TAB,
  ENTER: ENTER,

  isDigit: function(keyCode) {
    return ZERO <= keyCode && keyCode <= NINE;
  },

  isDirectional: function(keyCode) {
    return keyCode === LEFT || keyCode === RIGHT || keyCode === UP || keyCode === DOWN;
  }
};

var CTRL  = 1 << 0;
var META  = 1 << 1;
var ALT   = 1 << 2;
var SHIFT = 1 << 3;


var cache = {};

/**
 * Builds a BindingSet based on the current platform.
 *
 * @param {string} platform A string name of a platform (e.g. "OSX").
 *
 * @return {BindingSet} keybindings appropriate for the given platform.
 */
function keyBindingsForPlatform(platform) {
  var osx = platform === 'OSX';
  var ctrl = osx ? META : CTRL;

  if (!cache[platform]) {
    cache[platform] = build(platform, function(bind) {
      bind(A         , ctrl       , 'selectAll');
      bind(LEFT      , null       , 'moveLeft');
      bind(LEFT      , ALT        , 'moveWordLeft');
      bind(LEFT      , SHIFT      , 'moveLeftAndModifySelection');
      bind(LEFT      , ALT|SHIFT  , 'moveWordLeftAndModifySelection');
      bind(RIGHT     , null       , 'moveRight');
      bind(RIGHT     , ALT        , 'moveWordRight');
      bind(RIGHT     , SHIFT      , 'moveRightAndModifySelection');
      bind(RIGHT     , ALT|SHIFT  , 'moveWordRightAndModifySelection');
      bind(UP        , null       , 'moveUp');
      bind(UP        , ALT        , 'moveToBeginningOfParagraph');
      bind(UP        , SHIFT      , 'moveUpAndModifySelection');
      bind(UP        , ALT|SHIFT  , 'moveParagraphBackwardAndModifySelection');
      bind(DOWN      , null       , 'moveDown');
      bind(DOWN      , ALT        , 'moveToEndOfParagraph');
      bind(DOWN      , SHIFT      , 'moveDownAndModifySelection');
      bind(DOWN      , ALT|SHIFT  , 'moveParagraphForwardAndModifySelection');
      bind(BACKSPACE , null       , 'deleteBackward');
      bind(BACKSPACE , SHIFT      , 'deleteBackward');
      bind(BACKSPACE , ALT        , 'deleteWordBackward');
      bind(BACKSPACE , ALT|SHIFT  , 'deleteWordBackward');
      bind(BACKSPACE , ctrl       , 'deleteBackwardToBeginningOfLine');
      bind(BACKSPACE , ctrl|SHIFT , 'deleteBackwardToBeginningOfLine');
      bind(DELETE    , null       , 'deleteForward');
      bind(DELETE    , ALT        , 'deleteWordForward');
      bind(TAB       , null       , 'insertTab');
      bind(TAB       , SHIFT      , 'insertBackTab');
      bind(ENTER     , null       , 'insertNewline');
      bind(Z         , ctrl       , 'undo');

      if (osx) {
        bind(LEFT      , META       , 'moveToBeginningOfLine');
        bind(LEFT      , META|SHIFT , 'moveToBeginningOfLineAndModifySelection');
        bind(RIGHT     , META       , 'moveToEndOfLine');
        bind(RIGHT     , META|SHIFT , 'moveToEndOfLineAndModifySelection');
        bind(UP        , META       , 'moveToBeginningOfDocument');
        bind(UP        , META|SHIFT , 'moveToBeginningOfDocumentAndModifySelection');
        bind(DOWN      , META       , 'moveToEndOfDocument');
        bind(DOWN      , META|SHIFT , 'moveToEndOfDocumentAndModifySelection');
        bind(BACKSPACE , CTRL       , 'deleteBackwardByDecomposingPreviousCharacter');
        bind(BACKSPACE , CTRL|SHIFT , 'deleteBackwardByDecomposingPreviousCharacter');
        bind(Z         , META|SHIFT , 'redo');
      } else {
        bind(Y         , CTRL       , 'redo');
      }
    });
  }

  return cache[platform];
}

function build(platform, callback) {
  var result = new BindingSet(platform);
  callback(function() {
    return result.bind.apply(result, arguments);
  });
  return result;
}

class BindingSet {
  constructor(platform) {
    this.platform = platform;
    this.bindings = {};
  }

  bind(keyCode, modifiers, action) {
    if (!this.bindings[keyCode]) { this.bindings[keyCode] = {}; }
    this.bindings[keyCode][modifiers || 0] = action;
  }

  actionForEvent(event) {
    var bindingsForKeyCode = this.bindings[event.keyCode];
    if (bindingsForKeyCode) {
      var modifiers = 0;
      if (event.altKey) { modifiers |= ALT; }
      if (event.ctrlKey) { modifiers |= CTRL; }
      if (event.metaKey) { modifiers |= META; }
      if (event.shiftKey) { modifiers |= SHIFT; }
      return bindingsForKeyCode[modifiers];
    }
  }
}

module.exports = {
  KEYS: KEYS,
  keyBindingsForPlatform: keyBindingsForPlatform
};
