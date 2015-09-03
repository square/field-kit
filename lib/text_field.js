'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _formatter = require('./formatter');

var _formatter2 = _interopRequireDefault(_formatter);

var _undo_manager = require('./undo_manager');

var _undo_manager2 = _interopRequireDefault(_undo_manager);

var _utils = require('./utils');

var _caret = require('./caret');

/**
 * Simulates input behavior.
 *
 * @external InputSim
 * @see https://github.com/iamJoeTaylor/input-sim
 */

var _inputSim = require('input-sim');

/**
 * TextField is the simplest input and the base for more complex
 * types to inherit.
 *
 * @extends external:InputSim.Input
 */

var TextField = (function (_Input) {
  _inherits(TextField, _Input);

  /**
   * Sets up the initial properties of the TextField and
   * sets  up the event listeners
   *
   * @param {HTMLElement} element
   * @param {Formatter} formatter
   */

  function TextField(element, formatter) {
    _classCallCheck(this, TextField);

    _get(Object.getPrototypeOf(TextField.prototype), 'constructor', this).call(this);

    var caret = (0, _caret.getCaret)(element);
    if (typeof element.get === 'function') {
      console.warn('DEPRECATION: FieldKit.TextField instances should no longer be ' + 'created with a jQuery-wrapped element.');
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
    this._blur = (0, _utils.bind)(this._blur, this);
    this._focus = (0, _utils.bind)(this._focus, this);
    this._click = (0, _utils.bind)(this._click, this);
    this._paste = (0, _utils.bind)(this._paste, this);
    this._keyUp = (0, _utils.bind)(this._keyUp, this);
    this._keyPress = (0, _utils.bind)(this._keyPress, this);
    this._keyDown = (0, _utils.bind)(this._keyDown, this);
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

    var window = element.ownerDocument.defaultView;

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
   * Helps calculate the changes after an event on a FieldKit.TextField.
   *
   * @private
   */

  /**
   * **** Public Events ****
   */

  /**
   * Called when the user has changed the text of the field. Can be used in
   * subclasses to perform actions suitable for this event.
   *
   * @private
   */

  _createClass(TextField, [{
    key: 'textDidChange',
    value: function textDidChange() {}

    /**
     * Called when the user has in some way declared that they are done editing,
     * such as leaving the field or perhaps pressing enter. Can be used in
     * subclasses to perform actions suitable for this event.
     *
     * @private
     */
  }, {
    key: 'textFieldDidEndEditing',
    value: function textFieldDidEndEditing() {}

    /**
     * Performs actions necessary for beginning editing.
     *
     * @private
     */
  }, {
    key: 'textFieldDidBeginEditing',
    value: function textFieldDidBeginEditing() {}

    /**
     * **** Private Events ****
     */

    /**
     * Performs actions necessary for text change.
     *
     * @private
     */
  }, {
    key: '_textDidChange',
    value: function _textDidChange() {
      var delegate = this._delegate;
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
  }, {
    key: '_textFieldDidEndEditing',
    value: function _textFieldDidEndEditing() {
      var delegate = this._delegate;
      this.textFieldDidEndEditing();
      if (delegate && typeof delegate.textFieldDidEndEditing === 'function') {
        delegate.textFieldDidEndEditing(this);
      }

      // manually fire the HTML5 change event, only when a change has been made since focus
      if (this._isDirty && this._valueOnFocus !== this.element.value) {
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
  }, {
    key: '_textFieldDidBeginEditing',
    value: function _textFieldDidBeginEditing() {
      var delegate = this._delegate;
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
  }, {
    key: 'delegate',
    value: function delegate() {
      return this._delegate;
    }

    /**
     * Sets the current delegate for this text field.
     *
     * @param {TextFieldDelegate} delegate
     */
  }, {
    key: 'setDelegate',
    value: function setDelegate(delegate) {
      this._delegate = delegate;
    }

    /**
     * Tears down FieldKit
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      var element = this.element;
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
  }, {
    key: 'formatter',
    value: function formatter() {
      if (!this._formatter) {
        this._formatter = new _formatter2['default']();
        var maximumLengthString = this.element.getAttribute('maxlength');
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
  }, {
    key: 'setFormatter',
    value: function setFormatter(formatter) {
      var value = this.value();
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
  }, {
    key: 'hasChangesAndIsValid',
    value: function hasChangesAndIsValid(current, proposed) {
      var _this = this;

      var change = new TextFieldStateChange(this);
      var error = function error(errorType) {
        var delegate = _this.delegate();
        if (delegate) {
          if (typeof delegate.textFieldDidFailToValidateChange === 'function') {
            delegate.textFieldDidFailToValidateChange(_this, change, errorType);
          }
        }
      };
      change.current = { text: current.text, selectedRange: current.selectedRange };
      change.proposed = { text: proposed.text, selectedRange: proposed.selectedRange };
      if (change.hasChanges() && this.formatter().isChangeValid(change, error)) {
        return change;
      }
      return null;
    }

    /**
     * Handles a key event could be trying to end editing.
     *
     */
  }, {
    key: 'insertNewline',
    value: function insertNewline() {
      this._textFieldDidEndEditing();
      this._didEndEditingButKeptFocus = true;
    }

    /**
     * Debug support
     *
     * @returns {string}
     */
  }, {
    key: 'inspect',
    value: function inspect() {
      return '#<TextField text="' + this.text() + '">';
    }

    /**
     * Replaces the current selection with text from the given pasteboard.
     *
     * @param {DataTransfer} pasteboard
     */
  }, {
    key: 'readSelectionFromPasteboard',
    value: function readSelectionFromPasteboard(pasteboard) {
      var range, text;
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
  }, {
    key: 'rollbackInvalidChanges',
    value: function rollbackInvalidChanges(callback) {
      var result = null;
      var errorType = null;
      var change = TextFieldStateChange.build(this, function () {
        return result = callback();
      });
      var error = function error(type) {
        errorType = type;
      };
      if (change.hasChanges()) {
        var formatter = this.formatter();
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
            var delegate = this.delegate();
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
  }, {
    key: 'value',
    value: function value() {
      var _this2 = this;

      var text = this.text();
      var delegate = this.delegate();
      var formatter = this.formatter();
      if (!formatter) {
        return text;
      }

      return formatter.parse(text, function (errorType) {
        if (delegate) {
          if (typeof delegate.textFieldDidFailToParseString === 'function') {
            delegate.textFieldDidFailToParseString(_this2, text, errorType);
          }
        }
      });
    }

    /**
     * Sets the object value of the field.
     *
     * @param {string} value
     */
  }, {
    key: 'setValue',
    value: function setValue(value) {
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
  }, {
    key: 'text',
    value: function text() {
      return this.element.value;
    }

    /**
     * Sets the formatted text value. This generally should not be used. Instead,
     * use the value setter.
     *
     * @augments external:InputSim.Input#setText
     * @param {string} text
     */
  }, {
    key: 'setText',
    value: function setText(text) {
      this.element.value = text;
      this._currentValue = text;
    }

    /**
     * Gets the range of the current selection.
     *
     * @augments external:InputSim.Input#selectedRange
     * @returns {Object} {start: number, length: number}
     */
  }, {
    key: 'selectedRange',
    value: function selectedRange() {
      var caret = this._needsManualCaret ? this._manualCaret : (0, _caret.getCaret)(this.element);

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
  }, {
    key: 'setSelectedRangeWithAffinity',
    value: function setSelectedRangeWithAffinity(range, affinity) {
      var newRange = _get(Object.getPrototypeOf(TextField.prototype), 'setSelectedRangeWithAffinity', this).call(this, range, affinity);
      var caret = {
        start: newRange.start,
        end: newRange.start + newRange.length
      };
      this._manualCaret = caret;
      (0, _caret.setCaret)(this.element, caret.start, caret.end);
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
  }, {
    key: 'allowsUndo',
    value: function allowsUndo() {
      return this._allowsUndo;
    }

    /**
     * Sets whether this text field records undo actions with its undo manager.
     *
     * @param {boolean} allowsUndo
     */
  }, {
    key: 'setAllowsUndo',
    value: function setAllowsUndo(allowsUndo) {
      this._allowsUndo = allowsUndo;
    }

    /**
     * Triggers a redo in the underlying UndoManager, if applicable.
     *
     * @param {Event} event
     */
  }, {
    key: 'redo',
    value: function redo(event) {
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
  }, {
    key: 'undo',
    value: function undo(event) {
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
  }, {
    key: 'undoManager',
    value: function undoManager() {
      return this._undoManager || (this._undoManager = new _undo_manager2['default']());
    }

    /**
     * **** Enabled/disabled support *****
     */

    /**
     * Removes focus from this field if it has focus.
     */
  }, {
    key: 'becomeFirstResponder',
    value: function becomeFirstResponder() {
      var _this3 = this;

      this.element.focus();
      this.rollbackInvalidChanges(function () {
        _this3.element.select();
        _this3._syncPlaceholder();
      });
    }

    /**
     * Determines whether this field has focus.
     *
     * @returns {boolean} true if this field has focus
     */
  }, {
    key: 'hasFocus',
    value: function hasFocus() {
      return this.element.ownerDocument.activeElement === this.element;
    }

    /**
     * Determines whether this field is enabled or disabled.
     *
     * @returns {boolean} true if this field is enabled
     */
  }, {
    key: 'isEnabled',
    value: function isEnabled() {
      return this._enabled;
    }

    /**
     * Sets whether this text field is enabled
     * and syncs the placeholder to match
     *
     * @param {boolean} enabled
     */
  }, {
    key: 'setEnabled',
    value: function setEnabled(enabled) {
      this._enabled = enabled;
      this._syncPlaceholder();
    }

    /**
     * Removes focus from this field if it has focus.
     *
     * @param {Event} event
     */
  }, {
    key: 'resignFirstResponder',
    value: function resignFirstResponder(event) {
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
  }, {
    key: 'disabledPlaceholder',
    value: function disabledPlaceholder() {
      return this._disabledPlaceholder;
    }

    /**
     * Sets the disabled placeholder.
     *
     * @param {string} disabledPlaceholder
     */
  }, {
    key: 'setDisabledPlaceholder',
    value: function setDisabledPlaceholder(disabledPlaceholder) {
      this._disabledPlaceholder = disabledPlaceholder;
      this._syncPlaceholder();
    }

    /**
     * Gets the focused placeholder if one
     * has been set.
     *
     * @returns {string}
     */
  }, {
    key: 'focusedPlaceholder',
    value: function focusedPlaceholder() {
      return this._focusedPlaceholder;
    }

    /**
     * Sets the focused placeholder.
     *
     * @param {string} focusedPlaceholder
     */
  }, {
    key: 'setFocusedPlaceholder',
    value: function setFocusedPlaceholder(focusedPlaceholder) {
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
  }, {
    key: 'placeholder',
    value: function placeholder() {
      return this._placeholder;
    }

    /**
     * Sets the placeholder.
     *
     * @param {string} placeholder
     */
  }, {
    key: 'setPlaceholder',
    value: function setPlaceholder(placeholder) {
      this._placeholder = placeholder;
      this.element.setAttribute('placeholder', this._placeholder);
    }

    /**
     * Gets the unfocused placeholder if one
     * has been set.
     *
     * @returns {string}
     */
  }, {
    key: 'unfocusedPlaceholder',
    value: function unfocusedPlaceholder() {
      return this._unfocusedPlaceholder;
    }

    /**
     * Sets the unfocused placeholder.
     *
     * @param {string} unfocusedPlaceholder
     */
  }, {
    key: 'setUnfocusedPlaceholder',
    value: function setUnfocusedPlaceholder(unfocusedPlaceholder) {
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
  }, {
    key: '_applyChangeFromUndoManager',
    value: function _applyChangeFromUndoManager(change) {
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
  }, {
    key: '_click',
    value: function _click() {
      this._manualCaret = (0, _caret.getCaret)(this.element);
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
  }, {
    key: '_fireEvent',
    value: function _fireEvent(eventType) {
      var document = this.element.ownerDocument;
      var window = document.defaultView;
      if (typeof window.CustomEvent === 'function') {
        this.element.dispatchEvent(new window.CustomEvent(eventType, {}));
      } else {
        var event = document.createEvent('Event');
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
  }, {
    key: '_focus',
    value: function _focus() {
      this._textFieldDidBeginEditing();
      this._syncPlaceholder();
    }

    /**
     * Handles losing focus. This method delegates to other methods, and syncs the
     * placeholder appropriately.
     *
     * @private
     */
  }, {
    key: '_blur',
    value: function _blur() {
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
  }, {
    key: '_keyDown',
    value: function _keyDown(event) {
      var _this4 = this;

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
            this.rollbackInvalidChanges(function () {
              return _this4[action](event);
            });
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
  }, {
    key: '_keyPress',
    value: function _keyPress(event) {
      var _this5 = this;

      var keyCode = event.keyCode;
      if (!event.metaKey && !event.ctrlKey && keyCode !== _inputSim.KEYS.ENTER && keyCode !== _inputSim.KEYS.TAB && keyCode !== _inputSim.KEYS.BACKSPACE) {
        if (event.charCode !== 0) {
          (function () {
            var newText = String.fromCharCode(event.charCode || event.keyCode);

            _this5._processChange({
              currentText: _this5.text(),
              proposedText: (0, _utils.replaceStringSelection)(newText, _this5.text(), _this5.selectedRange()),
              onSuccess: function onSuccess(change, changeTriggeredFormatting) {
                if (!changeTriggeredFormatting && event instanceof KeyboardEvent) {
                  // HACK(JoeTaylor) Use Browser's native input when using the formatter
                  // would not make a difference https://code.google.com/p/chromium/issues/detail?id=32865
                  if (!_this5._isDirty) {
                    _this5._valueOnFocus = change.current.text || '';
                    _this5._isDirty = true;
                  }
                  _this5.undoManager().proxyFor(_this5)._applyChangeFromUndoManager(change);
                  _this5._textDidChange();
                } else {
                  event.preventDefault();
                  _this5.rollbackInvalidChanges(function () {
                    return _this5.insertText(newText);
                  });
                }
                _this5._currentValue = change.proposed.text;
              },
              onFail: function onFail() {
                event.preventDefault();
                _this5.rollbackInvalidChanges(function () {
                  return _this5.insertText(newText);
                });
              }
            });
          })();
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
  }, {
    key: '_keyUp',
    value: function _keyUp(event) {
      var _this6 = this;

      var keyCode = event.keyCode;
      // NOTE: Certain Androids on Chrome always return 229
      // https://code.google.com/p/chromium/issues/detail?id=118639
      if (keyCode === 229) {
        (function () {
          // Text has already been changed at this point, so we check the previous text
          // to determine whether we need to undo the change.
          var previousText = _this6._currentValue || '';
          _this6._processChange({
            currentText: previousText,
            proposedText: _this6.text(),
            onSuccess: function onSuccess(change, changeTriggeredFormatting) {
              if (changeTriggeredFormatting) {
                var newText = change.proposed.text;
                _this6.setSelectedRange(change.proposed.selectedRange);
                _this6.setText(newText);
              }
              if (!_this6._isDirty) {
                _this6._valueOnFocus = change.current.text || '';
                _this6._isDirty = true;
              }
              _this6.undoManager().proxyFor(_this6)._applyChangeFromUndoManager(change);
              _this6._textDidChange();
              _this6._currentValue = change.proposed.text;
            },
            onFail: function onFail() {
              // Need to rollback the letter input in the Keyup event because it is not valid,
              // so we set text to the previous state (as collected from the UndoManager).
              _this6.setText(previousText);
            }
          });
        })();
      } else {
        this.rollbackInvalidChanges(function () {
          if (event.keyCode === _inputSim.KEYS.TAB) {
            _this6.selectAll(event);
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
  }, {
    key: '_processChange',
    value: function _processChange(_ref) {
      var currentText = _ref.currentText;
      var proposedText = _ref.proposedText;
      var onSuccess = _ref.onSuccess;
      var _ref$onFail = _ref.onFail;
      var onFail = _ref$onFail === undefined ? function () {} : _ref$onFail;

      var current = {
        text: currentText,
        selectedRange: this.selectedRange()
      };
      var proposed = {
        text: proposedText,
        selectedRange: { start: current.selectedRange.start + 1, length: 0 }
      };
      var change = this.hasChangesAndIsValid(current, proposed);
      var changeTriggeredFormatting = change && (change.proposed.text !== proposed.text || change.proposed.selectedRange.start !== proposed.selectedRange.start || change.proposed.selectedRange.length !== proposed.selectedRange.length);

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
  }, {
    key: '_paste',
    value: function _paste(event) {
      var _this7 = this;

      event.preventDefault();
      this.rollbackInvalidChanges(function () {
        _this7.readSelectionFromPasteboard(event.clipboardData);
      });
    }

    /**
     * @private
     */
  }, {
    key: '_syncPlaceholder',
    value: function _syncPlaceholder() {
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
  }]);

  return TextField;
})(_inputSim.Input);

var TextFieldStateChange = (function () {
  /**
   * @param {TextField} field
   */

  function TextFieldStateChange(field) {
    _classCallCheck(this, TextFieldStateChange);

    this.field = field;
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

  /**
   * Determines whether this field has changes.
   *
   * @returns {boolean} true if either the current text doesn't match the proposed text
   *    or the current selection range doesn't match the proposed selection range
   */

  _createClass(TextFieldStateChange, [{
    key: 'hasChanges',
    value: function hasChanges() {
      this.recomputeDiff();
      return this.current.text !== this.proposed.text || this.current.selectedRange.start !== this.proposed.selectedRange.start || this.current.selectedRange.length !== this.proposed.selectedRange.length;
    }

    /**
     * Updates {TextFieldStateChange} inserted and {TextFieldStateChange} deleted
     * based on proposed and current
     */
  }, {
    key: 'recomputeDiff',
    value: function recomputeDiff() {
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
    }
  }]);

  return TextFieldStateChange;
})();

TextFieldStateChange.build = function (field, callback) {
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

exports['default'] = TextField;
module.exports = exports['default'];