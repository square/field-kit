/*! jshint esnext:true, undef:true, unused:true */

/** @private */
var A = 65;
/** @private */
var Y = 89;
/** @private */
var Z = 90;
/** @private */
var ZERO = 48;
/** @private */
var NINE = 57;
/** @private */
var LEFT = 37;
/** @private */
var RIGHT = 39;
/** @private */
var UP = 38;
/** @private */
var DOWN = 40;
/** @private */
var BACKSPACE = 8;
/** @private */
var DELETE = 46;
/** @private */
var TAB = 9;
/** @private */
var ENTER = 13;

/**
 * @namespace KEYS
 */
export var KEYS = {
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

  /**
   * @param {number} keyCode
   * @returns {boolean}
   */
  isDigit: function(keyCode) {
    return ZERO <= keyCode && keyCode <= NINE;
  },

  /**
   * Is an arrow keyCode.
   *
   * @param {number} keyCode
   * @returns {boolean}
   */
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
 * @returns {BindingSet} keybindings appropriate for the given platform.
 */
export function keyBindingsForPlatform(platform) {
  var osx = platform === 'OSX';
  var ctrl = osx ? META : CTRL;

  if (!cache[platform]) {
    cache[platform] = build(function(bind) {
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

function build(callback) {
  var result = new BindingSet();
  callback(function(...args) {
    return result.bind(...args);
  });
  return result;
}

/**
 * @private
 */
class BindingSet {
  constructor() {
    this.bindings = {};
  }

  /**
   * @param {number} keyCode
   * @param {number} modifiers
   * @param {string} action
   */
  bind(keyCode, modifiers, action) {
    if (!this.bindings[keyCode]) { this.bindings[keyCode] = {}; }
    this.bindings[keyCode][modifiers || 0] = action;
  }

  /**
   * @param {Event} event
   * @returns {?string}
   */
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
