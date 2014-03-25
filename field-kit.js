(function(e){if("function"==typeof bootstrap)bootstrap("fieldkit",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeFieldKit=e}else"undefined"!=typeof window?window.FieldKit=e():global.FieldKit=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
module.exports = {
  AdaptiveCardFormatter         : require('./adaptive_card_formatter'),
  AmexCardFormatter             : require('./amex_card_formatter'),
  CardTextField                 : require('./card_text_field'),
  DefaultCardFormatter          : require('./default_card_formatter'),
  DelimitedTextFormatter        : require('./delimited_text_formatter'),
  ExpiryDateField               : require('./expiry_date_field'),
  ExpiryDateFormatter           : require('./expiry_date_formatter'),
  Formatter                     : require('./formatter'),
  NumberFormatter               : require('./number_formatter'),
  PhoneFormatter                : require('./phone_formatter'),
  SocialSecurityNumberFormatter : require('./social_security_number_formatter'),
  TextField                     : require('./text_field'),
  UndoManager                   : require('./undo_manager')
};

},{"./adaptive_card_formatter":2,"./amex_card_formatter":3,"./card_text_field":4,"./default_card_formatter":5,"./delimited_text_formatter":6,"./expiry_date_field":7,"./expiry_date_formatter":8,"./formatter":9,"./number_formatter":10,"./phone_formatter":11,"./social_security_number_formatter":12,"./text_field":13,"./undo_manager":14}],9:[function(require,module,exports){
function Formatter() {}

Formatter.prototype.maximumLength = null;

Formatter.prototype.format = function(text) {
  if (text === undefined || text === null) { text = ''; }
  if (this.maximumLength !== undefined && this.maximumLength !== null) {
    text = text.substring(0, this.maximumLength);
  }
  return text;
};

Formatter.prototype.parse = function(text, error) {
  if (text === undefined || text === null) { text = ''; }
  if (this.maximumLength !== undefined && this.maximumLength !== null) {
    text = text.substring(0, this.maximumLength);
  }
  return text;
};

Formatter.prototype.isChangeValid = function(change, error) {
  var selectedRange = change.proposed.selectedRange;
  var text = change.proposed.text;
  if (this.maximumLength !== undefined && this.maximumLength !== null && text.length > this.maximumLength) {
    var available = this.maximumLength - (text.length - change.inserted.text.length);
    var newText = change.current.text.substring(0, change.current.selectedRange.start);
    if (available > 0) {
      newText += change.inserted.text.substring(0, available);
    }
    newText += change.current.text.substring(change.current.selectedRange.start + change.current.selectedRange.length);
    truncatedLength = text.length - newText.length;
    change.proposed.text = newText;
    selectedRange.start -= truncatedLength;
  }
  return true;
};

module.exports = Formatter;

},{}],14:[function(require,module,exports){
function hasGetter(object, property) {
  // Skip if getOwnPropertyDescriptor throws (IE8)
  try {
    Object.getOwnPropertyDescriptor({}, 'sq');
  } catch (e) {
    return false;
  }

  var descriptor;

  if (object && object.constructor && object.constructor.prototype) {
    descriptor = Object.getOwnPropertyDescriptor(object.constructor.prototype, property);
  }

  if (!descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(object, property);
  }

  if (descriptor && descriptor.get) {
    return true;
  } else {
    return false;
  }
}

/**
 * UndoManager is a general-purpose recorder of operations for undo and redo.
 *
 * Registering an undo action is done by specifying the changed object, along
 * with a method to invoke to revert its state and the arguments for that
 * method. When performing undo an UndoManager saves the operations reverted so
 * that you can redo the undos.
 */
function UndoManager() {
  this._undos = [];
  this._redos = [];
}

UndoManager.prototype._undos = null;
UndoManager.prototype._redos = null;
UndoManager.prototype._isUndoing = false;
UndoManager.prototype._isRedoing = false;

/**
 * Determines whether there are any undo actions on the stack.
 *
 * @return {boolean}
 */
UndoManager.prototype.canUndo = function() {
  return this._undos.length !== 0;
};

/**
 * Determines whether there are any redo actions on the stack.
 *
 * @return {boolean}
 */
UndoManager.prototype.canRedo = function() {
  return this._redos.length !== 0;
};

/**
 * Indicates whether or not this manager is currently processing an undo.
 *
 * @return {boolean}
 */
UndoManager.prototype.isUndoing = function() {
  return this._isUndoing;
}

/**
 * Indicates whether or not this manager is currently processing a redo.
 *
 * @return {boolean}
 */
UndoManager.prototype.isRedoing = function() {
  return this._isRedoing;
};

/**
 * Manually registers an simple undo action with the given args.
 *
 * If this undo manager is currently undoing then this will register a redo
 * action instead. If this undo manager is neither undoing or redoing then the
 * redo stack will be cleared.
 *
 * @param {object} target call `selector` on this object
 * @param {string} selector the method name to call on `target`
 * @param {object...} args arguments to pass when calling `selector` on `target`
 */
UndoManager.prototype.registerUndo = function() {
  if (this._isUndoing) {
    this._appendRedo.apply(this, arguments);
  } else {
    if (!this._isRedoing) {
      this._redos.length = 0;
    }
    this._appendUndo.apply(this, arguments);
  }
  return null;
};

/**
 * Appends an undo action to the internal stack.
 *
 * @private
 */
UndoManager.prototype._appendUndo = function(target, selector) {
  this._undos.push({
    target: target,
    selector: selector,
    args: [].slice.call(arguments, 2)
  });
};

/**
 * Appends a redo action to the internal stack.
 *
 * @private
 */
UndoManager.prototype._appendRedo = function(target, selector) {
  this._redos.push({
    target: target,
    selector: selector,
    args: [].slice.call(arguments, 2)
  });
};

/**
 * Performs the top-most undo action on the stack.
 *
 * Raises an error if there are no available undo actions.
 */
UndoManager.prototype.undo = function() {
  if (!this.canUndo()) {
    throw new Error('there are no registered undos');
  }
  var undo = this._undos.pop();
  var target = undo.target;
  var selector = undo.selector;
  var args = undo.args;
  this._isUndoing = true;
  target[selector].apply(target, args);
  this._isUndoing = false;
};

/**
 * Performs the top-most redo action on the stack.
 *
 * Raises an error if there are no available redo actions.
 */
UndoManager.prototype.redo = function() {
  if (!this.canRedo()) {
    throw new Error('there are no registered redos');
  }
  var redo = this._redos.pop();
  var target = redo.target;
  var selector = redo.selector;
  var args = redo.args;
  this._isRedoing = true;
  target[selector].apply(target, args);
  this._isRedoing = false;
  return null;
};

/**
 * Returns a proxy object based on target that will register undo/redo actions
 * by calling methods on the proxy.
 *
 * Example
 *
 *   setSize: (size) ->
 *     @undoManager.proxyFor(this).setSize(@_size)
 *     @_size = size
 *
 */
UndoManager.prototype.proxyFor = function(target) {
  var proxy = {};
  var self = this;
  for (var selector in target) {
    // don't trigger anything that has a getter
    if (hasGetter(target, selector)) { continue; }

    // don't try to proxy properties that aren't functions
    if (typeof target[selector] !== 'function') { continue; }

    // set up a proxy function to register an undo
    (function(selector) {
      proxy[selector] = function() {
        self.registerUndo.apply(self, [target, selector].concat([].slice.call(arguments)));
      };
    })(selector);
  }
  return proxy;
};

module.exports = UndoManager;

},{}],2:[function(require,module,exports){
var AmexCardFormatter = require('./amex_card_formatter');
var DefaultCardFormatter = require('./default_card_formatter');
var cardUtils = require('./card_utils');

function AdaptiveCardFormatter() {
  this.amexCardFormatter = new AmexCardFormatter();
  this.defaultCardFormatter = new DefaultCardFormatter();
  this.formatter = this.defaultCardFormatter;
}

AdaptiveCardFormatter.prototype.format = function(pan) {
  return this._formatterForPan(pan).format(pan);
};


AdaptiveCardFormatter.prototype.parse = function(text, error) {
  return this.formatter.parse(text, error);
};

AdaptiveCardFormatter.prototype.isChangeValid = function(change) {
  this.formatter = this._formatterForPan(change.proposed.text);
  return this.formatter.isChangeValid(change);
};

AdaptiveCardFormatter.prototype._formatterForPan = function(pan) {
  if (cardUtils.determineCardType(pan.replace(/[^\d]+/g, '')) === cardUtils.AMEX) {
    return this.amexCardFormatter;
  } else {
    return this.defaultCardFormatter;
  }
};

module.exports = AdaptiveCardFormatter;

},{"./amex_card_formatter":3,"./card_utils":15,"./default_card_formatter":5}],4:[function(require,module,exports){
var TextField = require('./text_field');
var AdaptiveCardFormatter = require('./adaptive_card_formatter');
var cardUtils = require('./card_utils');

var CardMaskStrategy = {
  None: 'None',
  DoneEditing: 'DoneEditing'
};

function CardTextField(element) {
  TextField.call(this, element, new AdaptiveCardFormatter());
  this.setCardMaskStrategy(CardMaskStrategy.None);
}

CardTextField.prototype = Object.create(TextField.prototype);

/**
 * Gets the card type for the current value.
 *
 * @return {string} Returns one of 'visa', 'mastercard', 'amex' and 'discover'.
 */
CardTextField.prototype.cardType = function() {
  return cardUtils.determineCardType(this.value());
};

/**
 * Gets the type of masking this field uses.
 *
 * @return {CardMaskStrategy}
 */
CardTextField.prototype.cardMaskStrategy = function() {
  return this._cardMaskStrategy;
};

/**
 * Sets the type of masking this field uses.
 *
 * @param {CardMaskStrategy} cardMaskStrategy One of CardMaskStrategy.
 */
CardTextField.prototype.setCardMaskStrategy = function (cardMaskStrategy) {
  if (cardMaskStrategy !== this._cardMaskStrategy) {
    this._cardMaskStrategy = cardMaskStrategy;
    this._syncMask();
  }

  return null;
};

/**
 * Returns a masked version of the current formatted PAN. Example:
 *
 *   field.setText('4111 1111 1111 1111')
 *   field.cardMask() // "•••• •••• •••• 1111"
 *
 * @return {string} Returns a masked card string.
 */
CardTextField.prototype.cardMask = function() {
  var text   = this.text();
  var toMask = text.slice(0, -4);
  var last4  = text.slice(-4);

  return toMask.replace(/\d/g, '•') + last4;
};

/**
 * Whether we are currently masking the displayed text.
 */
CardTextField.prototype._masked = false;

/**
 * Whether we are currently editing.
 */
CardTextField.prototype._editing = false;

/**
 * Gets the formatted PAN for this field.
 *
 * @return {string}
 */
CardTextField.prototype.text = function() {
  if (this._masked) {
    return this._unmaskedText;
  } else {
    return TextField.prototype.text.call(this);
  }
};

/**
 * Sets the formatted PAN for this field.
 *
 * @param {string} text A formatted PAN.
 */
CardTextField.prototype.setText = function(text) {
  if (this._masked) {
    this._unmaskedText = text;
    text = this.cardMask();
  }
  TextField.prototype.setText.call(this, text);
};

/**
 * Called by our superclass, used to implement card masking.
 *
 * @private
 */
CardTextField.prototype.textFieldDidEndEditing = function() {
  this._editing = false;
  this._syncMask();
};

/**
 * Called by our superclass, used to implement card masking.
 *
 * @private
 */
CardTextField.prototype.textFieldDidBeginEditing = function() {
  this._editing = true;
  this._syncMask();
};

/**
 * Enables masking if it is not already enabled.
 *
 * @private
 */
CardTextField.prototype._enableMasking = function() {
  if (!this._masked) {
    this._unmaskedText = this.text();
    this._masked = true;
    this.setText(this._unmaskedText);
  }
};

/**
 * Disables masking if it is currently enabled.
 *
 * @private
 */
CardTextField.prototype._disableMasking = function() {
  if (this._masked) {
    this._masked = false;
    this.setText(this._unmaskedText);
    this._unmaskedText = null;
  }
};

/**
 * Enables or disables masking based on the mask settings.
 *
 * @private
 */
CardTextField.prototype._syncMask = function() {
  if (this.cardMaskStrategy() === CardMaskStrategy.DoneEditing) {
    if (this._editing) {
      this._disableMasking();
    } else {
      this._enableMasking();
    }
  }
};

CardTextField.CardMaskStrategy = CardMaskStrategy;

module.exports = CardTextField;

},{"./text_field":13,"./adaptive_card_formatter":2,"./card_utils":15}],3:[function(require,module,exports){
var DefaultCardFormatter = require('./default_card_formatter');

function AmexCardFormatter() {
  DefaultCardFormatter.apply(this, arguments);
}

AmexCardFormatter.prototype = Object.create(DefaultCardFormatter.prototype);

AmexCardFormatter.prototype.maximumLength = 15 + 2;

AmexCardFormatter.prototype.hasDelimiterAtIndex = function(index) {
  return index === 4 || index === 11;
};

module.exports = AmexCardFormatter;

},{"./default_card_formatter":5}],5:[function(require,module,exports){
var DelimitedTextFormatter = require('./delimited_text_formatter');
var cardUtils = require('./card_utils');

function DefaultCardFormatter() {
  DelimitedTextFormatter.apply(this, arguments);
}

DefaultCardFormatter.prototype = Object.create(DelimitedTextFormatter.prototype);

DefaultCardFormatter.prototype.delimiter = ' ';

DefaultCardFormatter.prototype.maximumLength = 16 + 3;

DefaultCardFormatter.prototype.hasDelimiterAtIndex = function(index) {
  return index === 4 || index === 9 || index === 14;
};

DefaultCardFormatter.prototype.parse = function(text, error) {
  var value = this._valueFromText(text);
  if (typeof error === 'function') {
    if (!cardUtils.validCardLength(value)) {
      error('card-formatter.number-too-short');
    }
    if (!cardUtils.luhnCheck(value)) {
      error('card-formatter.invalid-number');
    }
  }
  return DelimitedTextFormatter.prototype.parse.call(this, text, error);
};

DefaultCardFormatter.prototype._valueFromText = function(text) {
  return DelimitedTextFormatter.prototype._valueFromText.call(
    this,
    (text || '').replace(/[^\d]/g, '')
  );
};

module.exports = DefaultCardFormatter;

},{"./delimited_text_formatter":6,"./card_utils":15}],6:[function(require,module,exports){
var Formatter = require('./formatter');

function DelimitedTextFormatter(delimiter) {
  if (!delimiter) { delimiter = this.delimiter; }
  if (delimiter === null || delimiter === undefined || delimiter.length !== 1) {
    throw new Error('delimiter must have just one character');
  }
  this.delimiter = delimiter;
}

DelimitedTextFormatter.prototype = Object.create(Formatter.prototype);

DelimitedTextFormatter.prototype.delimiter = null;

DelimitedTextFormatter.prototype.delimiterAt = function(index) {
  if (!this.hasDelimiterAtIndex(index)) {
    return null;
  }
  return this.delimiter;
};

DelimitedTextFormatter.prototype.isDelimiter = function(chr) {
  return chr === this.delimiter;
};

DelimitedTextFormatter.prototype.format = function(value) {
  return this._textFromValue(value);
};

DelimitedTextFormatter.prototype._textFromValue = function(value) {
  if (!value) { return ''; }

  var result = '';

  for (var i = 0, l = value.length; i < l; i++) {
    while ((delimiter = this.delimiterAt(result.length))) {
      result += delimiter;
    }
    result += value[i];
    while ((delimiter = this.delimiterAt(result.length))) {
      result += delimiter;
    }
  }

  return result;
};

DelimitedTextFormatter.prototype.parse = function(text, error) {
  return this._valueFromText(text);
};

DelimitedTextFormatter.prototype._valueFromText = function(text) {
  if (!text) { return ''; }
  var result = '';
  for (var i = 0, l = text.length; i < l; i++) {
    if (!this.isDelimiter(text[i])) {
      result += text[i];
    }
  }
  return result;
};

DelimitedTextFormatter.prototype.isChangeValid = function(change, error) {
  if (!Formatter.prototype.isChangeValid.call(this, change, error)) {
    return false;
  }

  var newText = change.proposed.text;
  var range = change.proposed.selectedRange;
  var hasSelection = range.length !== 0;

  var startMovedLeft = range.start < change.current.selectedRange.start;
  var startMovedRight = range.start > change.current.selectedRange.start;
  var endMovedLeft = (range.start + range.length) < (change.current.selectedRange.start + change.current.selectedRange.length);
  var endMovedRight = (range.start + range.length) > (change.current.selectedRange.start + change.current.selectedRange.length);

  var startMovedOverADelimiter = startMovedLeft && this.hasDelimiterAtIndex(range.start) ||
                                  startMovedRight && this.hasDelimiterAtIndex(range.start - 1);
  var endMovedOverADelimiter = endMovedLeft && this.hasDelimiterAtIndex(range.start + range.length) ||
                                endMovedRight && this.hasDelimiterAtIndex(range.start + range.length - 1);

  if (this.isDelimiter(change.deleted.text)) {
    var newCursorPosition = change.deleted.start - 1;
    // delete any immediately preceding delimiters
    while (this.isDelimiter(newText.charAt(newCursorPosition))) {
      newText = newText.substring(0, newCursorPosition) + newText.substring(newCursorPosition + 1);
      newCursorPosition--;
    }
    // finally delete the real character that was intended
    newText = newText.substring(0, newCursorPosition) + newText.substring(newCursorPosition + 1);
  }

  // adjust the cursor / selection
  if (startMovedLeft && startMovedOverADelimiter) {
    // move left over any immediately preceding delimiters
    while (this.delimiterAt(range.start - 1)) {
      range.start--;
      range.length++;
    }
    // finally move left over the real intended character
    range.start--;
    range.length++;
  }

  if (startMovedRight) {
    // move right over any immediately following delimiters
    // In all but one scenario, the cursor should already be placed after the delimiter group,
    // the one exception is when the format has a leading delimiter. In this case,
    // we need to move past all leading delimiters before placing the real character input
    while (this.delimiterAt(range.start)) {
      range.start++;
      range.length--;
    }
    // if the first character was a delimiter, then move right over the real character that was intended
    if (startMovedOverADelimiter) {
      range.start++;
      range.length--;
      // move right over any delimiters that might immediately follow the real character
      while (this.delimiterAt(range.start)) {
        range.start++;
        range.length--;
      }
    }
  }

  if (hasSelection) { // Otherwise, the logic for the range start takes care of everything.
    if (endMovedOverADelimiter) {
      if (endMovedLeft) {
        // move left over any immediately preceding delimiters
        while (this.delimiterAt(range.start + range.length - 1)) {
          range.length--;
        }
        // finally move left over the real intended character
        range.length--;
      }

      if (endMovedRight) {
        // move right over any immediately following delimters
        while (this.delimiterAt(range.start + range.length)) {
          range.length++;
        }
        // finally move right over the real intended character
        range.length++;
      }
    }

    // trailing delimiters in the selection
    while (this.hasDelimiterAtIndex(range.start + range.length - 1)) {
      if (startMovedLeft || endMovedLeft) {
        range.length--;
      } else {
        range.length++;
      }
    }

    while (this.hasDelimiterAtIndex(range.start)) {
      if (startMovedRight || endMovedRight) {
        range.start++;
        range.length--;
      } else {
        range.start--;
        range.length++;
      }
    }
  } else {
    range.length = 0;
  }

  var isChangeValid = true;

  var value = this._valueFromText(newText, function() {
    isChangeValid = false;
    error.apply(null, arguments);
  });

  if (isChangeValid) {
    change.proposed.text = this._textFromValue(value);
  }

  return isChangeValid;
};

module.exports = DelimitedTextFormatter;

},{"./formatter":9}],7:[function(require,module,exports){
(function(){var TextField           = require('./text_field');
var ExpiryDateFormatter = require('./expiry_date_formatter');

function ExpiryDateField(element) {
  TextField.call(this, element, new ExpiryDateFormatter());
}

ExpiryDateField.prototype = Object.create(TextField.prototype);

/**
 * Called by our superclass, used to post-process the text.
 *
 * @private
 */
ExpiryDateField.prototype.textFieldDidEndEditing = function() {
  var value = this.value();
  if (value) {
    return this.setText(this.formatter().format(value));
  }
};

module.exports = ExpiryDateField;

})()
},{"./text_field":13,"./expiry_date_formatter":8}],8:[function(require,module,exports){
var DelimitedTextFormatter = require('./delimited_text_formatter');
var zpad2 = require('./utils').zpad2;

function interpretTwoDigitYear(year) {
  var thisYear = new Date().getFullYear();
  var thisCentury = thisYear - (thisYear % 100);
  var centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort(function(a, b) {
    return Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b));
  });
  return year + centuries[0];
}

