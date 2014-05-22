/* jshint esnext:true, undef:true, unused:true */

import Formatter from './formatter';
import UndoManager from './undo_manager';
import { KEYS, keyBindingsForPlatform } from './keybindings';
import { bind } from './utils';

var AFFINITY = {
  UPSTREAM: 0,
  DOWNSTREAM: 1,
  NONE: null
};

function isWordChar(chr) {
  return chr && /^\w$/.test(chr);
}

function hasLeftWordBreakAtIndex(text, index) {
  if (index === 0) {
    return true;
  } else {
    return !isWordChar(text[index - 1]) && isWordChar(text[index]);
  }
}

function hasRightWordBreakAtIndex(text, index) {
  if (index === text.length) {
    return true;
  } else {
    return isWordChar(text[index]) && !isWordChar(text[index + 1]);
  }
}

class TextField {
  constructor(element, formatter) {
    this.element = element;
    this._formatter = formatter;
    this._enabled = true;
    this._manualCaret = { start: 0, end: 0 };
    this._placeholder = null;
    this._disabledPlaceholder = null;
    this._focusedPlaceholder = null;
    this._unfocusedPlaceholder = null;
    this._focusout = bind(this._focusout, this);
    this._focusin = bind(this._focusin, this);
    this.click = bind(this.click, this);
    this.paste = bind(this.paste, this);
    this.keyUp = bind(this.keyUp, this);
    this.keyPress = bind(this.keyPress, this);
    this.keyDown = bind(this.keyDown, this);
    if (this.element.data('field-kit-text-field')) {
      throw new Error("already attached a TextField to this element");
    } else {
      this.element.data('field-kit-text-field', this);
    }
    this.element.on('keydown', this.keyDown);
    this.element.on('keypress', this.keyPress);
    this.element.on('keyup', this.keyUp);
    this.element.on('click', this.click);
    this.element.on('paste', this.paste);
    this.element.on('focusin', this._focusin);
    this.element.on('focusout', this._focusout);
    this._buildKeybindings();

    var window = this.element.get(0).ownerDocument.defaultView;

    /**
     * Fixes caret bug (Android) that caused the input
     * to place inserted characters in the wrong place
     * Expected: 1234 5678|  =>  1234 5678 9|
     * Bug: 1234 5678|  =>  1234 5679| 8
     */
    this._needsManualCaret = window.navigator.userAgent.toLowerCase().indexOf('android') > -1;

    /**
     * Contains one of the AFFINITY enum to indicate the preferred direction of
     * selection.
     *
     * @private
     */
    this.selectionAffinity = AFFINITY.NONE;
  }

  /**
   * Gets the current delegate for this text field.
   *
   * @return {TextFieldDelegate}
   */
  delegate() {
    return this._delegate;
  }

  /**
   * Sets the current delegate for this text field.
   *
   * @param {TextFieldDelegate} delegate
   */
  setDelegate(delegate) {
    this._delegate = delegate;
    return null;
  }

  destroy() {
    this.element.off('keydown', this.keyDown);
    this.element.off('keypress', this.keyPress);
    this.element.off('keyup', this.keyUp);
    this.element.off('click', this.click);
    this.element.off('paste', this.paste);
    this.element.off('focusin', this._focusin);
    this.element.off('focusout', this._focusout);
    this.element.data('field-kit-text-field', null);
    return null;
  }

  /**
   * Handles a key event that is trying to insert a character.
   */
  insertText(text) {
    var range;
    if (this.hasSelection()) {
      this.clearSelection();
    }
    this.replaceSelection(text);
    range = this.selectedRange();
    range.start += range.length;
    range.length = 0;
    return this.setSelectedRange(range);
  }

  insertNewline() {
    this._textFieldDidEndEditing();
    this._didEndEditingButKeptFocus = true;
  }

  /**
   * Performs actions necessary for text change.
   *
   * @private
   */
  _textDidChange() {
    var delegate = this._delegate;
    this.textDidChange();
    if (delegate && typeof delegate.textDidChange === 'function') {
      delegate.textDidChange(this);
    }
  }

  /**
   * Called when the user has changed the text of the field. Can be used in
   * subclasses to perform actions suitable for this event.
   */
  textDidChange() {}

  /**
   * Performs actions necessary for ending editing.
   *
   * @private
   */
  _textFieldDidEndEditing() {
    var delegate = this._delegate;
    this.textFieldDidEndEditing();
    if (delegate && typeof delegate.textFieldDidEndEditing === 'function') {
      delegate.textFieldDidEndEditing(this);
    }
  }

  /**
   * Called when the user has in some way declared that they are done editing,
   * such as leaving the field or perhaps pressing enter. Can be used in
   * subclasses to perform actions suitable for this event.
   *
   * @private
   */
  textFieldDidEndEditing() {}

  _textFieldDidBeginEditing() {
    var delegate = this._delegate;
    this.textFieldDidBeginEditing();
    if (delegate && typeof delegate.textFieldDidBeginEditing === 'function') {
      delegate.textFieldDidBeginEditing(this);
    }
  }

  /**
   * Performs actions necessary for beginning editing.
   *
   * @private
   */
  textFieldDidBeginEditing() {}

