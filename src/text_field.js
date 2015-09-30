import Formatter from './formatter';
import UndoManager from './undo_manager';
import { bind } from './utils';
import installCaret from './caret';
import { replaceStringSelection } from './utils';

const { getCaret, setCaret } = installCaret();

/**
 * Simulates input behavior.
 *
 * @external InputSim
 * @see https://github.com/iamJoeTaylor/input-sim
 */
import {Input, KEYS} from 'input-sim';

/**
 * TextField is the simplest input and the base for more complex
 * types to inherit.
 *
 * @extends external:InputSim.Input
 */
class TextField extends Input {
  /**
   * Sets up the initial properties of the TextField and
   * sets  up the event listeners
   *
   * @param {HTMLElement} element
   * @param {Formatter} formatter
   */
  constructor(element, formatter) {
    super();

    const caret = getCaret(element);
    if (typeof element.get === 'function') {
      console.warn(
        'DEPRECATION: FieldKit.TextField instances should no longer be ' +
        'created with a jQuery-wrapped element.'
      );
      element = element.get(0);
    }
    this.element = element;
    this._formatter = formatter;
    this._enabled = true;
    this._manualCaret = { start: 0, end: 0 };
    this._placeholder = null;
    this._disabledPlaceholder = null;
    this._focusedPlaceholder = null;
    this._unfocusedPlaceholder = null;
    this._isDirty = false;
    this._valueOnFocus = '';
    this._currentValue = '';
    // Make sure textDidChange fires while the value is correct
    this._needsKeyUpTextDidChangeTrigger = false;
    this._blur = bind(this._blur, this);
    this._focus = bind(this._focus, this);
    this._click = bind(this._click, this);
    this._paste = bind(this._paste, this);
    this._keyUp = bind(this._keyUp, this);
    this._keyPress = bind(this._keyPress, this);
    this._keyDown = bind(this._keyDown, this);
    if (element['field-kit-text-field']) {
      throw new Error('already attached a TextField to this element');
    } else {
      element['field-kit-text-field'] = this;
    }
    element.addEventListener('keydown', this._keyDown);
    element.addEventListener('keypress', this._keyPress);
    element.addEventListener('keyup', this._keyUp);
    element.addEventListener('click', this._click);
    element.addEventListener('paste', this._paste);
    element.addEventListener('focus', this._focus);
    element.addEventListener('blur', this._blur);

    if (!element.getAttribute('autocapitalize')) {
      element.setAttribute('autocapitalize', 'off');
    }

    const window = element.ownerDocument.defaultView;

    /**
     * Fixes caret bug (Android) that caused the input
     * to place inserted characters in the wrong place
     * Expected: 1234 5678|  =>  1234 5678 9|
     * Bug: 1234 5678|  =>  1234 5679| 8
     *
     * @private
     */
    this._needsManualCaret = window.navigator.userAgent.toLowerCase().indexOf('android') > -1;

    this.setText(element.value);

    this.setSelectedRange({
      start: caret.start,
      length: caret.end - caret.start
    });
  }


  /**
   * **** Public Events ****
   */

  /**
   * Called when the user has changed the text of the field. Can be used in
   * subclasses to perform actions suitable for this event.
   *
   * @private
   */
  textDidChange() {}

  /**
   * Called when the user has in some way declared that they are done editing,
   * such as leaving the field or perhaps pressing enter. Can be used in
   * subclasses to perform actions suitable for this event.
   *
   * @private
   */
  textFieldDidEndEditing() {}

  /**
   * Performs actions necessary for beginning editing.
   *
   * @private
   */
  textFieldDidBeginEditing() {}


  /**
   * **** Private Events ****
   */

  /**
   * Performs actions necessary for text change.
   *
   * @private
   */
  _textDidChange() {
    const delegate = this._delegate;
    this.textDidChange();
    if (delegate && typeof delegate.textDidChange === 'function') {
      delegate.textDidChange(this);
    }

    // manually fire the HTML5 input event
    this._fireEvent('input');
  }

  /**
   * Performs actions necessary for ending editing.
   *
   * @private
   */
  _textFieldDidEndEditing() {
    const delegate = this._delegate;
    this.textFieldDidEndEditing();
    if (delegate && typeof delegate.textFieldDidEndEditing === 'function') {
      delegate.textFieldDidEndEditing(this);
    }

    // manually fire the HTML5 change event, only when a change has been made since focus
    if (this._isDirty && (this._valueOnFocus !== this.element.value)) {
      this._fireEvent('change');
    }

    // reset the dirty property
    this._isDirty = false;
    this._valueOnFocus = '';
  }