function ExpiryDateFormatter() {
  DelimitedTextFormatter.apply(this, arguments);
}

ExpiryDateFormatter.prototype = Object.create(DelimitedTextFormatter.prototype);

ExpiryDateFormatter.prototype.delimiter = '/';
ExpiryDateFormatter.prototype.maximumLength = 5;

ExpiryDateFormatter.prototype.hasDelimiterAtIndex = function(index) {
  return index === 2;
};

ExpiryDateFormatter.prototype.format = function(value) {
  if (!value) { return ''; }

  var month = value.month;
  var year = value.year;
  year = year % 100;

  return DelimitedTextFormatter.prototype.format.call(this, zpad2(month) + zpad2(year));
};

ExpiryDateFormatter.prototype.parse = function(text, error) {
  var monthAndYear = text.split(this.delimiter);
  var month = monthAndYear[0];
  var year = monthAndYear[1];
  if (month && month.match(/^(0?[1-9]|1\d)$/) && year && year.match(/^\d\d?$/)) {
    month = Number(month);
    year = interpretTwoDigitYear(Number(year));
    return { month: month, year: year };
  } else {
    if (typeof error === 'function') {
      error('expiry-date-formatter.invalid-date');
    }
    return null;
  }
};

ExpiryDateFormatter.prototype.isChangeValid = function(change, error) {
  if (!error) { error = function(){}; }

  var isBackspace = change.proposed.text.length < change.current.text.length;
  var newText = change.proposed.text;

  if (isBackspace) {
    if (change.deleted.text === this.delimiter) {
      newText = newText[0];
    }
    if (newText === '0') {
      newText = '';
    }
  } else if (change.inserted.text === this.delimiter && change.current.text === '1') {
    newText = '01' + this.delimiter;
  } else if (change.inserted.text.length > 0 && !/^\d$/.test(change.inserted.text)) {
    error('expiry-date-formatter.only-digits-allowed');
    return false;
  } else {
    // 4| -> 04|
    if (/^[2-9]$/.test(newText)) {
      newText = '0' + newText;
    }

    // 15| -> 1|
    if (/^1[3-9]$/.test(newText)) {
      error('expiry-date-formatter.invalid-month');
      return false;
    }

    // Don't allow 00
    if (newText === '00') {
      error('expiry-date-formatter.invalid-month');
      return false;
    }

    // 11| -> 11/
    if (/^(0[1-9]|1[0-2])$/.test(newText)) {
      newText += this.delimiter;
    }

    if ((match = newText.match(/^(\d\d)(.)(\d\d?).*$/)) && match[2] === this.delimiter) {
      newText = match[1] + this.delimiter + match[3];
    }
  }

  change.proposed.text = newText;
  change.proposed.selectedRange = { start: newText.length, length: 0 };

  return true;
};