  /**
   * Moves the cursor up, which because this is a single-line text field, means
   * moving to the beginning of the value.
   *
   * Examples
   *
   *   Hey guys|
   *   moveUp(event)
   *   |Hey guys
   *
   *   Hey |guys|
   *   moveUp(event)
   *   |Hey guys
   *
   */
  moveUp(event) {
    event.preventDefault();
    this.setSelectedRange({
      start: 0,
      length: 0
    });
  }

  /**
   * Moves the cursor up to the beginning of the current paragraph, which because
   * this is a single-line text field, means moving to the beginning of the
   * value.
   *
   * Examples
   *
   *   Hey guys|
   *   moveToBeginningOfParagraph(event)
   *   |Hey guys
   *
   *   Hey |guys|
   *   moveToBeginningOfParagraph(event)
   *   |Hey guys
   *
   */
  moveToBeginningOfParagraph(event) {
    this.moveUp(event);
  }

  /**
   * Moves the cursor up, keeping the current anchor point and extending the
   * selection to the beginning as #moveUp would.
   *
   * Examples
   *
   *   # rightward selections are shrunk
   *   Hey guys, |where> are you?
   *   moveUpAndModifySelection(event)
   *   <Hey guys, |where are you?
   *
   *   # leftward selections are extended
   *   Hey guys, <where| are you?
   *   moveUpAndModifySelection(event)
   *   <Hey guys, where| are you?
   *
   *   # neutral selections are extended
   *   Hey guys, |where| are you?
   *   moveUpAndModifySelection(event)
   *   <Hey guys, where| are you?
   *
   */
  moveUpAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    switch (this.selectionAffinity) {
      case AFFINITY.UPSTREAM:
      case AFFINITY.NONE:
        // 12<34 56|78  =>  <1234 56|78
        range.length += range.start;
        range.start = 0;
        break;
      case AFFINITY.DOWNSTREAM:
        // 12|34 56>78   =>   <12|34 5678
        range.length = range.start;
        range.start = 0;
        break;
    }
    this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
  }

  /**
   * Moves the free end of the selection to the beginning of the paragraph, or
   * since this is a single-line text field to the beginning of the line.
   */
  moveParagraphBackwardAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    switch (this.selectionAffinity) {
      case AFFINITY.UPSTREAM:
      case AFFINITY.NONE:
        // 12<34 56|78  =>  <1234 56|78
        range.length += range.start;
        range.start = 0;
        break;
      case AFFINITY.DOWNSTREAM:
        // 12|34 56>78  =>  12|34 5678
        range.length = 0;
        break;
    }
    this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
  }

  /**
   * Moves the cursor to the beginning of the document.
   */
  moveToBeginningOfDocument(event) {
    // Since we only support a single line this is just an alias.
    this.moveToBeginningOfLine(event);
  }

  /**
   * Moves the selection start to the beginning of the document.
   */
  moveToBeginningOfDocumentAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    range.length += range.start;
    range.start = 0;
    return this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
  }

  /**
   * Moves the cursor down, which because this is a single-line text field, means
   * moving to the end of the value.
   *
   * Examples
   *
   *   Hey |guys
   *   moveDown(event)
   *   Hey guys|
   *
   *   |Hey| guys
   *   moveDown(event)
   *   Hey guys|
   */
  moveDown(event) {
    event.preventDefault();
    // 12|34 56|78  =>  1234 5678|
    var range = {
      start: this.text().length,
      length: 0
    };
    this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
  }

  /**
   * Moves the cursor up to the end of the current paragraph, which because this
   * is a single-line text field, means moving to the end of the value.
   *
   * Examples
   *
   *   |Hey guys
   *   moveToEndOfParagraph(event)
   *   Hey guys|
   *
   *   Hey |guys|
   *   moveToEndOfParagraph(event)
   *   Hey guys|
   *
   */
  moveToEndOfParagraph(event) {
    this.moveDown(event);
  }

  /**
   * Moves the cursor down, keeping the current anchor point and extending the
   * selection to the end as #moveDown would.
   *
   * Examples
   *
   *   # leftward selections are shrunk
   *   Hey guys, <where| are you?
   *   moveDownAndModifySelection(event)
   *   Hey guys, |where are you?>
   *
   *   # rightward selections are extended
   *   Hey guys, |where> are you?
   *   moveDownAndModifySelection(event)
   *   Hey guys, where| are you?>
   *
   *   # neutral selections are extended
   *   Hey guys, |where| are you?
   *   moveDownAndModifySelection(event)
   *   Hey guys, |where are you?>
   */
  moveDownAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    var end = this.text().length;
    if (this.selectionAffinity === AFFINITY.UPSTREAM) {
      range.start += range.length;
    }
    range.length = end - range.start;
    this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
  }

  /**
   * Moves the free end of the selection to the end of the paragraph, or since
   * this is a single-line text field to the end of the line.
   */
  moveParagraphForwardAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    switch (this.selectionAffinity) {
      case AFFINITY.DOWNSTREAM:
      case AFFINITY.NONE:
        // 12|34 56>78  =>  12|34 5678>
        range.length = this.text().length - range.start;
        break;
      case AFFINITY.UPSTREAM:
        // 12<34 56|78  =>  12|34 5678
        range.start += range.length;
        range.length = 0;
        break;
    }
    this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
  }

  /**
   * Moves the cursor to the end of the document.
   */
  moveToEndOfDocument(event) {
    // Since we only support a single line this is just an alias.
    this.moveToEndOfLine(event);
  }

  /**
   * Moves the selection end to the end of the document.
   */
  moveToEndOfDocumentAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    range.length = this.text().length - range.start;
    this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
  }

  /**
   * Moves the cursor to the left, counting selections as a thing to move past.
   *
   * Examples
   *
   *   # no selection just moves the cursor left
   *   Hey guys|
   *   moveLeft(event)
   *   Hey guy|s
   *
   *   # selections are removed
   *   Hey |guys|
   *   moveLeft(event)
   *   Hey |guys
   */
  moveLeft(event) {
    event.preventDefault();
    var range = this.selectedRange();
    if (range.length !== 0) {
      range.length = 0;
    } else {
      range.start--;
    }
    this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
  }

  /**
   * Moves the free end of the selection one to the left.
   *
   * Examples
   *
   *   # no selection just selects to the left
   *   Hey guys|
   *   moveLeftAndModifySelection(event)
   *   Hey guy<s|
   *
   *   # left selections are extended
   *   Hey <guys|
   *   moveLeftAndModifySelection(event)
   *   Hey< guys|
   *
   *   # right selections are shrunk
   *   Hey |guys>
   *   moveLeftAndModifySelection(event)
   *   Hey |guy>s
   *
   *   # neutral selections are extended
   *   Hey |guys|
   *   moveLeftAndModifySelection(event)
   *   Hey< guys|
   */
  moveLeftAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    switch (this.selectionAffinity) {
      case AFFINITY.UPSTREAM:
      case AFFINITY.NONE:
        this.selectionAffinity = AFFINITY.UPSTREAM;
        range.start--;
        range.length++;
        break;
      case AFFINITY.DOWNSTREAM:
        range.length--;
        break;
    }
    this.setSelectedRange(range);
  }

  /**
   * Moves the cursor left until the start of a word is found.
   *
   * Examples
   *
   *   # no selection just moves the cursor left
   *   Hey guys|
   *   moveWordLeft(event)
   *   Hey |guys
   *
   *   # selections are removed
   *   Hey |guys|
   *   moveWordLeft(event)
   *   |Hey guys
   */
  moveWordLeft(event) {
    event.preventDefault();
    var index = this.lastWordBreakBeforeIndex(this.selectedRange().start - 1);
    this.setSelectedRange({ start: index, length: 0 });
  }

  /**
   * Moves the free end of the current selection to the beginning of the previous
   * word.
   *
   * Examples
   *
   *   # no selection just selects to the left
   *   Hey guys|
   *   moveWordLeftAndModifySelection(event)
   *   Hey |guys|
   *
   *   # left selections are extended
   *   Hey <guys|
   *   moveWordLeftAndModifySelection(event)
   *   <Hey guys|
   *
   *   # right selections are shrunk
   *   |Hey guys>
   *   moveWordLeftAndModifySelection(event)
   *   |Hey >guys
   *
   *   # neutral selections are extended
   *   Hey |guys|
   *   moveWordLeftAndModifySelection(event)
   *   <Hey guys|
   */
  moveWordLeftAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    switch (this.selectionAffinity) {
      case AFFINITY.UPSTREAM:
      case AFFINITY.NONE:
        this.selectionAffinity = AFFINITY.UPSTREAM;
        var start = this.lastWordBreakBeforeIndex(range.start - 1);
        range.length += range.start - start;
        range.start = start;
        break;
      case AFFINITY.DOWNSTREAM:
        var end = this.lastWordBreakBeforeIndex(range.start + range.length);
        if (end < range.start) {
          end = range.start;
        }
        range.length -= range.start + range.length - end;
        break;
    }
    this.setSelectedRange(range);
  }

  /**
   * Moves the cursor to the beginning of the current line.
   *
   * Examples
   *
   *   Hey guys, where| are ya?
   *   moveToBeginningOfLine(event)
   *   |Hey guys, where are ya?
   */
  moveToBeginningOfLine(event) {
    event.preventDefault();
    this.setSelectedRange({ start: 0, length: 0 });
  }

  /**
   * Select from the free end of the selection to the beginning of line.
   *
   * Examples
   *
   *   Hey guys, where| are ya?
   *   moveToBeginningOfLineAndModifySelection(event)
   *   <Hey guys, where| are ya?
   *
   *   Hey guys, where| are> ya?
   *   moveToBeginningOfLineAndModifySelection(event)
   *   <Hey guys, where are| ya?
   */
  moveToBeginningOfLineAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    range.length += range.start;
    range.start = 0;
    this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
  }

  /**
   * Moves the cursor to the right, counting selections as a thing to move past.
   *
   * Examples
   *
   *   # no selection just moves the cursor right
   *   Hey guy|s
   *   moveRight(event)
   *   Hey guys|
   *
   *   # selections are removed
   *   Hey |guys|
   *   moveRight(event)
   *   Hey guys|
   */
  moveRight(event) {
    event.preventDefault();
    var range = this.selectedRange();
    if (range.length !== 0) {
      range.start += range.length;
      range.length = 0;
    } else {
      range.start++;
    }
    this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
  }

  /**
   * Moves the free end of the selection one to the right.
   *
   * Examples
   *
   *   # no selection just selects to the right
   *   Hey |guys
   *   moveRightAndModifySelection(event)
   *   Hey |g>uys
   *
   *   # right selections are extended
   *   Hey |gu>ys
   *   moveRightAndModifySelection(event)
   *   Hey |guy>s
   *
   *   # left selections are shrunk
   *   <Hey |guys
   *   moveRightAndModifySelection(event)
   *   H<ey |guys
   *
   *   # neutral selections are extended
   *   |Hey| guys
   *   moveRightAndModifySelection(event)
   *   |Hey >guys
   */
  moveRightAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    switch (this.selectionAffinity) {
      case AFFINITY.UPSTREAM:
        range.start++;
        range.length--;
        break;
      case AFFINITY.DOWNSTREAM:
      case AFFINITY.NONE:
        this.selectionAffinity = AFFINITY.DOWNSTREAM;
        range.length++;
        break;
    }
    this.setSelectedRange(range);
  }

  /**
   * Moves the cursor right until the end of a word is found.
   *
   * Examples
   *
   *   # no selection just moves the cursor right
   *   Hey| guys
   *   moveWordRight(event)
   *   Hey guys|
   *
   *   # selections are removed
   *   |Hey| guys
   *   moveWordRight(event)
   *   Hey guys|
   */
  moveWordRight(event) {
    event.preventDefault();
    var range = this.selectedRange();
    var index = this.nextWordBreakAfterIndex(range.start + range.length);
    this.setSelectedRange({ start: index, length: 0 });
  }

  /**
   * Moves the free end of the current selection to the next end of word.
   *
   * Examples
   *
   *   # no selection just selects to the right
   *   Hey |guys
   *   moveWordRightAndModifySelection(event)
   *   Hey |guys|
   *
   *   # right selections are extended
   *   Hey |g>uys
   *   moveWordRightAndModifySelection(event)
   *   Hey |guys>
   *
   *   # left selections are shrunk
   *   He<y |guys
   *   moveWordRightAndModifySelection(event)
   *   Hey< |guys
   *
   *   # neutral selections are extended
   *   He|y |guys
   *   moveWordRightAndModifySelection(event)
   *   He|y guys>
   */
  moveWordRightAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    var start = range.start;
    var end = range.start + range.length;
    switch (this.selectionAffinity) {
      case AFFINITY.UPSTREAM:
        start = Math.min(this.nextWordBreakAfterIndex(start), end);
        break;
      case AFFINITY.DOWNSTREAM:
      case AFFINITY.NONE:
        this.selectionAffinity = AFFINITY.DOWNSTREAM;
        end = this.nextWordBreakAfterIndex(range.start + range.length);
        break;
    }
    this.setSelectedRange({ start: start, length: end - start });
  }

  /**
   * Moves the cursor to the end of the current line.
   *
   * Examples
   *
   *   Hey guys, where| are ya?
   *   moveToEndOfLine(event)
   *   |Hey guys, where are ya?
   *
   */
  moveToEndOfLine(event) {
    event.preventDefault();
    this.setSelectedRange({ start: this.text().length, length: 0 });
  }

  /**
   * Moves the free end of the selection to the end of the current line.
   *
   * Examples
   *
   *   Hey guys, where| are ya?
   *   moveToEndOfLineAndModifySelection(event)
   *   Hey guys, where| are ya?>
   *
   *   Hey guys, <where| are ya?
   *   moveToEndOfLineAndModifySelection(event)
   *   Hey guys, |where are ya?>
   */
  moveToEndOfLineAndModifySelection(event) {
    event.preventDefault();
    var range = this.selectedRange();
    range.length = this.text().length - range.start;
    this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
  }

  /**
   * Deletes backward one character or clears a non-empty selection.
   *
   * Examples
   *
   *   |What's up, doc?
   *   deleteBackward(event)
   *   |What's up, doc?
   *
   *   What'|s up, doc?
   *   deleteBackward(event)
   *   What|s up, doc?
   *
   *   |What's| up, doc?
   *   deleteBackward(event)
   *   | up, doc?
   */
  deleteBackward(event) {
    event.preventDefault();
    var range = this.selectedRange();
    if (range.length === 0) {
      range.start--;
      range.length++;
      this.setSelectedRange(range);
    }
    this.clearSelection();
  }

  /**
   * Deletes backward one word or clears a non-empty selection.
   *
   * Examples
   *
   *   |What's up, doc?
   *   deleteWordBackward(event)
   *   |What's up, doc?
   *
   *   What'|s up, doc?
   *   deleteWordBackward(event)
   *   |s up, doc?
   *
   *   |What's| up, doc?
   *   deleteWordBackward(event)
   *   | up, doc?
   */
  deleteWordBackward(event) {
    if (this.hasSelection()) {
      this.deleteBackward(event);
    } else {
      event.preventDefault();
      var range = this.selectedRange();
      var start = this.lastWordBreakBeforeIndex(range.start);
      range.length += range.start - start;
      range.start = start;
      this.setSelectedRange(range);
      this.clearSelection();
    }
  }

  /**
   * Deletes backward one character, clears a non-empty selection, or decomposes
   * an accented character to its simple form.
   *
   * TODO: Make this work as described.
   *
   * Examples
   *
   *   |fiancée
   *   deleteBackwardByDecomposingPreviousCharacter(event)
   *   |What's up, doc?
   *
   *   fianc|é|e
   *   deleteBackwardByDecomposingPreviousCharacter(event)
   *   fianc|e
   *
   *   fiancé|e
   *   deleteBackwardByDecomposingPreviousCharacter(event)
   *   fiance|e
   */
  deleteBackwardByDecomposingPreviousCharacter(event) {
    this.deleteBackward(event);
  }

  /**
   * Deletes all characters before the cursor or clears a non-empty selection.
   *
   * Examples
   *
   *   The quick |brown fox.
   *   deleteBackwardToBeginningOfLine(event)
   *   |brown fox.
   *
   *   The |quick |brown fox.
   *   deleteBackwardToBeginningOfLine(event)
   *   The brown fox.
   */
  deleteBackwardToBeginningOfLine(event) {
    if (this.hasSelection()) {
      this.deleteBackward(event);
    } else {
      event.preventDefault();
      var range = this.selectedRange();
      range.length = range.start;
      range.start = 0;
      this.setSelectedRange(range);
      this.clearSelection();
    }
  }

  /**
   * Deletes forward one character or clears a non-empty selection.
   *
   * Examples
   *
   *   What's up, doc?|
   *   deleteForward(event)
   *   What's up, doc?|
   *
   *   What'|s up, doc?
   *   deleteForward(event)
   *   What'| up, doc?
   *
   *   |What's| up, doc?
   *   deleteForward(event)
   *   | up, doc?
   */
  deleteForward(event) {
    event.preventDefault();
    var range = this.selectedRange();
    if (range.length === 0) {
      range.length++;
      this.setSelectedRange(range);
    }
    return this.clearSelection();
  }

  /**
   * Deletes forward one word or clears a non-empty selection.
   *
   * Examples
   *
   *   What's up, doc?|
   *   deleteWordForward(event)
   *   What's up, doc?|
   *
   *   What's |up, doc?
   *   deleteWordForward(event)
   *   What's |, doc?
   *
   *   |What's| up, doc?
   *   deleteWordForward(event)
   *   | up, doc?
   */
  deleteWordForward(event) {
    if (this.hasSelection()) {
      return this.deleteForward(event);
    } else {
      event.preventDefault();
      var range = this.selectedRange();
      var end = this.nextWordBreakAfterIndex(range.start + range.length);
      this.setSelectedRange({
        start: range.start,
        length: end - range.start
      });
      this.clearSelection();
    }
  }

  /**
   * Handles the tab key.
   */
  insertTab() {}

  /**
   * Handles the back tab key.
   */
  insertBackTab() {}

  /**
   * Determines whether this field has any selection.
   *
   * @return {boolean} true if there is at least one character selected
   */
  hasSelection() {
    return this.selectedRange().length !== 0;
  }

  /**
   * Finds the start of the "word" before index.
   *
   * @private
   * @param {number} index position at which to start looking
   * @return {number} index in value less than or equal to the given index
   */
  lastWordBreakBeforeIndex(index) {
    var indexes = this.leftWordBreakIndexes();
    var result = indexes[0];
    for (var i = 0, l = indexes.length; i < l; i++) {
      var wordBreakIndex = indexes[i];
      if (index > wordBreakIndex) {
        result = wordBreakIndex;
      } else {
        break;
      }
    }
    return result;
  }

  /**
   * Find starts of "words" for navigational purposes.
   *
   * Examples
   *
   *   # given value of "123456789" and text of "123-45-6789"
   *   >> leftWordBreakIndexes()
   *   => [0, 3, 5]
   *
   * @private
   * @return {Array.<number>} indexes in value of word starts.
   */
  leftWordBreakIndexes() {
    var result = [];
    var text = this.text();
    for (var i = 0, l = text.length; i < l; i++) {
      if (hasLeftWordBreakAtIndex(text, i)) {
        result.push(i);
      }
    }
    return result;
  }

  /**
   * Finds the end of the "word" after index.
   *
   * @private
   * @param {number} index position in value at which to start looking.
   * @return {number}
   */
  nextWordBreakAfterIndex(index) {
    var indexes = this.rightWordBreakIndexes().reverse();
    var result = indexes[0];
    for (var i = 0, l = indexes.length; i < l; i++) {
      var wordBreakIndex = indexes[i];
      if (index < wordBreakIndex) {
        result = wordBreakIndex;
      } else {
        break;
      }
    }
    return result;
  }

  /**
   * Find ends of "words" for navigational purposes.
   *
   * Examples
   *
   *   # given value of "123456789" and text of "123-45-6789"
   *   >> rightWordBreakIndexes()
   *   => [3, 5, 9]
   *
   * @private
   * @return {Array.<number>}
   */
  rightWordBreakIndexes() {
    var result = [];
    var text = this.text();
    for (var i = 0, l = text.length; i <= l; i++) {
      if (hasRightWordBreakAtIndex(text, i)) {
        result.push(i + 1);
      }
    }
    return result;
  }

  /**
   * Clears all characters in the existing selection.
   *
   * Examples
   *
   *   12|34567|8
   *   clearSelection()
   *   12|8
   */
  clearSelection() {
    this.replaceSelection('');
  }

  /**
   * Replaces the characters within the selection with given text.
   *
   * Examples
   *
   *   12|34567|8
   *   replaceSelection("00")
   *   12|00|8
   */
  replaceSelection(replacement) {
    var range = this.selectedRange();
    var end = range.start + range.length;
    var text = this.text();
    text = text.substring(0, range.start) + replacement + text.substring(end);
    range.length = replacement.length;
    this.setText(text);
    this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
  }

  /**
   * Expands the selection to contain all the characters in the content.
   *
   * Examples
   *
   *   123|45678
   *   selectAll(event)
   *   |12345678|
   */
  selectAll(event) {
    event.preventDefault();
    this.setSelectedRangeWithAffinity({
      start: 0,
      length: this.text().length
    }, AFFINITY.NONE);
  }

  /**
   * Replaces the current selection with text from the given pasteboard.
   *
   * @param {ClipboardData} pasteboard
   */
  readSelectionFromPasteboard(pasteboard) {
    var range, text;
    text = pasteboard.getData('Text');
    this.replaceSelection(text);
    range = this.selectedRange();
    range.start += range.length;
    range.length = 0;
    this.setSelectedRange(range);
  }

  /**
   * Handles keyDown events. This method essentially just delegates to other,
   * more semantic, methods based on the modifier keys and the pressed key of the
   * event.
   *
   * @private
   */
  keyDown(event) {
    if (this._didEndEditingButKeptFocus) {
      this._textFieldDidBeginEditing();
      this._didEndEditingButKeptFocus = false;
    }

    var action = this._bindings.actionForEvent(event);
    if (action) {
      switch (action) {
        case 'undo':
        case 'redo':
          this[action](event);
          break;

        default:
          this.rollbackInvalidChanges(() => this[action](event));
          break;
      }
    }
  }

  /**
   * Handles inserting characters based on the typed key.
   *
   * @private
   */
  keyPress(event) {
    var keyCode = event.keyCode;
    if (!event.metaKey && !event.ctrlKey &&
        keyCode !== KEYS.ENTER &&
        keyCode !== KEYS.TAB &&
        keyCode !== KEYS.BACKSPACE) {
      event.preventDefault();
      if (event.charCode !== 0) {
        var charCode = event.charCode || event.keyCode;
        this.rollbackInvalidChanges(() => this.insertText(String.fromCharCode(charCode)));
      }
    }
  }

  /**
   * Handles keyup events.
   *
   * @private
   */
  keyUp(event) {
    this.rollbackInvalidChanges(() => {
      if (event.keyCode === KEYS.TAB) {
        this.selectAll(event);
      }
    });
  }

  /**
   * Handles paste events.
   *
   * @private
   */
  paste(event) {
    event.preventDefault();
    this.rollbackInvalidChanges(() => {
      this.readSelectionFromPasteboard(event.originalEvent.clipboardData);
    });
  }

  /**
   * Checks changes after invoking the passed function for validity and rolls
   * them back if the changes turned out to be invalid.
   *
   * @return {object} whatever object `callback` returns
   */
  rollbackInvalidChanges(callback) {
    var result = null;
    var errorType = null;
    var change = TextFieldStateChange.build(this, function() {
      result = callback();
    });
    var error = function(type) { errorType = type; };
    if (change.hasChanges()) {
      var formatter = this.formatter();
      if (formatter && typeof formatter.isChangeValid === 'function') {
        if (formatter.isChangeValid(change, error)) {
          change.recomputeDiff();
          this.setText(change.proposed.text);
          this.setSelectedRange(change.proposed.selectedRange);
        } else {
          var delegate = this.delegate();
          if (delegate) {
            if (typeof delegate.textFieldDidFailToValidateChange === "function") {
              delegate.textFieldDidFailToValidateChange(this, change, errorType);
            }
          }
          this.setText(change.current.text);
          this.setSelectedRange(change.current.selectedRange);
          return result;
        }
      }
      if (change.inserted.text.length || change.deleted.text.length) {
        this.undoManager().proxyFor(this)._applyChangeFromUndoManager(change);
        this._textDidChange();
      }
    }
    return result;
  }

  /**
   * Handles clicks by resetting the selection affinity.
   *
   * @private
   */
  click() {
    if (this._needsManualCaret) {
      this._manualCaret = this.element.caret();
    }
    this.selectionAffinity = AFFINITY.NONE;
  }

  on() {
    this.element.on.apply(this.element, arguments);
  }

  off() {
    this.element.off.apply(this.element, arguments);
  }

  /**
   * Gets the formatted text value. This is the same as the value of the
   * underlying input element.
   *
   * @return {string}
   */
  text() {
    return this.element.val();
  }

  /**
   * Sets the formatted text value. This generally should not be used. Instead,
   * use the value setter.
   *
   * @param {string} text
   */
  setText(text) {
    this.element.val(text);
  }

  /**
   * Gets the object value. This is the value that should be considered the
   * "real" value of the field.
   *
   * @return {object}
   */
  value() {
    var text = this.text();
    var delegate = this.delegate();
    var formatter = this.formatter();
    if (!formatter) { return value; }

    return formatter.parse(text, (errorType) => {
      if (delegate) {
        if (typeof delegate.textFieldDidFailToParseString === 'function') {
          delegate.textFieldDidFailToParseString(this, text, errorType);
        }
      }
    });
  }

  /**
   * Sets the object value of the field.
   *
   * @param {string} value
   */
  setValue(value) {
    if (this._formatter) {
      value = this._formatter.format(value);
    }
    this.setText("" + value);
    return this.element.trigger('change');
  }

  /**
   * Gets the current formatter. Formatters are used to translate between #text
   * and #value properties of the field.
   *
   * @return {Formatter}
   */
  formatter() {
    if (!this._formatter) {
      this._formatter = new Formatter();
      var maximumLengthString = this.element.attr('maxlength');
      if (maximumLengthString !== undefined && maximumLengthString !== null) {
        this._formatter.maximumLength = parseInt(maximumLengthString, 10);
      }
    }

    return this._formatter;
  }

  /**
   * Sets the current formatter.
   *
   * @param {Formatter} formatter
   */
  setFormatter(formatter) {
    var value = this.value();
    this._formatter = formatter;
    this.setValue(value);
  }

  /**
   * Gets the range of the current selection.
   *
   * @return {{start: number, length: number}}
   */
  selectedRange() {
    var caret = this._needsManualCaret ?
      caret = this._manualCaret :
      caret = this.element.caret();

    return {
      start: caret.start,
      length: caret.end - caret.start
    };
  }

  /**
   * Sets the range of the current selection without changing the affinity.
   *
   * @return {{start: number, length: number}}
   */
  setSelectedRange(range) {
    return this.setSelectedRangeWithAffinity(range, this.selectionAffinity);
  }

  /**
   * Sets the range of the current selection and the selection affinity.
   *
   * @param {{start: number, length: number}} range
   * @param {AFFINITY} affinity
   */
  setSelectedRangeWithAffinity(range, affinity) {
    var min = 0;
    var max = this.text().length;
    var caret = {
      start: Math.max(min, Math.min(max, range.start)),
      end: Math.max(min, Math.min(max, range.start + range.length))
    };
    this._manualCaret = caret;
    this.element.caret(caret);
    this.selectionAffinity = range.length === 0 ? AFFINITY.NONE : affinity;
  }

  /**
   * Gets the position of the current selection's anchor point, i.e. the point
   * that the selection extends from, if any.
   *
   * @return {number}
   */
  selectionAnchor() {
    var range = this.selectedRange();
    switch (this.selectionAffinity) {
      case AFFINITY.UPSTREAM:
        return range.start + range.length;
      case AFFINITY.DOWNSTREAM:
        return range.start;
      default:
        return null;
    }
  }

  /**
   * Undo Support
   */

  /**
   * Triggers an undo in the underlying UndoManager, if applicable.
   *
   * @param {Event} event
   */
  undo(event) {
    if (this.undoManager().canUndo()) {
      this.undoManager().undo();
    }
    event.preventDefault();
  }

  /**
   * Triggers a redo in the underlying UndoManager, if applicable.
   *
   * @param {Event} event
   */
  redo(event) {
    if (this.undoManager().canRedo()) {
      this.undoManager().redo();
    }
    event.preventDefault();
  }

  /**
   * Gets the UndoManager for this text field.
   *
   * @return {UndoManager}
   */
  undoManager() {
    return this._undoManager || (this._undoManager = new UndoManager());
  }

  /**
   * Gets whether this text field records undo actions with its undo manager.
   *
   * @return {boolean}
   */
  allowsUndo() {
    return this._allowsUndo;
  }

  /**
   * Sets whether this text field records undo actions with its undo manager.
   *
   * @param {boolean} allowsUndo
   */
  setAllowsUndo(allowsUndo) {
    this._allowsUndo = allowsUndo;
  }

  /**
   * Applies the given change as an undo/redo.
   *
   * @private
   */
  _applyChangeFromUndoManager(change) {
    this.undoManager().proxyFor(this)._applyChangeFromUndoManager(change);

    if (this.undoManager().isUndoing()) {
      this.setText(change.current.text);
      this.setSelectedRange(change.current.selectedRange);
    } else {
      this.setText(change.proposed.text);
      this.setSelectedRange(change.proposed.selectedRange);
    }

    this._textDidChange();
  }

  /**
   * Enabled/disabled support
   */

  isEnabled() {
    return this._enabled;
  }

  setEnabled(enabled) {
    this._enabled = enabled;
    this._syncPlaceholder();
  }

  hasFocus() {
    return this.element.get(0).ownerDocument.activeElement === this.element.get(0);
  }

  _focusin() {
    this._textFieldDidBeginEditing();
    return this._syncPlaceholder();
  }

  _focusout() {
    this._textFieldDidEndEditing();
    return this._syncPlaceholder();
  }

  /**
   * Removes focus from this field if it has focus.
   */
  becomeFirstResponder() {
    this.element.focus();
    this.rollbackInvalidChanges(() => {
      this.element.select();
      this._syncPlaceholder();
    });
  }

  /**
   * Removes focus from this field if it has focus.
   *
   * @param {Event} event
   */
  resignFirstResponder(event) {
    if (event !== undefined && event !== null) {
      event.preventDefault();
    }
    this.element.blur();
    this._syncPlaceholder();
  }

  /*
   * Placeholder support
   */

  disabledPlaceholder() {
    return this._disabledPlaceholder;
  }

  setDisabledPlaceholder(_disabledPlaceholder) {
    this._disabledPlaceholder = _disabledPlaceholder;
    this._syncPlaceholder();
  }

  focusedPlaceholder() {
    return this._focusedPlaceholder;
  }

  setFocusedPlaceholder(_focusedPlaceholder) {
    this._focusedPlaceholder = _focusedPlaceholder;
    this._syncPlaceholder();
  }

  unfocusedPlaceholder() {
    return this._unfocusedPlaceholder;
  }

  setUnfocusedPlaceholder(_unfocusedPlaceholder) {
    this._unfocusedPlaceholder = _unfocusedPlaceholder;
    this._syncPlaceholder();
  }

  placeholder() {
    return this._placeholder;
  }

  setPlaceholder(_placeholder) {
    this._placeholder = _placeholder;
    this.element.attr('placeholder', this._placeholder);
  }

  _syncPlaceholder() {
    if (!this._enabled) {
      var disabledPlaceholder = this._disabledPlaceholder;
      if (disabledPlaceholder !== undefined && disabledPlaceholder !== null) {
        this.setPlaceholder(disabledPlaceholder);
      }
    } else if (this.hasFocus()) {
      var focusedPlaceholder = this._focusedPlaceholder;
      if (focusedPlaceholder !== undefined && focusedPlaceholder !== null) {
        this.setPlaceholder(focusedPlaceholder);
      }
    } else {
      var unfocusedPlaceholder = this._unfocusedPlaceholder;
      if (unfocusedPlaceholder !== undefined && unfocusedPlaceholder !== null) {
        this.setPlaceholder(unfocusedPlaceholder);
      }
    }
  }

  /**
   * Keybindings
   */

  _buildKeybindings() {
    var doc = this.element.get(0).ownerDocument;
    var win = doc.defaultView || doc.parentWindow;
    var userAgent = win.navigator.userAgent;
    var osx = /^Mozilla\/[\d\.]+ \(Macintosh/.test(userAgent);
    this._bindings = keyBindingsForPlatform(osx ? 'OSX' : 'Default');
  }

  /**
   * Debug support
   */

  inspect() {
    return '#<TextField text="' + this.text() + '">';
  }
}

