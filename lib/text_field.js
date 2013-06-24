(function() {
  var AFFINITY, Formatter, KEYS, TextField, TextFieldStateChange, UndoManager, hasLeftWordBreakAtIndex, hasRightWordBreakAtIndex, isWordChar, keyBindingsForPlatform, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice;

  Formatter = require('./formatter');

  UndoManager = require('./undo_manager');

  _ref = require('./keybindings'), KEYS = _ref.KEYS, keyBindingsForPlatform = _ref.keyBindingsForPlatform;

  AFFINITY = {
    UPSTREAM: 0,
    DOWNSTREAM: 1,
    NONE: null
  };

  isWordChar = function(chr) {
    return chr && /^\w$/.test(chr);
  };

  hasLeftWordBreakAtIndex = function(text, index) {
    if (index === 0) {
      return true;
    } else {
      return !isWordChar(text[index - 1]) && isWordChar(text[index]);
    }
  };

  hasRightWordBreakAtIndex = function(text, index) {
    if (index === text.length) {
      return true;
    } else {
      return isWordChar(text[index]) && !isWordChar(text[index + 1]);
    }
  };

  TextField = (function() {
    TextField.prototype.selectionAffinity = AFFINITY.NONE;

    TextField.prototype._delegate = null;

    TextField.prototype.delegate = function() {
      return this._delegate;
    };

    TextField.prototype.setDelegate = function(delegate) {
      this._delegate = delegate;
      return null;
    };

    function TextField(element, _formatter) {
      this.element = element;
      this._formatter = _formatter;
      this._blur = __bind(this._blur, this);
      this._focus = __bind(this._focus, this);
      this.click = __bind(this.click, this);
      this.paste = __bind(this.paste, this);
      this.keyUp = __bind(this.keyUp, this);
      this.keyPress = __bind(this.keyPress, this);
      this.keyDown = __bind(this.keyDown, this);
      if (this.element.data('field-kit-text-field')) {
        throw new Error("already attached a TextField to this element");
      } else {
        this.element.data('field-kit-text-field', this);
      }
      this._jQuery = this.element.constructor;
      this.element.on('keydown.field-kit', this.keyDown);
      this.element.on('keypress.field-kit', this.keyPress);
      this.element.on('keyup.field-kit', this.keyUp);
      this.element.on('click.field-kit', this.click);
      this.element.on('paste.field-kit', this.paste);
      this.element.on('focus.field-kit', this._focus);
      this.element.on('blur.field-kit', this._blur);
      this._buildKeybindings();
    }

    TextField.prototype.destroy = function() {
      this.element.off('.field-kit');
      this.element.data('field-kit-text-field', null);
      return null;
    };

    TextField.prototype.insertText = function(text) {
      var range;
      if (this.hasSelection()) {
        this.clearSelection();
      }
      this.replaceSelection(text);
      range = this.selectedRange();
      range.start += range.length;
      range.length = 0;
      return this.setSelectedRange(range);
    };

    TextField.prototype.insertNewline = function(event) {
      this._textFieldDidEndEditing();
      return this._didEndEditingButKeptFocus = true;
    };

    TextField.prototype._textDidChange = function() {
      var _ref1;
      this.textDidChange();
      return (_ref1 = this._delegate) != null ? typeof _ref1.textDidChange === "function" ? _ref1.textDidChange(this) : void 0 : void 0;
    };

    TextField.prototype.textDidChange = function() {};

    TextField.prototype._textFieldDidEndEditing = function() {
      var _ref1;
      this.textFieldDidEndEditing();
      return (_ref1 = this._delegate) != null ? typeof _ref1.textFieldDidEndEditing === "function" ? _ref1.textFieldDidEndEditing(this) : void 0 : void 0;
    };

    TextField.prototype.textFieldDidEndEditing = function() {};

    TextField.prototype._textFieldDidBeginEditing = function() {
      var _ref1;
      this.textFieldDidBeginEditing();
      return (_ref1 = this._delegate) != null ? typeof _ref1.textFieldDidBeginEditing === "function" ? _ref1.textFieldDidBeginEditing(this) : void 0 : void 0;
    };

    TextField.prototype.textFieldDidBeginEditing = function() {};

    TextField.prototype.moveUp = function(event) {
      event.preventDefault();
      return this.setSelectedRange({
        start: 0,
        length: 0
      });
    };

    TextField.prototype.moveToBeginningOfParagraph = function(event) {
      return this.moveUp(event);
    };

    TextField.prototype.moveUpAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      switch (this.selectionAffinity) {
        case AFFINITY.UPSTREAM:
        case AFFINITY.NONE:
          range.length += range.start;
          range.start = 0;
          break;
        case AFFINITY.DOWNSTREAM:
          range.length = range.start;
          range.start = 0;
      }
      return this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
    };

    TextField.prototype.moveParagraphBackwardAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      switch (this.selectionAffinity) {
        case AFFINITY.UPSTREAM:
        case AFFINITY.NONE:
          range.length += range.start;
          range.start = 0;
          break;
        case AFFINITY.DOWNSTREAM:
          range.length = 0;
      }
      return this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
    };

    TextField.prototype.moveToBeginningOfDocument = function(event) {
      return this.moveToBeginningOfLine(event);
    };

    TextField.prototype.moveToBeginningOfDocumentAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      range.length += range.start;
      range.start = 0;
      return this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
    };

    TextField.prototype.moveDown = function(event) {
      var range;
      event.preventDefault();
      range = {
        start: this.text().length,
        length: 0
      };
      return this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
    };

    TextField.prototype.moveToEndOfParagraph = function(event) {
      return this.moveDown(event);
    };

    TextField.prototype.moveDownAndModifySelection = function(event) {
      var end, range;
      event.preventDefault();
      range = this.selectedRange();
      end = this.text().length;
      if (this.selectionAffinity === AFFINITY.UPSTREAM) {
        range.start += range.length;
      }
      range.length = end - range.start;
      return this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
    };

    TextField.prototype.moveParagraphForwardAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      switch (this.selectionAffinity) {
        case AFFINITY.DOWNSTREAM:
        case AFFINITY.NONE:
          range.length = this.text().length - range.start;
          break;
        case AFFINITY.UPSTREAM:
          range.start += range.length;
          range.length = 0;
      }
      return this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
    };

    TextField.prototype.moveToEndOfDocument = function(event) {
      return this.moveToEndOfLine(event);
    };

    TextField.prototype.moveToEndOfDocumentAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      range.length = this.text().length - range.start;
      return this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
    };

    TextField.prototype.moveLeft = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      if (range.length !== 0) {
        range.length = 0;
      } else {
        range.start--;
      }
      return this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
    };

    TextField.prototype.moveLeftAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      switch (this.selectionAffinity) {
        case AFFINITY.UPSTREAM:
        case AFFINITY.NONE:
          this.selectionAffinity = AFFINITY.UPSTREAM;
          range.start--;
          range.length++;
          break;
        case AFFINITY.DOWNSTREAM:
          range.length--;
      }
      return this.setSelectedRange(range);
    };

    TextField.prototype.moveWordLeft = function(event) {
      var index;
      event.preventDefault();
      index = this.lastWordBreakBeforeIndex(this.selectedRange().start - 1);
      return this.setSelectedRange({
        start: index,
        length: 0
      });
    };

    TextField.prototype.moveWordLeftAndModifySelection = function(event) {
      var end, range, start;
      event.preventDefault();
      range = this.selectedRange();
      switch (this.selectionAffinity) {
        case AFFINITY.UPSTREAM:
        case AFFINITY.NONE:
          this.selectionAffinity = AFFINITY.UPSTREAM;
          start = this.lastWordBreakBeforeIndex(range.start - 1);
          range.length += range.start - start;
          range.start = start;
          break;
        case AFFINITY.DOWNSTREAM:
          end = this.lastWordBreakBeforeIndex(range.start + range.length);
          if (end < range.start) {
            end = range.start;
          }
          range.length -= range.start + range.length - end;
      }
      return this.setSelectedRange(range);
    };

    TextField.prototype.moveToBeginningOfLine = function(event) {
      event.preventDefault();
      return this.setSelectedRange({
        start: 0,
        length: 0
      });
    };

    TextField.prototype.moveToBeginningOfLineAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      range.length += range.start;
      range.start = 0;
      return this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
    };

    TextField.prototype.moveRight = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      if (range.length !== 0) {
        range.start += range.length;
        range.length = 0;
      } else {
        range.start++;
      }
      return this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
    };

    TextField.prototype.moveRightAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      switch (this.selectionAffinity) {
        case AFFINITY.UPSTREAM:
          range.start++;
          range.length--;
          break;
        case AFFINITY.DOWNSTREAM:
        case AFFINITY.NONE:
          this.selectionAffinity = AFFINITY.DOWNSTREAM;
          range.length++;
      }
      return this.setSelectedRange(range);
    };

    TextField.prototype.moveWordRight = function(event) {
      var index, range;
      event.preventDefault();
      range = this.selectedRange();
      index = this.nextWordBreakAfterIndex(range.start + range.length);
      return this.setSelectedRange({
        start: index,
        length: 0
      });
    };

    TextField.prototype.moveWordRightAndModifySelection = function(event) {
      var end, range, start;
      event.preventDefault();
      range = this.selectedRange();
      start = range.start;
      end = range.start + range.length;
      switch (this.selectionAffinity) {
        case AFFINITY.UPSTREAM:
          start = Math.min(this.nextWordBreakAfterIndex(start), end);
          break;
        case AFFINITY.DOWNSTREAM:
        case AFFINITY.NONE:
          this.selectionAffinity = AFFINITY.DOWNSTREAM;
          end = this.nextWordBreakAfterIndex(range.start + range.length);
      }
      return this.setSelectedRange({
        start: start,
        length: end - start
      });
    };

    TextField.prototype.moveToEndOfLine = function(event) {
      event.preventDefault();
      return this.setSelectedRange({
        start: this.text().length,
        length: 0
      });
    };

    TextField.prototype.moveToEndOfLineAndModifySelection = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      range.length = this.text().length - range.start;
      return this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
    };

    TextField.prototype.deleteBackward = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      if (range.length === 0) {
        range.start--;
        range.length++;
        this.setSelectedRange(range);
      }
      return this.clearSelection();
    };

    TextField.prototype.deleteWordBackward = function(event) {
      var range, start;
      if (this.hasSelection()) {
        return this.deleteBackward(event);
      }
      event.preventDefault();
      range = this.selectedRange();
      start = this.lastWordBreakBeforeIndex(range.start);
      range.length += range.start - start;
      range.start = start;
      this.setSelectedRange(range);
      return this.clearSelection();
    };

    TextField.prototype.deleteBackwardByDecomposingPreviousCharacter = function(event) {
      return this.deleteBackward(event);
    };

    TextField.prototype.deleteBackwardToBeginningOfLine = function(event) {
      var range;
      if (this.hasSelection()) {
        return this.deleteBackward(event);
      }
      event.preventDefault();
      range = this.selectedRange();
      range.length = range.start;
      range.start = 0;
      this.setSelectedRange(range);
      return this.clearSelection();
    };

    TextField.prototype.deleteForward = function(event) {
      var range;
      event.preventDefault();
      range = this.selectedRange();
      if (range.length === 0) {
        range.length++;
        this.setSelectedRange(range);
      }
      return this.clearSelection();
    };

    TextField.prototype.deleteWordForward = function(event) {
      var end, range;
      if (this.hasSelection()) {
        return this.deleteForward(event);
      }
      event.preventDefault();
      range = this.selectedRange();
      end = this.nextWordBreakAfterIndex(range.start + range.length);
      this.setSelectedRange({
        start: range.start,
        length: end - range.start
      });
      return this.clearSelection();
    };

    TextField.prototype.insertTab = function(event) {};

    TextField.prototype.insertBackTab = function(event) {};

    TextField.prototype.hasSelection = function() {
      return this.selectedRange().length !== 0;
    };

    TextField.prototype.lastWordBreakBeforeIndex = function(index) {
      var indexes, result, wordBreakIndex, _i, _len;
      indexes = this.leftWordBreakIndexes();
      result = indexes[0];
      for (_i = 0, _len = indexes.length; _i < _len; _i++) {
        wordBreakIndex = indexes[_i];
        if (index > wordBreakIndex) {
          result = wordBreakIndex;
        } else {
          break;
        }
      }
      return result;
    };

    TextField.prototype.leftWordBreakIndexes = function() {
      var i, result, text, _i, _ref1;
      result = [];
      text = this.text();
      for (i = _i = 0, _ref1 = text.length - 1; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        if (hasLeftWordBreakAtIndex(text, i)) {
          result.push(i);
        }
      }
      return result;
    };

    TextField.prototype.nextWordBreakAfterIndex = function(index) {
      var indexes, result, wordBreakIndex, _i, _len;
      indexes = this.rightWordBreakIndexes().reverse();
      result = indexes[0];
      for (_i = 0, _len = indexes.length; _i < _len; _i++) {
        wordBreakIndex = indexes[_i];
        if (index < wordBreakIndex) {
          result = wordBreakIndex;
        } else {
          break;
        }
      }
      return result;
    };

    TextField.prototype.rightWordBreakIndexes = function() {
      var i, result, text, _i, _ref1;
      result = [];
      text = this.text();
      for (i = _i = 0, _ref1 = text.length; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        if (hasRightWordBreakAtIndex(text, i)) {
          result.push(i + 1);
        }
      }
      return result;
    };

    TextField.prototype.clearSelection = function() {
      return this.replaceSelection('');
    };

    TextField.prototype.replaceSelection = function(replacement) {
      var end, range, text;
      range = this.selectedRange();
      end = range.start + range.length;
      text = this.text();
      text = text.substring(0, range.start) + replacement + text.substring(end);
      range.length = replacement.length;
      this.setText(text);
      return this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
    };

    TextField.prototype.selectAll = function(event) {
      event.preventDefault();
      return this.setSelectedRangeWithAffinity({
        start: 0,
        length: this.text().length
      }, AFFINITY.NONE);
    };

    TextField.prototype.readSelectionFromPasteboard = function(pasteboard) {
      var range, text;
      text = pasteboard.getData('Text');
      this.replaceSelection(text);
      range = this.selectedRange();
      range.start += range.length;
      range.length = 0;
      return this.setSelectedRange(range);
    };

    TextField.prototype.keyDown = function(event) {
      var action,
        _this = this;
      if (this._didEndEditingButKeptFocus) {
        this._textFieldDidBeginEditing();
        this._didEndEditingButKeptFocus = false;
      }
      if (action = this._bindings.actionForEvent(event)) {
        switch (action) {
          case 'undo':
          case 'redo':
            return this[action](event);
          default:
            return this.rollbackInvalidChanges(function() {
              return _this[action](event);
            });
        }
      }
    };

    TextField.prototype.keyPress = function(event) {
      var charCode, _ref1,
        _this = this;
      if (!event.metaKey && !event.ctrlKey && ((_ref1 = event.keyCode) !== KEYS.ENTER && _ref1 !== KEYS.TAB && _ref1 !== KEYS.BACKSPACE)) {
        event.preventDefault();
        charCode = event.charCode || event.keyCode;
        return this.rollbackInvalidChanges(function() {
          return _this.insertText(String.fromCharCode(charCode));
        });
      }
    };

    TextField.prototype.keyUp = function(event) {
      var _this = this;
      return this.rollbackInvalidChanges(function() {
        if (event.keyCode === KEYS.TAB) {
          return _this.selectAll(event);
        }
      });
    };

    TextField.prototype.paste = function(event) {
      var _this = this;
      event.preventDefault();
      return this.rollbackInvalidChanges(function() {
        return _this.readSelectionFromPasteboard(event.originalEvent.clipboardData);
      });
    };

    TextField.prototype.rollbackInvalidChanges = function(callback) {
      var change, error, errorType, result, _ref1, _ref2;
      result = null;
      errorType = null;
      change = TextFieldStateChange.build(this, function() {
        return result = callback();
      });
      error = function(type) {
        return errorType = type;
      };
      if (change.hasChanges()) {
        if (typeof ((_ref1 = this.formatter()) != null ? _ref1.isChangeValid : void 0) === 'function') {
          if (this.formatter().isChangeValid(change, error)) {
            change.recomputeDiff();
            this.setText(change.proposed.text);
            this.setSelectedRange(change.proposed.selectedRange);
          } else {
            if ((_ref2 = this.delegate()) != null) {
              if (typeof _ref2.textFieldDidFailToValidateChange === "function") {
                _ref2.textFieldDidFailToValidateChange(this, change, errorType);
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
    };

    TextField.prototype.click = function(event) {
      return this.selectionAffinity = AFFINITY.NONE;
    };

    TextField.prototype.on = function() {
      var args, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref1 = this.element).on.apply(_ref1, args);
    };

    TextField.prototype.off = function() {
      var args, _ref1;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref1 = this.element).off.apply(_ref1, args);
    };

    TextField.prototype.text = function() {
      return this.element.val();
    };

    TextField.prototype.setText = function(text) {
      return this.element.val(text);
    };

    TextField.prototype.value = function() {
      var value,
        _this = this;
      value = this.text();
      if (!this.formatter()) {
        return value;
      }
      return this.formatter().parse(value, function(errorType) {
        var _ref1;
        return (_ref1 = _this._delegate) != null ? typeof _ref1.textFieldDidFailToParseString === "function" ? _ref1.textFieldDidFailToParseString(_this, value, errorType) : void 0 : void 0;
      });
    };

    TextField.prototype.setValue = function(value) {
      if (this._formatter) {
        value = this._formatter.format(value);
      }
      this.setText("" + value);
      return this.element.trigger('change');
    };

    TextField.prototype.formatter = function() {
      var _this = this;
      return this._formatter || (this._formatter = (function() {
        var formatter, maximumLengthString;
        formatter = new Formatter();
        if ((maximumLengthString = _this.element.attr('maxlength')) != null) {
          formatter.maximumLength = parseInt(maximumLengthString, 10);
        }
        return formatter;
      })());
    };

    TextField.prototype.setFormatter = function(formatter) {
      var value;
      value = this.value();
      this._formatter = formatter;
      return this.setValue(value);
    };

    TextField.prototype.selectedRange = function() {
      var caret;
      caret = this.element.caret();
      return {
        start: caret.start,
        length: caret.end - caret.start
      };
    };

    TextField.prototype.setSelectedRange = function(range) {
      return this.setSelectedRangeWithAffinity(range, this.selectionAffinity);
    };

    TextField.prototype.setSelectedRangeWithAffinity = function(range, affinity) {
      var caret, max, min;
      min = 0;
      max = this.text().length;
      caret = {
        start: Math.max(min, Math.min(max, range.start)),
        end: Math.max(min, Math.min(max, range.start + range.length))
      };
      this.element.caret(caret);
      return this.selectionAffinity = range.length === 0 ? AFFINITY.NONE : affinity;
    };

    TextField.prototype.selectionAnchor = function() {
      var range;
      range = this.selectedRange();
      switch (this.selectionAffinity) {
        case AFFINITY.UPSTREAM:
          return range.start + range.length;
        case AFFINITY.DOWNSTREAM:
          return range.start;
        default:
          return null;
      }
    };

    TextField.prototype.undo = function(event) {
      if (this.undoManager().canUndo()) {
        this.undoManager().undo();
      }
      return event.preventDefault();
    };

    TextField.prototype.redo = function(event) {
      if (this.undoManager().canRedo()) {
        this.undoManager().redo();
      }
      return event.preventDefault();
    };

    TextField.prototype.undoManager = function() {
      return this._undoManager || (this._undoManager = new UndoManager());
    };

    TextField.prototype.allowsUndo = function() {
      return this._allowsUndo;
    };

    TextField.prototype.setAllowsUndo = function(allowsUndo) {
      return this._allowsUndo = allowsUndo;
    };

    TextField.prototype._applyChangeFromUndoManager = function(change) {
      this.undoManager().proxyFor(this)._applyChangeFromUndoManager(change);
      if (this.undoManager().isUndoing()) {
        this.setText(change.current.text);
        this.setSelectedRange(change.current.selectedRange);
      } else {
        this.setText(change.proposed.text);
        this.setSelectedRange(change.proposed.selectedRange);
      }
      return this._textDidChange();
    };

    TextField.prototype._enabled = true;

    TextField.prototype.isEnabled = function() {
      return this._enabled;
    };

    TextField.prototype.setEnabled = function(_enabled) {
      this._enabled = _enabled;
      this._syncPlaceholder();
      return null;
    };

    TextField.prototype.hasFocus = function() {
      return this.element.get(0).ownerDocument.activeElement === this.element.get(0);
    };

    TextField.prototype._focus = function(event) {
      this._textFieldDidBeginEditing();
      return this._syncPlaceholder();
    };

    TextField.prototype._blur = function(event) {
      this._textFieldDidEndEditing();
      return this._syncPlaceholder();
    };

    TextField.prototype._didEndEditingButKeptFocus = false;

    TextField.prototype.becomeFirstResponder = function(event) {
      var _this = this;
      this.element.focus();
      return this.rollbackInvalidChanges(function() {
        _this.element.select();
        return _this._syncPlaceholder();
      });
    };

    TextField.prototype.resignFirstResponder = function(event) {
      if (event != null) {
        event.preventDefault();
      }
      this.element.blur();
      return this._syncPlaceholder();
    };

    TextField.prototype._placeholder = null;

    TextField.prototype._disabledPlaceholder = null;

    TextField.prototype._focusedPlaceholder = null;

    TextField.prototype._unfocusedPlaceholder = null;

    TextField.prototype.disabledPlaceholder = function() {
      return this._disabledPlaceholder;
    };

    TextField.prototype.setDisabledPlaceholder = function(_disabledPlaceholder) {
      this._disabledPlaceholder = _disabledPlaceholder;
      this._syncPlaceholder();
      return null;
    };

    TextField.prototype.focusedPlaceholder = function() {
      return this._focusedPlaceholder;
    };

    TextField.prototype.setFocusedPlaceholder = function(_focusedPlaceholder) {
      this._focusedPlaceholder = _focusedPlaceholder;
      this._syncPlaceholder();
      return null;
    };

    TextField.prototype.unfocusedPlaceholder = function() {
      return this._unfocusedPlaceholder;
    };

    TextField.prototype.setUnfocusedPlaceholder = function(_unfocusedPlaceholder) {
      this._unfocusedPlaceholder = _unfocusedPlaceholder;
      this._syncPlaceholder();
      return null;
    };

    TextField.prototype.placeholder = function() {
      return this._placeholder;
    };

    TextField.prototype.setPlaceholder = function(_placeholder) {
      this._placeholder = _placeholder;
      return this.element.attr('placeholder', this._placeholder);
    };

    TextField.prototype._syncPlaceholder = function() {
      if (!this._enabled) {
        if (this._disabledPlaceholder != null) {
          return this.setPlaceholder(this._disabledPlaceholder);
        }
      } else if (this.hasFocus()) {
        if (this._focusedPlaceholder != null) {
          return this.setPlaceholder(this._focusedPlaceholder);
        }
      } else {
        if (this._unfocusedPlaceholder != null) {
          return this.setPlaceholder(this._unfocusedPlaceholder);
        }
      }
    };

    TextField.prototype._buildKeybindings = function() {
      var doc, osx, userAgent, win;
      doc = this.element.get(0).ownerDocument;
      win = doc.defaultView || doc.parentWindow;
      userAgent = win.navigator.userAgent;
      osx = /^Mozilla\/[\d\.]+ \(Macintosh/.test(userAgent);
      return this._bindings = keyBindingsForPlatform(osx ? 'OSX' : 'Default');
    };

    TextField.prototype.inspect = function() {
      return "#<TextField text=\"" + (this.text()) + "\">";
    };

    return TextField;

  })();

  TextFieldStateChange = (function() {
    TextFieldStateChange.prototype.field = null;

    TextFieldStateChange.prototype.current = null;

    TextFieldStateChange.prototype.proposed = null;

    function TextFieldStateChange(field) {
      this.field = field;
    }

    TextFieldStateChange.build = function(field, callback) {
      var change;
      change = new this(field);
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

    TextFieldStateChange.prototype.hasChanges = function() {
      this.recomputeDiff();
      return this.current.text !== this.proposed.text || this.current.selectedRange.start !== this.proposed.selectedRange.start || this.current.selectedRange.length !== this.proposed.selectedRange.length;
    };

    TextFieldStateChange.prototype.recomputeDiff = function() {
      var ctext, deleted, i, inserted, minTextLength, ptext, sharedPrefixLength, sharedSuffixLength, _i, _j, _ref1;
      if (this.proposed.text !== this.current.text) {
        ctext = this.current.text;
        ptext = this.proposed.text;
        sharedPrefixLength = 0;
        sharedSuffixLength = 0;
        minTextLength = Math.min(ctext.length, ptext.length);
        for (i = _i = 0; 0 <= minTextLength ? _i < minTextLength : _i > minTextLength; i = 0 <= minTextLength ? ++_i : --_i) {
          if (ptext[i] === ctext[i]) {
            sharedPrefixLength = i + 1;
          } else {
            break;
          }
        }
        for (i = _j = 0, _ref1 = minTextLength - sharedPrefixLength; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          if (ptext[ptext.length - 1 - i] === ctext[ctext.length - 1 - i]) {
            sharedSuffixLength = i + 1;
          } else {
            break;
          }
        }
        inserted = {
          start: sharedPrefixLength,
          end: ptext.length - sharedSuffixLength
        };
        deleted = {
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
    };

    return TextFieldStateChange;

  })();

  module.exports = TextField;

}).call(this);