module.exports = ExpiryDateFormatter;

},{"./delimited_text_formatter":6,"./utils":16}],11:[function(require,module,exports){
var DelimitedTextFormatter = require('./delimited_text_formatter');

// (415) 555-1212
var NANP_PHONE_DELIMITERS = {
  0: '(',
  4: ')',
  5: ' ',
  9: '-'
};

// 1 (415) 555-1212
var NANP_PHONE_DELIMITERS_WITH_1 = {
  1:  ' ',
  2:  '(',
  6:  ')',
  7:  ' ',
  11: '-'
};

// +1 (415) 555-1212
var NANP_PHONE_DELIMITERS_WITH_PLUS = {
  2:  ' ',
  3:  '(',
  7:  ')',
  8:  ' ',
  12: '-'
};

// This should match any characters in the maps above.
var DELIMITER_PATTERN = /[-\(\) ]/g;

function PhoneFormatter() {
  if (arguments.length !== 0) {
    throw new Error('were you trying to set a delimiter ('+arguments[0]+')?');
  }
}

PhoneFormatter.prototype = Object.create(DelimitedTextFormatter.prototype);

PhoneFormatter.prototype.maximumLength = null;
PhoneFormatter.prototype.delimiterMap = null;

PhoneFormatter.prototype.isDelimiter = function(chr) {
  var map = this.delimiterMap;
  for (var index in map) {
    if (map.hasOwnProperty(index)) {
      if (map[index] === chr) {
        return true;
      }
    }
  }
  return false;
};

PhoneFormatter.prototype.delimiterAt = function(index) {
  return this.delimiterMap[index];
};

PhoneFormatter.prototype.hasDelimiterAtIndex = function(index) {
  var delimiter = this.delimiterAt(index);
  return delimiter !== undefined && delimiter !== null;
};

PhoneFormatter.prototype.parse = function(text, error) {
  if (!error) { error = function(){}; }
  var digits = this.digitsWithoutCountryCode(text);
  // Source: http://en.wikipedia.org/wiki/North_American_Numbering_Plan
  //
  // Area Code
  if (text.length < 10) {
    error('phone-formatter.number-too-short');
  }
  if (digits[0] === '0') {
    error('phone-formatter.area-code-zero');
  }
  if (digits[0] === '1') {
    error('phone-formatter.area-code-one');
  }
  if (digits[1] === '9') {
    error('phone-formatter.area-code-n9n');
  }
  // Central Office Code
  if (digits[3] === '1') {
    error('phone-formatter.central-office-one');
  }
  if (digits.slice(4, 6) === '11') {
    error('phone-formatter.central-office-n11');
  }
  return DelimitedTextFormatter.prototype.parse.call(this, text, error);
};

PhoneFormatter.prototype.format = function(value) {
  this.guessFormatFromText(value);
  return DelimitedTextFormatter.prototype.format.call(this, this.removeDelimiterMapChars(value));
};

PhoneFormatter.prototype.isChangeValid = function(change, error) {
  this.guessFormatFromText(change.proposed.text);

  if (change.inserted.text.length > 1) {
    // handle pastes
    var text = change.current.text;
    var selectedRange = change.current.selectedRange;
    var toInsert = change.inserted.text;

    // Replace the selection with the new text, remove non-digits, then format.
    var formatted = this.format((
      text.slice(0, selectedRange.start) +
      toInsert +
      text.slice(selectedRange.start+selectedRange.length)
    ).replace(/[^\d]/g, ''));

    change.proposed = {
      text: formatted,
      selectedRange: {
        start: formatted.length - (text.length - (selectedRange.start + selectedRange.length)),
        length: 0
      }
    };

    return DelimitedTextFormatter.prototype.isChangeValid.call(this, change, error);
  }

  if (/^\d*$/.test(change.inserted.text) || change.proposed.text.indexOf('+') === 0) {
    return DelimitedTextFormatter.prototype.isChangeValid.call(this, change, error);
  } else {
    return false;
  }
};

/**
 * Re-configures this formatter to use the delimiters appropriate
 * for the given text.
 *
 * @param {string} text A potentially formatted string containing a phone number.
 * @private
 */
PhoneFormatter.prototype.guessFormatFromText = function(text) {
  if (text && text[0] === '+') {
    this.delimiterMap = NANP_PHONE_DELIMITERS_WITH_PLUS;
    this.maximumLength = 1 + 1 + 10 + 5;
  } else if (text && text[0] === '1') {
    this.delimiterMap = NANP_PHONE_DELIMITERS_WITH_1;
    this.maximumLength = 1 + 10 + 5;
  } else {
    this.delimiterMap = NANP_PHONE_DELIMITERS;
    this.maximumLength = 10 + 4;
  }
};

/**
 * Gives back just the phone number digits as a string without the
 * country code. Future-proofing internationalization where the country code
 * isn't just +1.
 *
 * @private
 */
PhoneFormatter.prototype.digitsWithoutCountryCode = function(text) {
  var digits = (text || '').replace(/[^\d]/g, '');
  var extraDigits = digits.length - 10;
  if (extraDigits > 0) {
    digits = digits.substr(extraDigits);
  }
  return digits;
};

/**
 * Removes characters from the phone number that will be added
 * by the formatter.
 *
 * @private
 */
PhoneFormatter.prototype.removeDelimiterMapChars = function(text) {
  return (text || '').replace(DELIMITER_PATTERN, '');
};

module.exports = PhoneFormatter;

},{"./delimited_text_formatter":6}],12:[function(require,module,exports){
var DelimitedTextFormatter = require('./delimited_text_formatter');
var DIGITS_PATTERN = /^\d*$/;

function SocialSecurityNumberFormatter() {
  DelimitedTextFormatter.apply(this, arguments);
}

SocialSecurityNumberFormatter.prototype = Object.create(DelimitedTextFormatter.prototype);

SocialSecurityNumberFormatter.prototype.delimiter = '-';

SocialSecurityNumberFormatter.prototype.maximumLength = 9 + 2;

SocialSecurityNumberFormatter.prototype.hasDelimiterAtIndex = function(index) {
  return index === 3 || index === 6;
};

SocialSecurityNumberFormatter.prototype.isChangeValid = function(change) {
  if (DIGITS_PATTERN.test(change.inserted.text)) {
    return DelimitedTextFormatter.prototype.isChangeValid.call(this, change);
  } else {
    return false;
  }
};

module.exports = SocialSecurityNumberFormatter;

},{"./delimited_text_formatter":6}],13:[function(require,module,exports){
/* jshint undef:true, node:true */

var Formatter = require('./formatter');
var UndoManager = require('./undo_manager');
var keys = require('./keybindings');
var KEYS = keys.KEYS;
var keyBindingsForPlatform = keys.keyBindingsForPlatform;
var bind = require('./utils').bind;

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

function TextField(element, _formatter) {
  this.element = element;
  this._formatter = _formatter;
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
  this._jQuery = this.element.constructor;
  this.element.on('keydown.field-kit', this.keyDown);
  this.element.on('keypress.field-kit', this.keyPress);
  this.element.on('keyup.field-kit', this.keyUp);
  this.element.on('click.field-kit', this.click);
  this.element.on('paste.field-kit', this.paste);
  this.element.on('focusin.field-kit', this._focusin);
  this.element.on('focusout.field-kit', this._focusout);
  this._buildKeybindings();
}

/**
 * Contains one of the AFFINITY enum to indicate the preferred direction of
 * selection.
 *
 * @private
 */
TextField.prototype.selectionAffinity = AFFINITY.NONE;

TextField.prototype._delegate = null;

/**
 * Gets the current delegate for this text field.
 *
 * @return {TextFieldDelegate}
 */
TextField.prototype.delegate = function() {
  return this._delegate;
};

/**
 * Sets the current delegate for this text field.
 *
 * @param {TextFieldDelegate} delegate
 */
TextField.prototype.setDelegate = function(delegate) {
  this._delegate = delegate;
  return null;
};

TextField.prototype.destroy = function() {
  this.element.off('.field-kit');
  this.element.data('field-kit-text-field', null);
  return null;
};

/**
 * Handles a key event that is trying to insert a character.
 */
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
  this._didEndEditingButKeptFocus = true;
};

/**
 * Performs actions necessary for text change.
 *
 * @private
 */
TextField.prototype._textDidChange = function() {
  var delegate = this._delegate;
  this.textDidChange();
  if (delegate && typeof delegate.textDidChange === 'function') {
    delegate.textDidChange(this);
  }
};

/**
 * Called when the user has changed the text of the field. Can be used in
 * subclasses to perform actions suitable for this event.
 */
TextField.prototype.textDidChange = function() {};

/**
 * Performs actions necessary for ending editing.
 *
 * @private
 */
TextField.prototype._textFieldDidEndEditing = function() {
  var delegate = this._delegate;
  this.textFieldDidEndEditing();
  if (delegate && typeof delegate.textFieldDidEndEditing === 'function') {
    delegate.textFieldDidEndEditing(this);
  }
};

/**
 * Called when the user has in some way declared that they are done editing,
 * such as leaving the field or perhaps pressing enter. Can be used in
 * subclasses to perform actions suitable for this event.
 *
 * @private
 */
TextField.prototype.textFieldDidEndEditing = function() {};

TextField.prototype._textFieldDidBeginEditing = function() {
  var delegate = this._delegate;
  this.textFieldDidBeginEditing();
  if (delegate && typeof delegate.textFieldDidBeginEditing === 'function') {
    delegate.textFieldDidBeginEditing(this);
  }
};

/**
 * Performs actions necessary for beginning editing.
 *
 * @private
 */
TextField.prototype.textFieldDidBeginEditing = function() {};

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
TextField.prototype.moveUp = function(event) {
  event.preventDefault();
  this.setSelectedRange({
    start: 0,
    length: 0
  });
};

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
TextField.prototype.moveToBeginningOfParagraph = function(event) {
  this.moveUp(event);
};

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
TextField.prototype.moveUpAndModifySelection = function(event) {
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
};

/**
 * Moves the free end of the selection to the beginning of the paragraph, or
 * since this is a single-line text field to the beginning of the line.
 */
TextField.prototype.moveParagraphBackwardAndModifySelection = function(event) {
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
};

/**
 * Moves the cursor to the beginning of the document.
 */
TextField.prototype.moveToBeginningOfDocument = function(event) {
  // Since we only support a single line this is just an alias.
  this.moveToBeginningOfLine(event);
};

/**
 * Moves the selection start to the beginning of the document.
 */
TextField.prototype.moveToBeginningOfDocumentAndModifySelection = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  range.length += range.start;
  range.start = 0;
  return this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
};

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
TextField.prototype.moveDown = function(event) {
  event.preventDefault();
  // 12|34 56|78  =>  1234 5678|
  var range = {
    start: this.text().length,
    length: 0
  };
  this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
};

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
TextField.prototype.moveToEndOfParagraph = function(event) {
  this.moveDown(event);
};

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
TextField.prototype.moveDownAndModifySelection = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  var end = this.text().length;
  if (this.selectionAffinity === AFFINITY.UPSTREAM) {
    range.start += range.length;
  }
  range.length = end - range.start;
  this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
};