class TextFieldStateChange {
  constructor(field) {
    this.field = field;
  }

  hasChanges() {
    this.recomputeDiff();
    return this.current.text !== this.proposed.text ||
      this.current.selectedRange.start !== this.proposed.selectedRange.start ||
      this.current.selectedRange.length !== this.proposed.selectedRange.length;
  }

  recomputeDiff() {
    if (this.proposed.text !== this.current.text) {
      var ctext = this.current.text;
      var ptext = this.proposed.text;
      var sharedPrefixLength = 0;
      var sharedSuffixLength = 0;
      var minTextLength = Math.min(ctext.length, ptext.length);
      var i;

      for (i = 0; i < minTextLength; i++) {
        if (ptext[i] === ctext[i]) {
          sharedPrefixLength = i + 1;
        } else {
          break;
        }
      }

      for (i = 0; i < minTextLength - sharedPrefixLength; i++) {
        if (ptext[ptext.length - 1 - i] === ctext[ctext.length - 1 - i]) {
          sharedSuffixLength = i + 1;
        } else {
          break;
        }
      }

      var inserted = {
        start: sharedPrefixLength,
        end: ptext.length - sharedSuffixLength
      };
      var deleted = {
        start: sharedPrefixLength,
        end: ctext.length - sharedSuffixLength
      };
      inserted.text = ptext.substring(inserted.start, inserted.end);
      deleted.text = ctext.substring(deleted.start, deleted.end);
      this.inserted = inserted;
      this.deleted = deleted;
    } else {
      this.inserted = {
        start: this.proposed.selectedRange.start,
        end: this.proposed.selectedRange.start + this.proposed.selectedRange.length,
        text: ''
      };
      this.deleted = {
        start: this.current.selectedRange.start,
        end: this.current.selectedRange.start + this.current.selectedRange.length,
        text: ''
      };
    }
    return null;
  }
}

TextFieldStateChange.build = function(field, callback) {
  var change = new this(field);
  change.current = {
    text: field.text(),
    selectedRange: field.selectedRange()
  };
  callback();
  change.proposed = {
    text: field.text(),
    selectedRange: field.selectedRange()
  };
  change.recomputeDiff();
  return change;
};

export default TextField;