  /**
   * Performs actions necessary for beginning editing.
   *
   * @private
   */
  _textFieldDidBeginEditing() {
    const delegate = this._delegate;
    this.textFieldDidBeginEditing();
    if (delegate && typeof delegate.textFieldDidBeginEditing === 'function') {
      delegate.textFieldDidBeginEditing(this);
    }
  }


  /**
   * **** Public Methods ****
   */

  /**
   * Gets the current delegate for this text field.
   *
   * @returns {TextFieldDelegate}
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
  }

  /**
   * Tears down FieldKit
   */
  destroy() {
    const element = this.element;
    element.removeEventListener('keydown', this._keyDown);
    element.removeEventListener('keypress', this._keyPress);
    element.removeEventListener('keyup', this._keyUp);
    element.removeEventListener('click', this._click);
    element.removeEventListener('paste', this._paste);
    element.removeEventListener('focus', this._focus);
    element.removeEventListener('blur', this._blur);
    delete element['field-kit-text-field'];
  }

  /**
   * Gets the current formatter. Formatters are used to translate between text
   * and value properties of the field.
   *
   * @returns {Formatter}
   */
  formatter() {
    if (!this._formatter) {
      this._formatter = new Formatter();
      const maximumLengthString = this.element.getAttribute('maxlength');
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
    const value = this.value();
    this._formatter = formatter;
    this.setValue(value);
  }

  /**
   * Builds a change instance and formats the change to see if it's valid
   *
   * @param   {object} current
   * @param   {object} proposed
   * @returns {?object} false if change doesn't have changes or change isn't valid. Change object if it is.
   */
  hasChangesAndIsValid(current, proposed) {
    const change = new TextFieldStateChange(this);
    const error = errorType => {
      const delegate = this.delegate();
      if (delegate) {
        if (typeof delegate.textFieldDidFailToValidateChange === 'function') {
          delegate.textFieldDidFailToValidateChange(this, change, errorType);
        }
      }
    };
    change.current = {text: current.text, selectedRange: current.selectedRange};
    change.proposed = {text: proposed.text, selectedRange: proposed.selectedRange};
    if (change.hasChanges() && this.formatter().isChangeValid(change, error)) {
      return change;
    }
    return null;
  }

  /**
   * Handles a key event could be trying to end editing.
   *
   */
  insertNewline() {
    this._textFieldDidEndEditing();
    this._didEndEditingButKeptFocus = true;
  }

  /**
   * Debug support
   *
   * @returns {string}
   */
  inspect() {
    return '#<TextField text="' + this.text() + '">';
  }

  /**
   * Replaces the current selection with text from the given pasteboard.
   *
   * @param {DataTransfer} pasteboard
   */
  readSelectionFromPasteboard(pasteboard) {
    let range, text;
    text = pasteboard.getData('Text');
    this.replaceSelection(text);
    range = this.selectedRange();
    range.start += range.length;
    range.length = 0;
    this.setSelectedRange(range);
  }

  /**
   * Checks changes after invoking the passed function for validity and rolls
   * them back if the changes turned out to be invalid.
   *
   * @returns {Object} whatever object `callback` returns
   */
  rollbackInvalidChanges(callback) {
    let result = null;
    let errorType = null;
    const change = TextFieldStateChange.build(this, () => result = callback());
    const error = function(type) { errorType = type; };
    if (change.hasChanges()) {
      const formatter = this.formatter();
      if (formatter && typeof formatter.isChangeValid === 'function') {
        if (!this._isDirty) {
          this._valueOnFocus = change.current.text || '';
          this._isDirty = true;
        }
        if (formatter.isChangeValid(change, error)) {
          change.recomputeDiff();
          this.setText(change.proposed.text);
          this.setSelectedRange(change.proposed.selectedRange);
        } else {
          const delegate = this.delegate();
          if (delegate) {
            if (typeof delegate.textFieldDidFailToValidateChange === 'function') {
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
   * Gets the object value. This is the value that should be considered the
   * 'real' value of the field.
   *
   * @returns {Object}
   */
  value() {
    const text = this.text();
    const delegate = this.delegate();
    const formatter = this.formatter();
    if (!formatter) { return text; }

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
    this.setText('' + value);
  }


  /**
   * **** InputSim Overrides ****
   */

  /**
   * Gets the formatted text value. This is the same as the value of the
   * underlying input element.
   *
   * @augments external:InputSim.Input#text
   * @returns {string}
   */
  text() {
    return this.element.value;
  }

  /**
   * Sets the formatted text value. This generally should not be used. Instead,
   * use the value setter.
   *
   * @augments external:InputSim.Input#setText
   * @param {string} text
   */
  setText(text) {
    this.element.value = text;
    this._currentValue = text;
  }

  /**
   * Gets the range of the current selection.
   *
   * @augments external:InputSim.Input#selectedRange
   * @returns {Object} {start: number, length: number}
   */
  selectedRange() {
    const caret = this._needsManualCaret ?
        this._manualCaret :
        getCaret(this.element);

    return {
      start: caret.start,
      length: caret.end - caret.start
    };
  }

  /**
   * Sets the range of the current selection and the selection affinity.
   *
   * @augments external:InputSim.Input#setSelectedRangeWithAffinity
   * @param {{start: number, length: number}} range
   * @param {Affinity} affinity
   */
  setSelectedRangeWithAffinity(range, affinity) {
    const newRange = super.setSelectedRangeWithAffinity(range, affinity);
    const caret = {
      start: newRange.start,
      end: newRange.start + newRange.length
    };
    this._manualCaret = caret;
    setCaret(this.element, caret.start, caret.end);
    this.selectionAffinity = range.length === 0 ? null : affinity;
  }


  /**
   * **** Undo Support ****
   */

  /**
   * Gets whether this text field records undo actions with its undo manager.
   *
   * @returns {boolean}
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
   * Gets the UndoManager for this text field.
   *
   * @returns {UndoManager}
   */
  undoManager() {
    return this._undoManager || (this._undoManager = new UndoManager());
  }


  /**
   * **** Enabled/disabled support *****
   */

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
   * Determines whether this field has focus.
   *
   * @returns {boolean} true if this field has focus
   */
  hasFocus() {
    return this.element.ownerDocument.activeElement === this.element;
  }

  /**
   * Determines whether this field is enabled or disabled.
   *
   * @returns {boolean} true if this field is enabled
   */
  isEnabled() {
    return this._enabled;
  }

  /**
   * Sets whether this text field is enabled
   * and syncs the placeholder to match
   *
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this._enabled = enabled;
    this._syncPlaceholder();
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
   * **** Placeholder support ****
   */

  /**
   * Gets the disabled placeholder if one
   * has been set.
   *
   * @returns {string}
   */
  disabledPlaceholder() {
    return this._disabledPlaceholder;
  }

  /**
   * Sets the disabled placeholder.
   *
   * @param {string} disabledPlaceholder
   */
  setDisabledPlaceholder(disabledPlaceholder) {
    this._disabledPlaceholder = disabledPlaceholder;
    this._syncPlaceholder();
  }

  /**
   * Gets the focused placeholder if one
   * has been set.
   *
   * @returns {string}
   */
  focusedPlaceholder() {
    return this._focusedPlaceholder;
  }

  /**
   * Sets the focused placeholder.
   *
   * @param {string} focusedPlaceholder
   */
  setFocusedPlaceholder(focusedPlaceholder) {
    this._focusedPlaceholder = focusedPlaceholder;
    this._syncPlaceholder();
  }

  /**
   * Gets the placeholder if one has
   * been set.
   *
   * @TODO Does this do anything?
   *
   * @returns {string}
   */
  placeholder() {
    return this._placeholder;
  }

  /**
   * Sets the placeholder.
   *
   * @param {string} placeholder
   */
  setPlaceholder(placeholder) {
    this._placeholder = placeholder;
    this.element.setAttribute('placeholder', this._placeholder);
  }

  /**
   * Gets the unfocused placeholder if one
   * has been set.
   *
   * @returns {string}
   */
  unfocusedPlaceholder() {
    return this._unfocusedPlaceholder;
  }

  /**
   * Sets the unfocused placeholder.
   *
   * @param {string} unfocusedPlaceholder
   */
  setUnfocusedPlaceholder(unfocusedPlaceholder) {
    this._unfocusedPlaceholder = unfocusedPlaceholder;
    this._syncPlaceholder();
  }


  /**
   * **** Private Methods ****
   */

  /**
   * Applies the given change as an undo/redo.
   *
   * @param {Object} change object with current and proposed properties
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
   * Handles clicks by resetting the selection affinity.
   *
   * @private
   */
  _click() {
    this._manualCaret = getCaret(this.element);
    this._selectedRange = {
      start: this._manualCaret.start,
      length: this._manualCaret.end - this._manualCaret.start
    };
    this.selectionAffinity = null;
  }

  /**
   * Fires event on the element
   *
   * @param {string} eventType
   * @private
   */
  _fireEvent(eventType) {
    const document = this.element.ownerDocument;
    const window = document.defaultView;
    if (typeof window.CustomEvent === 'function') {
      this.element.dispatchEvent(new window.CustomEvent(eventType, {}));
    } else {
      const event = document.createEvent('Event');
      event.initEvent(eventType, false, false);
      this.element.dispatchEvent(event);
    }
  }

  /**
   * Handles gaining focus. This method delegates to other methods, and syncs
   * the placeholder appropriately.
   *
   * @private
   */
  _focus() {
    this._textFieldDidBeginEditing();
    this._syncPlaceholder();
  }

  /**
   * Handles losing focus. This method delegates to other methods, and syncs the
   * placeholder appropriately.
   *
   * @private
   */
  _blur() {
    this._textFieldDidEndEditing();
    this._syncPlaceholder();
  }

  /**
   * Handles keyDown events. This method essentially just delegates to other,
   * more semantic, methods based on the modifier keys and the pressed key of the
   * event.
   *
   * @param {Event} event
   * @private
   */
  _keyDown(event) {
    if (this._didEndEditingButKeptFocus) {
      this._textFieldDidBeginEditing();
      this._didEndEditingButKeptFocus = false;
    }

    const action = this._bindings.actionForEvent(event);
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
   * Handles inserting characters based on the typed key for normal keyboards.
   *
   * NOTE: Does not fire on some versions of Android, in which case we handle
   * changes in _keyUp instead.
   *
   * @param {Event} event
   * @private
   */
  _keyPress(event) {
    const keyCode = event.keyCode;
    if (!event.metaKey && !event.ctrlKey &&
      keyCode !== KEYS.ENTER &&
      keyCode !== KEYS.TAB &&
      keyCode !== KEYS.BACKSPACE
    ) {
      if (event.charCode !== 0) {
        const newText = String.fromCharCode(event.charCode || event.keyCode);

        this._processChange({
          currentText: this.text(),
          proposedText: replaceStringSelection(newText, this.text(), this.selectedRange()),
          onSuccess: (change, changeTriggeredFormatting) => {
            if (!changeTriggeredFormatting && event instanceof KeyboardEvent) {
              // HACK(JoeTaylor) Use Browser's native input when using the formatter
              // would not make a difference https://code.google.com/p/chromium/issues/detail?id=32865
              if (!this._isDirty) {
                this._valueOnFocus = change.current.text || '';
                this._isDirty = true;
              }
              this.undoManager().proxyFor(this)._applyChangeFromUndoManager(change);
              this._manualCaret = {
                start: change.proposed.selectedRange.start,
                end: change.proposed.selectedRange.start + change.proposed.selectedRange.length
              };
              this._needsKeyUpTextDidChangeTrigger = true;
            } else {
              event.preventDefault();
              this.rollbackInvalidChanges(() => this.insertText(newText));
            }
            this._currentValue = change.proposed.text;
          },
          onFail: () => {
            event.preventDefault();
            this.rollbackInvalidChanges(() => this.insertText(newText));
          }
        });
      } else {
        event.preventDefault();
      }
    }
  }

  /**
   * Handles keyup events. On Some Android we need to do all input processing
   * here because no other information comes in.
   *
   * @param {Event} event
   * @private
   */
  _keyUp(event) {
    if (this._needsKeyUpTextDidChangeTrigger) {
      this._textDidChange();
      this._needsKeyUpTextDidChangeTrigger = false;
    }
    const keyCode = event.keyCode;
    // NOTE: Certain Androids on Chrome always return 229
    // https://code.google.com/p/chromium/issues/detail?id=118639
    if (keyCode === 229) {
      // Text has already been changed at this point, so we check the previous text
      // to determine whether we need to undo the change.
      const previousText = this._currentValue || '';
      this._processChange({
        currentText: previousText,
        proposedText: this.text(),
        onSuccess: (change, changeTriggeredFormatting) => {
          if (changeTriggeredFormatting) {
            const newText = change.proposed.text;
            this.setSelectedRange(change.proposed.selectedRange);
            this.setText(newText);
          }
          if (!this._isDirty) {
            this._valueOnFocus = change.current.text || '';
            this._isDirty = true;
          }
          this.undoManager().proxyFor(this)._applyChangeFromUndoManager(change);
          this._textDidChange();
          this._currentValue = change.proposed.text;
        },
        onFail: () => {
          // Need to rollback the letter input in the Keyup event because it is not valid,
          // so we set text to the previous state (as collected from the UndoManager).
          this.setText(previousText);
        }
      });
    } else {
      this.rollbackInvalidChanges(() => {
        if (event.keyCode === KEYS.TAB) {
          this.selectAll(event);
        }
      });
    }
  }

  /**
   * Checks if a change is valid and calls `onSuccess` if so,
   * and `onFail` if not.
   *
   * @param {object} options
   * @param {string} options.currentText
   * @param {string} options.proposedText
   * @param {function} options.onSuccess
   * @param {function=} options.onFail
   * @private
   */
  _processChange({currentText, proposedText, onSuccess, onFail=()=>{}}) {
    const current = {
      text: currentText,
      selectedRange: this.selectedRange()
    };
    const proposed = {
      text: proposedText,
      selectedRange: { start: current.selectedRange.start + 1, length: 0 }
    };
    const change = this.hasChangesAndIsValid(current, proposed);
    const changeTriggeredFormatting = change && (
        change.proposed.text !== proposed.text ||
        change.proposed.selectedRange.start !== proposed.selectedRange.start ||
        change.proposed.selectedRange.length !== proposed.selectedRange.length
      );

    if (change) {
      onSuccess(change, changeTriggeredFormatting);
    } else {
      onFail();
    }
  }


  /**
   * Handles paste events.
   *
   * @param {Event} event
   * @private
   */
  _paste(event) {
    event.preventDefault();
    this.rollbackInvalidChanges(() => {
      this.readSelectionFromPasteboard(event.clipboardData);
    });
  }

  /**
   * @private
   */
  _syncPlaceholder() {
    if (!this._enabled) {
      const disabledPlaceholder = this._disabledPlaceholder;
      if (disabledPlaceholder !== undefined && disabledPlaceholder !== null) {
        this.setPlaceholder(disabledPlaceholder);
      }
    } else if (this.hasFocus()) {
      const focusedPlaceholder = this._focusedPlaceholder;
      if (focusedPlaceholder !== undefined && focusedPlaceholder !== null) {
        this.setPlaceholder(focusedPlaceholder);
      }
    } else {
      const unfocusedPlaceholder = this._unfocusedPlaceholder;
      if (unfocusedPlaceholder !== undefined && unfocusedPlaceholder !== null) {
        this.setPlaceholder(unfocusedPlaceholder);
      }
    }
  }
}

/**
 * Helps calculate the changes after an event on a FieldKit.TextField.
 *
 * @private
 */
class TextFieldStateChange {
  /**
   * @param {TextField} field
   */
  constructor(field) {
    this.field = field;
  }

  /**
   * Determines whether this field has changes.
   *
   * @returns {boolean} true if either the current text doesn't match the proposed text
   *    or the current selection range doesn't match the proposed selection range
   */
  hasChanges() {
    this.recomputeDiff();
    return this.current.text !== this.proposed.text ||
      this.current.selectedRange.start !== this.proposed.selectedRange.start ||
      this.current.selectedRange.length !== this.proposed.selectedRange.length;
  }

  /**
   * Updates {TextFieldStateChange} inserted and {TextFieldStateChange} deleted
   * based on proposed and current
   */
  recomputeDiff() {
    if (this.proposed.text !== this.current.text) {
      const ctext = this.current.text;
      const ptext = this.proposed.text;
      let sharedPrefixLength = 0;
      let sharedSuffixLength = 0;
      let minTextLength = Math.min(ctext.length, ptext.length);
      let i;

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

      const inserted = {
        start: sharedPrefixLength,
        end: ptext.length - sharedSuffixLength
      };
      const deleted = {
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
  }
}

/**
 * Builds a new {TextFieldStateChange} that will allow you to
 * compute differences, and see the current vs proposed changes.
 *
 * @param {TextField} field
 * @param {Function} callback called when you want changes to the field
 *    take place. Current will be calculated before this callback.
 *    Proposed will be calculated after this callback.
 *
 * @returns {Object} change object with current and proposed properties
 */
TextFieldStateChange.build = function(field, callback) {
  const change = new this(field);
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