/**
 * Moves the free end of the selection to the end of the paragraph, or since
 * this is a single-line text field to the end of the line.
 */
TextField.prototype.moveParagraphForwardAndModifySelection = function(event) {
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
};

/**
 * Moves the cursor to the end of the document.
 */
TextField.prototype.moveToEndOfDocument = function(event) {
  // Since we only support a single line this is just an alias.
  this.moveToEndOfLine(event);
};

/**
 * Moves the selection end to the end of the document.
 */
TextField.prototype.moveToEndOfDocumentAndModifySelection = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  range.length = this.text().length - range.start;
  this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
};

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
TextField.prototype.moveLeft = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  if (range.length !== 0) {
    range.length = 0;
  } else {
    range.start--;
  }
  this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
};

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
TextField.prototype.moveLeftAndModifySelection = function(event) {
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
};

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
TextField.prototype.moveWordLeft = function(event) {
  event.preventDefault();
  var index = this.lastWordBreakBeforeIndex(this.selectedRange().start - 1);
  this.setSelectedRange({ start: index, length: 0 });
};

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
TextField.prototype.moveWordLeftAndModifySelection = function(event) {
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
};

/**
 * Moves the cursor to the beginning of the current line.
 *
 * Examples
 *
 *   Hey guys, where| are ya?
 *   moveToBeginningOfLine(event)
 *   |Hey guys, where are ya?
 */
TextField.prototype.moveToBeginningOfLine = function(event) {
  event.preventDefault();
  this.setSelectedRange({ start: 0, length: 0 });
};

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
TextField.prototype.moveToBeginningOfLineAndModifySelection = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  range.length += range.start;
  range.start = 0;
  this.setSelectedRangeWithAffinity(range, AFFINITY.UPSTREAM);
};

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
TextField.prototype.moveRight = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  if (range.length !== 0) {
    range.start += range.length;
    range.length = 0;
  } else {
    range.start++;
  }
  this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
};

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
TextField.prototype.moveRightAndModifySelection = function(event) {
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
};

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
TextField.prototype.moveWordRight = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  var index = this.nextWordBreakAfterIndex(range.start + range.length);
  this.setSelectedRange({ start: index, length: 0 });
};

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
TextField.prototype.moveWordRightAndModifySelection = function(event) {
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
};

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
TextField.prototype.moveToEndOfLine = function(event) {
  event.preventDefault();
  this.setSelectedRange({ start: this.text().length, length: 0 });
};

/**
 * Moves the free end of the selection to the end of the current line.
 *
 * Examples
 *
 *   Hey guys, where| are ya?
 *   moveToEndofLineAndModifySelection(event)
 *   Hey guys, where| are ya?>
 *
 *   Hey guys, <where| are ya?
 *   moveToEndofLineAndModifySelection(event)
 *   Hey guys, |where are ya?>
 */
TextField.prototype.moveToEndOfLineAndModifySelection = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  range.length = this.text().length - range.start;
  this.setSelectedRangeWithAffinity(range, AFFINITY.DOWNSTREAM);
};

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
TextField.prototype.deleteBackward = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  if (range.length === 0) {
    range.start--;
    range.length++;
    this.setSelectedRange(range);
  }
  this.clearSelection();
};

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
TextField.prototype.deleteWordBackward = function(event) {
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
};

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
TextField.prototype.deleteBackwardByDecomposingPreviousCharacter = function(event) {
  this.deleteBackward(event);
};

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
TextField.prototype.deleteBackwardToBeginningOfLine = function(event) {
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
};

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
TextField.prototype.deleteForward = function(event) {
  event.preventDefault();
  var range = this.selectedRange();
  if (range.length === 0) {
    range.length++;
    this.setSelectedRange(range);
  }
  return this.clearSelection();
};

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
TextField.prototype.deleteWordForward = function(event) {
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
};

/**
 * Handles the tab key.
 */
TextField.prototype.insertTab = function(event) {};

/**
 * Handles the back tab key.
 */
TextField.prototype.insertBackTab = function(event) {};

/**
 * Determines whether this field has any selection.
 *
 * @return {boolean} true if there is at least one character selected
 */
TextField.prototype.hasSelection = function() {
  return this.selectedRange().length !== 0;
};

/**
 * Finds the start of the "word" before index.
 *
 * @private
 * @param {number} index position at which to start looking
 * @return {number} index in value less than or equal to the given index
 */
TextField.prototype.lastWordBreakBeforeIndex = function(index) {
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
};

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
TextField.prototype.leftWordBreakIndexes = function() {
  var result = [];
  var text = this.text();
  for (var i = 0, l = text.length; i < l; i++) {
    if (hasLeftWordBreakAtIndex(text, i)) {
      result.push(i);
    }
  }
  return result;
};

/**
 * Finds the end of the "word" after index.
 *
 * @private
 * @param {number} index position in value at which to start looking.
 * @return {number}
 */
TextField.prototype.nextWordBreakAfterIndex = function(index) {
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
};

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
TextField.prototype.rightWordBreakIndexes = function() {
  var result = [];
  var text = this.text();
  for (var i = 0, l = text.length; i <= l; i++) {
    if (hasRightWordBreakAtIndex(text, i)) {
      result.push(i + 1);
    }
  }
  return result;
};

/**
 * Clears all characters in the existing selection.
 *
 * Examples
 *
 *   12|34567|8
 *   clearSelection()
 *   12|8
 */
TextField.prototype.clearSelection = function() {
  this.replaceSelection('');
};

/**
 * Replaces the characters within the selection with given text.
 *
 * Examples
 *
 *   12|34567|8
 *   replaceSelection("00")
 *   12|00|8
 */
TextField.prototype.replaceSelection = function(replacement) {
  var range = this.selectedRange();
  var end = range.start + range.length;
  var text = this.text();
  text = text.substring(0, range.start) + replacement + text.substring(end);
  range.length = replacement.length;
  this.setText(text);
  this.setSelectedRangeWithAffinity(range, AFFINITY.NONE);
};

/**
 * Expands the selection to contain all the characters in the content.
 *
 * Examples
 *
 *   123|45678
 *   selectAll(event)
 *   |12345678|
 */
TextField.prototype.selectAll = function(event) {
  event.preventDefault();
  this.setSelectedRangeWithAffinity({
    start: 0,
    length: this.text().length
  }, AFFINITY.NONE);
};

/**
 * Replaces the current selection with text from the given pasteboard.
 *
 * @param {ClipboardData} pasteboard
 */
TextField.prototype.readSelectionFromPasteboard = function(pasteboard) {
  var range, text;
  text = pasteboard.getData('Text');
  this.replaceSelection(text);
  range = this.selectedRange();
  range.start += range.length;
  range.length = 0;
  this.setSelectedRange(range);
};

/**
 * Handles keyDown events. This method essentially just delegates to other,
 * more semantic, methods based on the modifier keys and the pressed key of the
 * event.
 *
 * @private
 */
TextField.prototype.keyDown = function(event) {
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
        var self = this;
        this.rollbackInvalidChanges(function() {
          return self[action](event);
        });
        break;
    }
  }
};

/**
 * Handles inserting characters based on the typed key.
 *
 * @private
 */
TextField.prototype.keyPress = function(event) {
  var keyCode = event.keyCode;
  if (!event.metaKey && !event.ctrlKey &&
      keyCode !== KEYS.ENTER &&
      keyCode !== KEYS.TAB &&
      keyCode !== KEYS.BACKSPACE) {
    event.preventDefault();
    if (event.charCode !== 0) {
      var self = this;
      var charCode = event.charCode || event.keyCode;
      this.rollbackInvalidChanges(function() {
        self.insertText(String.fromCharCode(charCode));
      });
    }
  }
};

/**
 * Handles keyup events.
 *
 * @private
 */
TextField.prototype.keyUp = function(event) {
  var self = this;
  this.rollbackInvalidChanges(function() {
    if (event.keyCode === KEYS.TAB) {
      self.selectAll(event);
    }
  });
};

/**
 * Handles paste events.
 *
 * @private
 */
TextField.prototype.paste = function(event) {
  var self = this;
  event.preventDefault();
  this.rollbackInvalidChanges(function() {
    self.readSelectionFromPasteboard(event.originalEvent.clipboardData);
  });
};

/**
 * Checks changes after invoking the passed function for validity and rolls
 * them back if the changes turned out to be invalid.
 *
 * @return {object} whatever object `callback` returns
 */
TextField.prototype.rollbackInvalidChanges = function(callback) {
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
};

/**
 * Handles clicks by resetting the selection affinity.
 *
 * @private
 */
TextField.prototype.click = function(event) {
  this.selectionAffinity = AFFINITY.NONE;
};

TextField.prototype.on = function() {
  this.element.on.apply(this.element, arguments);
};

TextField.prototype.off = function() {
  this.element.off.apply(this.element, arguments);
};

/**
 * Gets the formatted text value. This is the same as the value of the
 * underlying input element.
 *
 * @return {string}
 */
TextField.prototype.text = function() {
  return this.element.val();
};

/**
 * Sets the formatted text value. This generally should not be used. Instead,
 * use the value setter.
 *
 * @param {string} text
 */
TextField.prototype.setText = function(text) {
  this.element.val(text);
};

/**
 * Gets the object value. This is the value that should be considered the
 * "real" value of the field.
 *
 * @return {object}
 */
TextField.prototype.value = function() {
  var self = this;
  var value = this.text();
  var delegate = this.delegate();
  var formatter = this.formatter();
  if (!formatter) { return value; }

  return formatter.parse(value, function(errorType) {
    if (delegate) {
      if (typeof delegate.textFieldDidFailToParseString === 'function') {
        delegate.textFieldDidFailToParseString(self, value, errorType);
      }
    }
  });
};

/**
 * Sets the object value of the field.
 *
 * @param {string} value
 */
TextField.prototype.setValue = function(value) {
  if (this._formatter) {
    value = this._formatter.format(value);
  }
  this.setText("" + value);
  return this.element.trigger('change');
};

/**
 * Gets the current formatter. Formatters are used to translate between #text
 * and #value properties of the field.
 *
 * @return {Formatter}
 */
TextField.prototype.formatter = function() {
  if (!this._formatter) {
    this._formatter = new Formatter();
    var maximumLengthString = this.element.attr('maxlength');
    if (maximumLengthString !== undefined && maximumLengthString !== null) {
      this._formatter.maximumLength = parseInt(maximumLengthString, 10);
    }
  }

  return this._formatter;
};

/**
 * Sets the current formatter.
 *
 * @param {Formatter} formatter
 */
TextField.prototype.setFormatter = function(formatter) {
  var value = this.value();
  this._formatter = formatter;
  this.setValue(value);
};

/**
 * Gets the range of the current selection.
 *
 * @return {{start: number, length: number}}
 */
TextField.prototype.selectedRange = function() {
  var caret = this.element.caret();
  return {
    start: caret.start,
    length: caret.end - caret.start
  };
};

/**
 * Sets the range of the current selection without changing the affinity.
 *
 * @return {{start: number, length: number}}
 */
TextField.prototype.setSelectedRange = function(range) {
  return this.setSelectedRangeWithAffinity(range, this.selectionAffinity);
};

/**
 * Sets the range of the current selection and the selection affinity.
 *
 * @param {{start: number, length: number}} range
 * @param {AFFINITY} affinity
 */
TextField.prototype.setSelectedRangeWithAffinity = function(range, affinity) {
  var min = 0;
  var max = this.text().length;
  var caret = {
    start: Math.max(min, Math.min(max, range.start)),
    end: Math.max(min, Math.min(max, range.start + range.length))
  };
  this.element.caret(caret);
  this.selectionAffinity = range.length === 0 ? AFFINITY.NONE : affinity;
};

/**
 * Gets the position of the current selection's anchor point, i.e. the point
 * that the selection extends from, if any.
 *
 * @return {number}
 */
TextField.prototype.selectionAnchor = function() {
  var range = this.selectedRange();
  switch (this.selectionAffinity) {
    case AFFINITY.UPSTREAM:
      return range.start + range.length;
    case AFFINITY.DOWNSTREAM:
      return range.start;
    default:
      return null;
  }
};

/**
 * Undo Support
 */

/**
 * Triggers an undo in the underlying UndoManager, if applicable.
 *
 * @param {Event} event
 */
TextField.prototype.undo = function(event) {
  if (this.undoManager().canUndo()) {
    this.undoManager().undo();
  }
  event.preventDefault();
};

/**
 * Triggers a redo in the underlying UndoManager, if applicable.
 *
 * @param {Event} event
 */
TextField.prototype.redo = function(event) {
  if (this.undoManager().canRedo()) {
    this.undoManager().redo();
  }
  event.preventDefault();
};

/**
 * Gets the UndoManager for this text field.
 *
 * @return {UndoManager}
 */
TextField.prototype.undoManager = function() {
  return this._undoManager || (this._undoManager = new UndoManager());
};

/**
 * Gets whether this text field records undo actions with its undo manager.
 *
 * @return {boolean}
 */
TextField.prototype.allowsUndo = function() {
  return this._allowsUndo;
};

/**
 * Sets whether this text field records undo actions with its undo manager.
 *
 * @param {boolean} allowsUndo
 */
TextField.prototype.setAllowsUndo = function(allowsUndo) {
  this._allowsUndo = allowsUndo;
};

/**
 * Applies the given change as an undo/redo.
 *
 * @private
 */
TextField.prototype._applyChangeFromUndoManager = function(change) {
  this.undoManager().proxyFor(this)._applyChangeFromUndoManager(change);

  if (this.undoManager().isUndoing()) {
    this.setText(change.current.text);
    this.setSelectedRange(change.current.selectedRange);
  } else {
    this.setText(change.proposed.text);
    this.setSelectedRange(change.proposed.selectedRange);
  }

  this._textDidChange();
};

/**
 * Enabled/disabled support
 */

TextField.prototype._enabled = true;

TextField.prototype.isEnabled = function() {
  return this._enabled;
};

TextField.prototype.setEnabled = function(enabled) {
  this._enabled = enabled;
  this._syncPlaceholder();
};

TextField.prototype.hasFocus = function() {
  return this.element.get(0).ownerDocument.activeElement === this.element.get(0);
};

TextField.prototype._focusin = function(event) {
  this._textFieldDidBeginEditing();
  return this._syncPlaceholder();
};

TextField.prototype._focusout = function(event) {
  this._textFieldDidEndEditing();
  return this._syncPlaceholder();
};

TextField.prototype._didEndEditingButKeptFocus = false;

/**
 * Removes focus from this field if it has focus.
 */
TextField.prototype.becomeFirstResponder = function(event) {
  var self = this;
  this.element.focus();
  this.rollbackInvalidChanges(function() {
    self.element.select();
    self._syncPlaceholder();
  });
};

/**
 * Removes focus from this field if it has focus.
 *
 * @param {Event} event
 */
TextField.prototype.resignFirstResponder = function(event) {
  if (event !== undefined && event !== null) {
    event.preventDefault();
  }
  this.element.blur();
  this._syncPlaceholder();
};

/*
 * Placeholder support
 */

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
};

TextField.prototype.focusedPlaceholder = function() {
  return this._focusedPlaceholder;
};

TextField.prototype.setFocusedPlaceholder = function(_focusedPlaceholder) {
  this._focusedPlaceholder = _focusedPlaceholder;
  this._syncPlaceholder();
};

TextField.prototype.unfocusedPlaceholder = function() {
  return this._unfocusedPlaceholder;
};

TextField.prototype.setUnfocusedPlaceholder = function(_unfocusedPlaceholder) {
  this._unfocusedPlaceholder = _unfocusedPlaceholder;
  this._syncPlaceholder();
};

TextField.prototype.placeholder = function() {
  return this._placeholder;
};

TextField.prototype.setPlaceholder = function(_placeholder) {
  this._placeholder = _placeholder;
  this.element.attr('placeholder', this._placeholder);
};

TextField.prototype._syncPlaceholder = function() {
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
};

/**
 * Keybindings
 */

TextField.prototype._buildKeybindings = function() {
  var doc = this.element.get(0).ownerDocument;
  var win = doc.defaultView || doc.parentWindow;
  var userAgent = win.navigator.userAgent;
  var osx = /^Mozilla\/[\d\.]+ \(Macintosh/.test(userAgent);
  this._bindings = keyBindingsForPlatform(osx ? 'OSX' : 'Default');
};

/**
 * Debug support
 */

TextField.prototype.inspect = function() {
  return '#<TextField text="' + this.text() + '">';
};

function TextFieldStateChange(field) {
  this.field = field;
}

TextFieldStateChange.prototype.field = null;

TextFieldStateChange.prototype.current = null;

TextFieldStateChange.prototype.proposed = null;


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

TextFieldStateChange.prototype.hasChanges = function() {
  this.recomputeDiff();
  return this.current.text !== this.proposed.text ||
    this.current.selectedRange.start !== this.proposed.selectedRange.start ||
    this.current.selectedRange.length !== this.proposed.selectedRange.length;
};

TextFieldStateChange.prototype.recomputeDiff = function() {
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
};

module.exports = TextField;

},{"./formatter":9,"./undo_manager":14,"./keybindings":17,"./utils":16}],15:[function(require,module,exports){
var AMEX        = 'amex';
var DISCOVER    = 'discover';
var JCB         = 'jcb';
var MASTERCARD  = 'mastercard';
var VISA        = 'visa';

function determineCardType(pan) {
  if (pan === null || pan === undefined) {
    return null;
  }

  pan = pan.toString();
  var firsttwo = parseInt(pan.slice(0, 2), 10);
  var iin = parseInt(pan.slice(0, 6), 10);
  var halfiin = parseInt(pan.slice(0, 3), 10);

  if (pan[0] === '4') {
    return VISA;
  } else if (pan.slice(0, 4) === '6011' || firsttwo === 65 || (halfiin >= 664 && halfiin <= 649) || (iin >= 622126 && iin <= 622925)) {
    return DISCOVER;
  } else if (pan.slice(0, 4) === '2131' || pan.slice(0, 4) === '1800' || firsttwo === 35) {
    return JCB;
  } else if (firsttwo >= 51 && firsttwo <= 55) {
    return MASTERCARD;
  } else if (firsttwo === 34 || firsttwo === 37) {
    return AMEX;
  }
}

function luhnCheck(pan) {
  var sum = 0;
  var flip = true;
  for (var i = pan.length - 1; i >= 0; i--) {
    digit = parseInt(pan.charAt(i), 10);
    sum += (flip = !flip) ? Math.floor((digit * 2) / 10) + Math.floor(digit * 2 % 10) : digit;
  }

  return sum % 10 === 0;
}

function validCardLength(pan) {
  switch (determineCardType(pan)) {
    case VISA:
      return pan.length === 13 || pan.length === 16;
    case DISCOVER: case MASTERCARD:
      return pan.length === 16;
    case JCB:
      return pan.length === 15 || pan.length === 16;
    case AMEX:
      return pan.length === 15;
    default:
      return false;
  }
}

module.exports = {
  determineCardType: determineCardType,
  luhnCheck: luhnCheck,
  validCardLength: validCardLength,
  AMEX: AMEX,
  DISCOVER: DISCOVER,
  JCB: JCB,
  MASTERCARD: MASTERCARD,
  VISA: VISA
};

},{}],16:[function(require,module,exports){
var DIGITS_PATTERN = /^\d*$/;
var SURROUNDING_SPACE_PATTERN = /(^\s+|\s+$)/;

function isDigits(string) {
  return DIGITS_PATTERN.test(string);
}

function startsWith(prefix, string) {
  return string.slice(0, prefix.length) === prefix;
}

function endsWith(suffix, string) {
  return string.slice(string.length - suffix.length) === suffix;
}

var trim;
if (typeof ''.trim === 'function') {
  trim = function(string) {
    return string.trim();
  };
} else {
  trim = function(string) {
    return string.replace(SURROUNDING_SPACE_PATTERN, '');
  };
}

function zpad(length, n) {
  var result = ''+n;
  while (result.length < length) {
    result = '0'+result;
  }
  return result;
}

function zpad2(n) {
  return zpad(2, n);
}

// PhantomJS 1.9 does not have Function#bind.
function bind(fn, context) {
  if (typeof fn.bind === 'function') {
    return fn.bind(context);
  } else {
    return function() {
      return fn.apply(context, arguments);
    };
  }
}

module.exports = {
  isDigits: isDigits,
  startsWith: startsWith,
  endsWith: endsWith,
  trim: trim,
  zpad: zpad,
  zpad2: zpad2,
  bind: bind
};

},{}],17:[function(require,module,exports){
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

function BindingSet(platform) {
  this.platform = platform;
  this.bindings = {};
}

BindingSet.prototype.platform = null;
BindingSet.prototype.bindings = null;

BindingSet.prototype.bind = function(keyCode, modifiers, action) {
  if (!this.bindings[keyCode]) { this.bindings[keyCode] = {}; }
  this.bindings[keyCode][modifiers || 0] = action;
};

BindingSet.prototype.actionForEvent = function(event) {
  var bindingsForKeyCode = this.bindings[event.keyCode];
  if (bindingsForKeyCode) {
    var modifiers = 0;
    if (event.altKey) { modifiers |= ALT; }
    if (event.ctrlKey) { modifiers |= CTRL; }
    if (event.metaKey) { modifiers |= META; }
    if (event.shiftKey) { modifiers |= SHIFT; }
    return bindingsForKeyCode[modifiers];
  }
};

module.exports = {
  KEYS: KEYS,
  keyBindingsForPlatform: keyBindingsForPlatform
};

},{}],10:[function(require,module,exports){
(function() {
  var CURRENCY, CurrencyDefaults, DEFAULT_COUNTRY, DEFAULT_LOCALE, Formatter, LocaleDefaults, NONE, NumberFormatter, PERCENT, RegionDefaults, StyleDefaults, endsWith, get, isDigits, splitLocaleComponents, startsWith, stround, trim, zpad, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Formatter = require('./formatter');

  _ref = require('./utils'), isDigits = _ref.isDigits, startsWith = _ref.startsWith, endsWith = _ref.endsWith, trim = _ref.trim, zpad = _ref.zpad;

  stround = require('stround');

  NONE = 0;

  CURRENCY = 1;

  PERCENT = 2;

  DEFAULT_LOCALE = 'en-US';

  DEFAULT_COUNTRY = 'US';

  splitLocaleComponents = function(locale) {
    var match, _ref1, _ref2;
    match = locale.match(/^([a-z][a-z])(?:[-_]([a-z][a-z]))?$/i);
    return {
      lang: match != null ? (_ref1 = match[1]) != null ? _ref1.toLowerCase() : void 0 : void 0,
      country: match != null ? (_ref2 = match[2]) != null ? _ref2.toUpperCase() : void 0 : void 0
    };
  };

  get = function() {
    var args, key, object, value;
    object = arguments[0], key = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    value = object != null ? object[key] : void 0;
    if (typeof value === 'function') {
      value = value.apply(null, args);
    }
    return value;
  };

  NumberFormatter = (function(_super) {
    __extends(NumberFormatter, _super);

    NumberFormatter.prototype._allowsFloats = null;

    NumberFormatter.prototype._alwaysShowsDecimalSeparator = null;

    NumberFormatter.prototype._countryCode = null;

    NumberFormatter.prototype._currencyCode = null;

    NumberFormatter.prototype._exponent = null;

    NumberFormatter.prototype._groupingSeparator = null;

    NumberFormatter.prototype._groupingSize = null;

    NumberFormatter.prototype._lenient = false;

    NumberFormatter.prototype._locale = null;

    NumberFormatter.prototype._internationalCurrencySymbol = null;

    NumberFormatter.prototype._maximumFractionDigits = null;

    NumberFormatter.prototype._minimumFractionDigits = null;

    NumberFormatter.prototype._maximumIntegerDigits = null;

    NumberFormatter.prototype._minimumIntegerDigits = null;

    NumberFormatter.prototype._maximum = null;

    NumberFormatter.prototype._minimum = null;

    NumberFormatter.prototype._notANumberSymbol = null;

    NumberFormatter.prototype._nullSymbol = null;

    NumberFormatter.prototype._numberStyle = null;

    NumberFormatter.prototype._roundingMode = null;

    NumberFormatter.prototype._usesGroupingSeparator = null;

    NumberFormatter.prototype._zeroSymbol = null;

    function NumberFormatter() {
      this._locale = 'en';
      this.setNumberStyle(NONE);
    }

    NumberFormatter.prototype.allowsFloats = function() {
      return this._get('allowsFloats');
    };

    NumberFormatter.prototype.setAllowsFloats = function(allowsFloats) {
      this._allowsFloats = allowsFloats;
      return this;
    };

    NumberFormatter.prototype.alwaysShowsDecimalSeparator = function() {
      return this._get('alwaysShowsDecimalSeparator');
    };

    NumberFormatter.prototype.setAlwaysShowsDecimalSeparator = function(alwaysShowsDecimalSeparator) {
      this._alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator;
      return this;
    };

    NumberFormatter.prototype.countryCode = function() {
      return this._countryCode || DEFAULT_COUNTRY;
    };

    NumberFormatter.prototype.setCountryCode = function(countryCode) {
      this._countryCode = countryCode;
      return this;
    };

    NumberFormatter.prototype.currencyCode = function() {
      return this._get('currencyCode');
    };

    NumberFormatter.prototype.setCurrencyCode = function(currencyCode) {
      this._currencyCode = currencyCode;
      return this;
    };

    NumberFormatter.prototype.currencySymbol = function() {
      if (this._shouldShowNativeCurrencySymbol()) {
        return this._get('currencySymbol');
      } else {
        return this._get('internationalCurrencySymbol');
      }
    };

    NumberFormatter.prototype.setCurrencySymbol = function(currencySymbol) {
      this._currencySymbol = currencySymbol;
      return this;
    };

    NumberFormatter.prototype._shouldShowNativeCurrencySymbol = function() {
      var regionDefaultCurrencyCode, _ref1;
      regionDefaultCurrencyCode = this._regionDefaults().currencyCode;
      regionDefaultCurrencyCode = (_ref1 = typeof regionDefaultCurrencyCode === "function" ? regionDefaultCurrencyCode() : void 0) != null ? _ref1 : regionDefaultCurrencyCode;
      return this.currencyCode() === regionDefaultCurrencyCode;
    };

    NumberFormatter.prototype.decimalSeparator = function() {
      return this._get('decimalSeparator');
    };

    NumberFormatter.prototype.setDecimalSeparator = function(decimalSeparator) {
      this._decimalSeparator = decimalSeparator;
      return this;
    };

    NumberFormatter.prototype.groupingSeparator = function() {
      return this._get('groupingSeparator');
    };

    NumberFormatter.prototype.setGroupingSeparator = function(groupingSeparator) {
      this._groupingSeparator = groupingSeparator;
      return this;
    };

    NumberFormatter.prototype.groupingSize = function() {
      return this._get('groupingSize');
    };

    NumberFormatter.prototype.setGroupingSize = function(groupingSize) {
      this._groupingSize = groupingSize;
      return this;
    };

    NumberFormatter.prototype.internationalCurrencySymbol = function() {
      return this._get('internationalCurrencySymbol');
    };

    NumberFormatter.prototype.setInternationalCurrencySymbol = function(internationalCurrencySymbol) {
      this._internationalCurrencySymbol = internationalCurrencySymbol;
      return this;
    };

    NumberFormatter.prototype.isLenient = function() {
      return this._lenient;
    };

    NumberFormatter.prototype.setLenient = function(lenient) {
      this._lenient = lenient;
      return this;
    };

    NumberFormatter.prototype.locale = function() {
      return this._locale || DEFAULT_LOCALE;
    };

    NumberFormatter.prototype.setLocale = function(locale) {
      this._locale = locale;
      return this;
    };

    NumberFormatter.prototype.maximum = function() {
      return this._maximum;
    };

    NumberFormatter.prototype.setMaximum = function(max) {
      this._maximum = max;
      return this;
    };

    NumberFormatter.prototype.minimum = function() {
      return this._minimum;
    };

    NumberFormatter.prototype.setMinimum = function(min) {
      this._minimum = min;
      return this;
    };

    NumberFormatter.prototype.maximumFractionDigits = function() {
      return this._get('maximumFractionDigits');
    };

    NumberFormatter.prototype.setMaximumFractionDigits = function(maximumFractionDigits) {
      this._maximumFractionDigits = maximumFractionDigits;
      if (maximumFractionDigits < this.minimumFractionDigits()) {
        this.setMinimumFractionDigits(maximumFractionDigits);
      }
      return this;
    };

    NumberFormatter.prototype.minimumFractionDigits = function() {
      return this._get('minimumFractionDigits');
    };

    NumberFormatter.prototype.setMinimumFractionDigits = function(minimumFractionDigits) {
      this._minimumFractionDigits = minimumFractionDigits;
      if (minimumFractionDigits > this.maximumFractionDigits()) {
        this.setMaximumFractionDigits(minimumFractionDigits);
      }
      return this;
    };

    NumberFormatter.prototype.maximumIntegerDigits = function() {
      return this._get('maximumIntegerDigits');
    };

    NumberFormatter.prototype.setMaximumIntegerDigits = function(maximumIntegerDigits) {
      this._maximumIntegerDigits = maximumIntegerDigits;
      if (maximumIntegerDigits < this.minimumIntegerDigits()) {
        this.setMinimumIntegerDigits(maximumIntegerDigits);
      }
      return this;
    };

    NumberFormatter.prototype.minimumIntegerDigits = function() {
      return this._get('minimumIntegerDigits');
    };

    NumberFormatter.prototype.setMinimumIntegerDigits = function(minimumIntegerDigits) {
      this._minimumIntegerDigits = minimumIntegerDigits;
      if (minimumIntegerDigits > this.maximumIntegerDigits()) {
        this.setMaximumIntegerDigits(minimumIntegerDigits);
      }
      return this;
    };

    NumberFormatter.prototype.exponent = function() {
      return this._get('exponent');
    };

    NumberFormatter.prototype.setExponent = function(exponent) {
      this._exponent = exponent;
      return this;
    };

    NumberFormatter.prototype.negativeInfinitySymbol = function() {
      return this._get('negativeInfinitySymbol');
    };

    NumberFormatter.prototype.setNegativeInfinitySymbol = function(negativeInfinitySymbol) {
      this._negativeInfinitySymbol = negativeInfinitySymbol;
      return this;
    };

    NumberFormatter.prototype.negativePrefix = function() {
      return this._get('negativePrefix');
    };

    NumberFormatter.prototype.setNegativePrefix = function(prefix) {
      this._negativePrefix = prefix;
      return this;
    };

    NumberFormatter.prototype.negativeSuffix = function() {
      return this._get('negativeSuffix');
    };

    NumberFormatter.prototype.setNegativeSuffix = function(prefix) {
      this._negativeSuffix = prefix;
      return this;
    };

    NumberFormatter.prototype.notANumberSymbol = function() {
      return this._get('notANumberSymbol');
    };

    NumberFormatter.prototype.setNotANumberSymbol = function(notANumberSymbol) {
      this._notANumberSymbol = notANumberSymbol;
      return this;
    };

    NumberFormatter.prototype.nullSymbol = function() {
      return this._get('nullSymbol');
    };

    NumberFormatter.prototype.setNullSymbol = function(nullSymbol) {
      this._nullSymbol = nullSymbol;
      return this;
    };

    NumberFormatter.prototype.numberStyle = function() {
      return this._numberStyle;
    };

    NumberFormatter.prototype.setNumberStyle = function(numberStyle) {
      this._numberStyle = numberStyle;
      switch (this._numberStyle) {
        case NONE:
          this._styleDefaults = StyleDefaults.NONE;
          break;
        case PERCENT:
          this._styleDefaults = StyleDefaults.PERCENT;
          break;
        case CURRENCY:
          this._styleDefaults = StyleDefaults.CURRENCY;
          break;
        default:
          this._styleDefaults = null;
      }
      return this;
    };

    NumberFormatter.prototype.percentSymbol = function() {
      return this._get('percentSymbol');
    };

    NumberFormatter.prototype.setPercentSymbol = function(percentSymbol) {
      this._percentSymbol = percentSymbol;
      return this;
    };

    NumberFormatter.prototype.positiveInfinitySymbol = function() {
      return this._get('positiveInfinitySymbol');
    };

    NumberFormatter.prototype.setPositiveInfinitySymbol = function(positiveInfinitySymbol) {
      this._positiveInfinitySymbol = positiveInfinitySymbol;
      return this;
    };

    NumberFormatter.prototype.positivePrefix = function() {
      return this._get('positivePrefix');
    };

    NumberFormatter.prototype.setPositivePrefix = function(prefix) {
      this._positivePrefix = prefix;
      return this;
    };

    NumberFormatter.prototype.positiveSuffix = function() {
      return this._get('positiveSuffix');
    };

    NumberFormatter.prototype.setPositiveSuffix = function(prefix) {
      this._positiveSuffix = prefix;
      return this;
    };

    NumberFormatter.prototype.roundingMode = function() {
      return this._get('roundingMode');
    };

    NumberFormatter.prototype.setRoundingMode = function(roundingMode) {
      this._roundingMode = roundingMode;
      return this;
    };

    NumberFormatter.prototype.usesGroupingSeparator = function() {
      return this._get('usesGroupingSeparator');
    };

    NumberFormatter.prototype.setUsesGroupingSeparator = function(usesGroupingSeparator) {
      this._usesGroupingSeparator = usesGroupingSeparator;
      return this;
    };

    NumberFormatter.prototype.zeroSymbol = function() {
      return this._get('zeroSymbol');
    };

    NumberFormatter.prototype.setZeroSymbol = function(zeroSymbol) {
      this._zeroSymbol = zeroSymbol;
      return this;
    };

    NumberFormatter.prototype._get = function(attr) {
      var localeDefaults, regionDefaults, styleDefaults, value;
      value = this["_" + attr];
      if (value != null) {
        return value;
      }
      styleDefaults = this._styleDefaults;
      localeDefaults = this._localeDefaults();
      regionDefaults = this._regionDefaults();
      value = get(styleDefaults, attr, this, localeDefaults);
      if (value != null) {
        return value;
      }
      value = get(localeDefaults, attr, this, styleDefaults);
      if (value != null) {
        return value;
      }
      value = get(regionDefaults, attr, this, styleDefaults);
      if (value != null) {
        return value;
      }
      value = get(this._currencyDefaults(), attr, this, localeDefaults);
      if (value != null) {
        return value;
      }
      return null;
    };

    NumberFormatter.prototype.format = function(number) {
      var copiedCharacterCount, exponent, fractionPart, i, integerPart, integerPartWithGroupingSeparators, maximumFractionDigits, maximumIntegerDigits, minimumFractionDigits, minimumIntegerDigits, negative, negativeInfinitySymbol, notANumberSymbol, nullSymbol, positiveInfinitySymbol, result, rounded, string, unrounded, zeroSymbol, _i, _ref1, _ref2, _ref3, _ref4;
      if (number === "") {
        return "";
      }
      if (((zeroSymbol = this.zeroSymbol()) != null) && number === 0) {
        return zeroSymbol;
      }
      if (((nullSymbol = this.nullSymbol()) != null) && number === null) {
        return nullSymbol;
      }
      if (((notANumberSymbol = this.notANumberSymbol()) != null) && isNaN(number)) {
        return notANumberSymbol;
      }
      if (((positiveInfinitySymbol = this.positiveInfinitySymbol()) != null) && number === Infinity) {
        return positiveInfinitySymbol;
      }
      if (((negativeInfinitySymbol = this.negativeInfinitySymbol()) != null) && number === -Infinity) {
        return negativeInfinitySymbol;
      }
      integerPart = null;
      fractionPart = null;
      string = null;
      negative = number < 0;
      _ref1 = ("" + (Math.abs(number))).split('.'), integerPart = _ref1[0], fractionPart = _ref1[1];
      fractionPart || (fractionPart = '');
      if ((exponent = this.exponent()) != null) {
        _ref2 = stround.shift([negative, integerPart, fractionPart], exponent), negative = _ref2[0], integerPart = _ref2[1], fractionPart = _ref2[2];
        while (integerPart[0] === '0') {
          integerPart = integerPart.slice(1);
        }
      }
      maximumFractionDigits = this.maximumFractionDigits();
      if (fractionPart.length > maximumFractionDigits) {
        unrounded = "" + integerPart + "." + fractionPart;
        rounded = this._round(negative ? "-" + unrounded : unrounded);
        if (rounded[0] === '-') {
          rounded = rounded.slice(1);
        }
        _ref3 = rounded.split('.'), integerPart = _ref3[0], fractionPart = _ref3[1];
        fractionPart || (fractionPart = '');
      }
      minimumFractionDigits = this.minimumFractionDigits();
      while (fractionPart.length < minimumFractionDigits) {
        fractionPart += '0';
      }
      minimumIntegerDigits = this.minimumIntegerDigits();
      while (integerPart.length < minimumIntegerDigits) {
        integerPart = '0' + integerPart;
      }
      minimumFractionDigits = this.minimumFractionDigits();
      while (fractionPart.length > minimumFractionDigits && fractionPart.slice(-1) === '0') {
        fractionPart = fractionPart.slice(0, -1);
      }
      maximumIntegerDigits = this.maximumIntegerDigits();
      if ((maximumIntegerDigits != null) && integerPart.length > maximumIntegerDigits) {
        integerPart = integerPart.slice(-maximumIntegerDigits);
      }
      if (fractionPart.length > 0 || this.alwaysShowsDecimalSeparator()) {
        fractionPart = this.decimalSeparator() + fractionPart;
      }
      if (this.usesGroupingSeparator()) {
        integerPartWithGroupingSeparators = '';
        copiedCharacterCount = 0;
        for (i = _i = _ref4 = integerPart.length - 1; _ref4 <= 0 ? _i <= 0 : _i >= 0; i = _ref4 <= 0 ? ++_i : --_i) {
          if (copiedCharacterCount > 0 && copiedCharacterCount % this.groupingSize() === 0) {
            integerPartWithGroupingSeparators = this.groupingSeparator() + integerPartWithGroupingSeparators;
          }
          integerPartWithGroupingSeparators = integerPart[i] + integerPartWithGroupingSeparators;
          copiedCharacterCount++;
        }
        integerPart = integerPartWithGroupingSeparators;
      }
      result = integerPart + fractionPart;
      if (negative) {
        result = this.negativePrefix() + result + this.negativeSuffix();
      } else {
        result = this.positivePrefix() + result + this.positiveSuffix();
      }
      return result;
    };

    NumberFormatter.prototype._round = function(number) {
      return stround.round(number, this.maximumFractionDigits(), this.roundingMode());
    };

    NumberFormatter.prototype.parse = function(string, error) {
      var hasNegativePrefix, hasNegativeSuffix, hasPositivePrefix, hasPositiveSuffix, innerString, negativePrefix, negativeSuffix, positivePrefix, positiveSuffix, result;
      positivePrefix = this.positivePrefix();
      negativePrefix = this.negativePrefix();
      positiveSuffix = this.positiveSuffix();
      negativeSuffix = this.negativeSuffix();
      if (this.isLenient()) {
        string = string.replace(/\s/g, '');
        positivePrefix = trim(positivePrefix);
        negativePrefix = trim(negativePrefix);
        positiveSuffix = trim(positiveSuffix);
        negativeSuffix = trim(negativeSuffix);
      }
      if ((this.zeroSymbol() != null) && string === this.zeroSymbol()) {
        result = 0;
      } else if ((this.nullSymbol() != null) && string === this.nullSymbol()) {
        result = null;
      } else if ((this.notANumberSymbol() != null) && string === this.notANumberSymbol()) {
        result = NaN;
      } else if ((this.positiveInfinitySymbol() != null) && string === this.positiveInfinitySymbol()) {
        result = Infinity;
      } else if ((this.negativeInfinitySymbol() != null) && string === this.negativeInfinitySymbol()) {
        result = -Infinity;
      } else if (result == null) {
        hasNegativePrefix = startsWith(negativePrefix, string);
        hasNegativeSuffix = endsWith(negativeSuffix, string);
        if (hasNegativePrefix && (this.isLenient() || hasNegativeSuffix)) {
          innerString = string.slice(negativePrefix.length);
          if (hasNegativeSuffix) {
            innerString = innerString.slice(0, innerString.length - negativeSuffix.length);
          }
          result = this._parseAbsoluteValue(innerString, error);
          if (result != null) {
            result *= -1;
          }
        } else {
          hasPositivePrefix = startsWith(positivePrefix, string);
          hasPositiveSuffix = endsWith(positiveSuffix, string);
          if (this.isLenient() || (hasPositivePrefix && hasPositiveSuffix)) {
            innerString = string;
            if (hasPositivePrefix) {
              innerString = innerString.slice(positivePrefix.length);
            }
            if (hasPositiveSuffix) {
              innerString = innerString.slice(0, innerString.length - positiveSuffix.length);
            }
            result = this._parseAbsoluteValue(innerString, error);
          } else {
            if (typeof error === "function") {
              error('number-formatter.invalid-format');
            }
            return null;
          }
        }
      }
      if (result != null) {
        if ((this._minimum != null) && result < this._minimum) {
          if (typeof error === "function") {
            error('number-formatter.out-of-bounds.below-minimum');
          }
          return null;
        }
        if ((this._maximum != null) && result > this._maximum) {
          if (typeof error === "function") {
            error('number-formatter.out-of-bounds.above-maximum');
          }
          return null;
        }
      }
      return result;
    };

    NumberFormatter.prototype._parseAbsoluteValue = function(string, error) {
      var exponent, fractionPart, groupPart, groupParts, groupingSize, integerPart, negative, number, parts, _i, _len, _ref1, _ref2;
      if (string.length === 0) {
        if (typeof error === "function") {
          error('number-formatter.invalid-format');
        }
        return null;
      }
      parts = string.split(this.decimalSeparator());
      if (parts.length > 2) {
        if (typeof error === "function") {
          error('number-formatter.invalid-format');
        }
        return null;
      }
      integerPart = parts[0];
      fractionPart = parts[1] || '';
      if (this.usesGroupingSeparator()) {
        groupingSize = this.groupingSize();
        groupParts = integerPart.split(this.groupingSeparator());
        if (!this.isLenient()) {
          if (groupParts.length > 1) {
            if (groupParts[0].length > groupingSize) {
              if (typeof error === "function") {
                error('number-formatter.invalid-format.grouping-size');
              }
              return null;
            }
            _ref1 = groupParts.slice(1);
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              groupPart = _ref1[_i];
              if (groupPart.length !== groupingSize) {
                if (typeof error === "function") {
                  error('number-formatter.invalid-format.grouping-size');
                }
                return null;
              }
            }
          }
        }
        integerPart = groupParts.join('');
      }
      if (!isDigits(integerPart) || !isDigits(fractionPart)) {
        if (typeof error === "function") {
          error('number-formatter.invalid-format');
        }
        return null;
      }
      if ((exponent = this.exponent()) != null) {
        _ref2 = stround.shift([negative, integerPart, fractionPart], -exponent), negative = _ref2[0], integerPart = _ref2[1], fractionPart = _ref2[2];
      }
      number = Number(integerPart) + Number("." + (fractionPart || '0'));
      if (!this.allowsFloats() && number !== ~~number) {
        if (typeof error === "function") {
          error('number-formatter.floats-not-allowed');
        }
        return null;
      }
      return number;
    };

    NumberFormatter.prototype._currencyDefaults = function() {
      var key, result, value, _ref1, _ref2;
      result = {};
      _ref1 = CurrencyDefaults["default"];
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        value = _ref1[key];
        result[key] = value;
      }
      _ref2 = CurrencyDefaults[this.currencyCode()];
      for (key in _ref2) {
        if (!__hasProp.call(_ref2, key)) continue;
        value = _ref2[key];
        result[key] = value;
      }
      return result;
    };

    NumberFormatter.prototype._regionDefaults = function() {
      var key, result, value, _ref1, _ref2;
      result = {};
      _ref1 = RegionDefaults["default"];
      for (key in _ref1) {
        if (!__hasProp.call(_ref1, key)) continue;
        value = _ref1[key];
        result[key] = value;
      }
      _ref2 = RegionDefaults[this.countryCode()];
      for (key in _ref2) {
        if (!__hasProp.call(_ref2, key)) continue;
        value = _ref2[key];
        result[key] = value;
      }
      return result;
    };

    NumberFormatter.prototype._localeDefaults = function() {
      var countryCode, defaultFallbacks, defaults, key, lang, locale, result, value, _i, _len;
      locale = this.locale();
      countryCode = this.countryCode();
      lang = splitLocaleComponents(locale).lang;
      result = {};
      defaultFallbacks = [RegionDefaults["default"], LocaleDefaults["default"], RegionDefaults[countryCode], LocaleDefaults[lang], LocaleDefaults[locale]];
      for (_i = 0, _len = defaultFallbacks.length; _i < _len; _i++) {
        defaults = defaultFallbacks[_i];
        for (key in defaults) {
          if (!__hasProp.call(defaults, key)) continue;
          value = defaults[key];
          result[key] = value;
        }
      }
      return result;
    };

    return NumberFormatter;

  })(Formatter);

  NumberFormatter.prototype.stringFromNumber = NumberFormatter.prototype.format;

  NumberFormatter.prototype.numberFromString = NumberFormatter.prototype.parse;

  NumberFormatter.prototype.minusSign = NumberFormatter.prototype.negativePrefix;

  NumberFormatter.prototype.setMinusSign = NumberFormatter.prototype.setNegativePrefix;

  NumberFormatter.prototype.plusSign = NumberFormatter.prototype.positivePrefix;

  NumberFormatter.prototype.setPlusSign = NumberFormatter.prototype.setPositivePrefix;

  NumberFormatter.Rounding = stround.modes;

  NumberFormatter.Style = {
    NONE: NONE,
    CURRENCY: CURRENCY,
    PERCENT: PERCENT
  };

  StyleDefaults = {
    NONE: {
      usesGroupingSeparator: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      minimumIntegerDigits: 0
    },
    PERCENT: {
      usesGroupingSeparator: false,
      exponent: 2,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      minimumIntegerDigits: 1,
      positiveSuffix: function(formatter) {
        return formatter.percentSymbol();
      },
      negativeSuffix: function(formatter) {
        return formatter.percentSymbol();
      }
    },
    CURRENCY: {
      positivePrefix: function(formatter, locale) {
        return get(locale, 'positiveCurrencyPrefix', formatter, this);
      },
      positiveSuffix: function(formatter, locale) {
        return get(locale, 'positiveCurrencySuffix', formatter, this);
      },
      negativePrefix: function(formatter, locale) {
        return get(locale, 'negativeCurrencyPrefix', formatter, this);
      },
      negativeSuffix: function(formatter, locale) {
        return get(locale, 'negativeCurrencySuffix', formatter, this);
      }
    }
  };

  LocaleDefaults = {
    "default": {
      allowsFloats: true,
      alwaysShowsDecimalSeparator: false,
      decimalSeparator: '.',
      groupingSeparator: ',',
      groupingSize: 3,
      negativeInfinitySymbol: '-∞',
      negativePrefix: '-',
      negativeSuffix: '',
      notANumberSymbol: 'NaN',
      nullSymbol: '',
      percentSymbol: '%',
      positiveInfinitySymbol: '+∞',
      positivePrefix: '',
      positiveSuffix: '',
      roundingMode: NumberFormatter.Rounding.HALF_EVEN,
      positiveCurrencyPrefix: function(formatter) {
        return formatter.currencySymbol();
      },
      positiveCurrencySuffix: '',
      negativeCurrencyPrefix: function(formatter) {
        return "(" + (formatter.currencySymbol());
      },
      negativeCurrencySuffix: function(formatter) {
        return ')';
      }
    },
    fr: {
      decimalSeparator: ',',
      groupingSeparator: ' ',
      percentSymbol: ' %',
      positiveCurrencyPrefix: '',
      positiveCurrencySuffix: function(formatter) {
        return " " + (formatter.currencySymbol());
      },
      negativeCurrencyPrefix: function(formatter) {
        return '(';
      },
      negativeCurrencySuffix: function(formatter) {
        return " " + (formatter.currencySymbol()) + ")";
      }
    },
    ja: {
      negativeCurrencyPrefix: function(formatter) {
        return "-" + (formatter.currencySymbol());
      },
      negativeCurrencySuffix: ''
    },
    'en-GB': {
      negativeCurrencyPrefix: function(formatter) {
        return "-" + (formatter.currencySymbol());
      },
      negativeCurrencySuffix: ''
    }
  };

  RegionDefaults = {
    CA: {
      currencyCode: 'CAD'
    },
    DE: {
      currencyCode: 'EUR'
    },
    ES: {
      currencyCode: 'EUR'
    },
    FR: {
      currencyCode: 'EUR'
    },
    GB: {
      currencyCode: 'GBP'
    },
    JP: {
      currencyCode: 'JPY'
    },
    US: {
      currencyCode: 'USD'
    }
  };

  CurrencyDefaults = {
    "default": {
      currencySymbol: function(formatter) {
        return formatter.currencyCode();
      },
      internationalCurrencySymbol: function(formatter) {
        return formatter.currencyCode();
      },
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      minimumIntegerDigits: 1,
      usesGroupingSeparator: true
    },
    CAD: {
      currencySymbol: '$',
      internationalCurrencySymbol: 'CA$'
    },
    EUR: {
      currencySymbol: '€'
    },
    GBP: {
      currencySymbol: '£',
      internationalCurrencySymbol: 'GB£'
    },
    JPY: {
      currencySymbol: '¥',
      internationalCurrencySymbol: 'JP¥',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    },
    USD: {
      currencySymbol: '$',
      internationalCurrencySymbol: 'US$'
    }
  };

  module.exports = NumberFormatter;

}).call(this);

},{"./formatter":9,"./utils":16,"stround":18}],18:[function(require,module,exports){
/** @const */ var CEILING = 0;
/** @const */ var FLOOR = 1;
/** @const */ var DOWN = 2;
/** @const */ var UP = 3;
/** @const */ var HALF_EVEN = 4;
/** @const */ var HALF_DOWN = 5;
/** @const */ var HALF_UP = 6;

/**
 * Enum for the available rounding modes.
 *
 * @type {number}
 */
var RoundingMode = {
  CEILING: CEILING,
  FLOOR: FLOOR,
  DOWN: DOWN,
  UP: UP,
  HALF_EVEN: HALF_EVEN,
  HALF_DOWN: HALF_DOWN,
  HALF_UP: HALF_UP
};

/** @const */ var NEG = '-';
/** @const */ var SEP = '.';
/** @const */ var NEG_PATTERN = '-';
/** @const */ var SEP_PATTERN = '\\.';
/** @const */ var NUMBER_PATTERN = new RegExp('^('+NEG_PATTERN+')?(\\d*)(?:'+SEP_PATTERN+'(\\d*))?$');

/**
 * Increments the given integer represented by a string by one.
 *
 *   increment('1');  // '2'
 *   increment('99'); // '100'
 *   increment('');   // '1'
 *
 * @param {string} strint
 * @return {string}
 * @private
 */
function increment(strint) {
  var length = strint.length;

  if (length === 0) {
    return '1';
  }

  var last = parseInt(strint[length-1], 10);

  if (last === 9) {
    return increment(strint.slice(0, length-1)) + '0';
  } else {
    return strint.slice(0, length-1) + (last+1);
  }
}

/**
 * Parses the given decimal string into its component parts.
 *
 *   parse('3.14');  // [false, '3', '14']
 *   parse('-3.45'); // [true, '3', '45']
 *
 * @param {string} strnum
 * @return {Array}
 */
function parse(strnum) {
  switch (strnum) {
    case 'NaN': case 'Infinity': case '-Infinity':
      return strnum;
  }

  var match = strnum.match(NUMBER_PATTERN);

  if (!match) {
    throw new Error('cannot round malformed number: '+strnum);
  }

  return [
    match[1] !== undefined,
    match[2],
    match[3] || ''
  ];
}

/**
 * Format the given number configuration as a number string.
 *
 *   format([false, '12', '34']); // '12.34'
 *   format([true, '8', '']);     // '-8'
 *   format([true, '', '7']);     // '-0.7'
 *
 * @param {Array} parts
 * @return {string}
 */
function format(parts) {
  var negative = parts[0];
  var intPart = parts[1];
  var fracPart = parts[2];

  if (intPart.length === 0) {
    intPart = '0';
  } else {
    var firstNonZeroIndex;
    for (firstNonZeroIndex = 0; firstNonZeroIndex < intPart.length; firstNonZeroIndex++) {
      if (intPart[firstNonZeroIndex] !== '0') {
        break;
      }
    }

    if (firstNonZeroIndex !== intPart.length) {
      intPart = intPart.slice(firstNonZeroIndex);
    }
  }

  return (negative ? NEG+intPart : intPart) + (fracPart.length ? SEP+fracPart : '');
}

/**
 * Shift the exponent of the given number (as a string) by the given amount.
 *
 *   shift('12', 2);  // '1200'
 *   shift('12', -2); // '0.12'
 *
 * @param {string|number|Array} strnum
 * @param {number} exponent
 * @return {string|Array}
 */
function shift(strnum, exponent) {
  if (typeof strnum === 'number') {
    strnum = ''+strnum;
  }

  var parsed;
  var shouldFormatResult = true;

  if (typeof strnum === 'string') {
    parsed = parse(strnum);

    if (typeof parsed === 'string') {
      return strnum;
    }

  } else {
    parsed = strnum;
    shouldFormatResult = false;
  }

  var negative = parsed[0];
  var intPart = parsed[1];
  var fracPart = parsed[2];
  var partToMove;

  if (exponent > 0) {
    partToMove = fracPart.slice(0, exponent);
    while (partToMove.length < exponent) {
      partToMove += '0';
    }
    intPart += partToMove;
    fracPart = fracPart.slice(exponent);
  } else if (exponent < 0) {
    while (intPart.length < -exponent) {
      intPart = '0' + intPart;
    }
    partToMove = intPart.slice(intPart.length + exponent);
    fracPart = partToMove + fracPart;
    intPart = intPart.slice(0, intPart.length - partToMove.length);
  }

  var result = [negative, intPart, fracPart];

  if (shouldFormatResult) {
    return format(result);
  } else {
    return result;
  }
}

/**
 * Round the given number represented by a string according to the given
 * precision and mode.
 *
 * @param {string|number} strnum
 * @param {number} precision
 * @param {RoundingMode} mode
 * @return {string}
 */
function round(strnum, precision, mode) {
  if (typeof strnum === 'number') {
    strnum = ''+strnum;
  }

  if (typeof strnum !== 'string') {
    throw new Error('expected a string or number, got: '+strnum);
  }

  if (strnum.length === 0) {
    return strnum;
  }

  if (typeof precision === 'undefined') {
    precision = 0;
  }

  if (typeof mode === 'undefined') {
    mode = HALF_EVEN;
  }

  var parsed = parse(strnum);

  if (typeof parsed === 'string') {
    return parsed;
  }

  if (precision > 0) {
    parsed = shift(parsed, precision);
  }

  var negative = parsed[0];
  var intPart = parsed[1];
  var fracPart = parsed[2];

  switch (mode) {
    case CEILING: case FLOOR: case UP:
      var foundNonZeroDigit = false;
      for (var i = 0, length = fracPart.length; i < length; i++) {
        if (fracPart[i] !== '0') {
          foundNonZeroDigit = true;
          break;
        }
      }
      if (foundNonZeroDigit) {
        if (mode === UP || (negative !== (mode === CEILING))) {
          intPart = increment(intPart);
        }
      }
      break;

    case HALF_EVEN: case HALF_DOWN: case HALF_UP:
      var shouldRoundUp = false;
      var firstFracPartDigit = parseInt(fracPart[0], 10);

      if (firstFracPartDigit > 5) {
        shouldRoundUp = true;
      } else if (firstFracPartDigit === 5) {
        if (mode === HALF_UP) {
          shouldRoundUp = true;
        }

        if (!shouldRoundUp) {
          for (var i = 1, length = fracPart.length; i < length; i++) {
            if (fracPart[i] !== '0') {
              shouldRoundUp = true;
              break;
            }
          }
        }

        if (!shouldRoundUp && mode === HALF_EVEN) {
          var lastIntPartDigit = parseInt(intPart[intPart.length-1], 10);
          shouldRoundUp = lastIntPartDigit % 2 !== 0;
        }
      }

      if (shouldRoundUp) {
        intPart = increment(intPart);
      }
      break;
  }

  return format(shift([negative, intPart, ''], -precision));
}

module.exports = {
  round: round,
  shift: shift,
  modes: RoundingMode
};

},{}]},{},[1])(1)
});
;