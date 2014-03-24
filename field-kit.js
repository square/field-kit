(function(e){if("function"==typeof bootstrap)bootstrap("fieldkit",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeFieldKit=e}else"undefined"!=typeof window?window.FieldKit=e():global.FieldKit=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function() {
  var FieldKit;

  FieldKit = {
    AdaptiveCardFormatter: require('./adaptive_card_formatter'),
    AmexCardFormatter: require('./amex_card_formatter'),
    CardTextField: require('./card_text_field'),
    DefaultCardFormatter: require('./default_card_formatter'),
    DelimitedTextFormatter: require('./delimited_text_formatter'),
    ExpiryDateField: require('./expiry_date_field'),
    ExpiryDateFormatter: require('./expiry_date_formatter'),
    Formatter: require('./formatter'),
    NumberFormatter: require('./number_formatter'),
    PhoneFormatter: require('./phone_formatter'),
    SocialSecurityNumberFormatter: require('./social_security_number_formatter'),
    TextField: require('./text_field'),
    UndoManager: require('./undo_manager')
  };

  module.exports = FieldKit;

}).call(this);

},{"./adaptive_card_formatter":2,"./amex_card_formatter":3,"./card_text_field":4,"./default_card_formatter":5,"./delimited_text_formatter":6,"./expiry_date_field":7,"./expiry_date_formatter":8,"./number_formatter":9,"./formatter":10,"./phone_formatter":11,"./social_security_number_formatter":12,"./text_field":13,"./undo_manager":14}],10:[function(require,module,exports){
(function() {
  var Formatter;

  Formatter = (function() {
    function Formatter() {}

    Formatter.prototype.maximumLength = null;

    Formatter.prototype.format = function(text) {
      if (text == null) {
        text = '';
      }
      if (this.maximumLength != null) {
        text = text.substring(0, this.maximumLength);
      }
      return text;
    };

    Formatter.prototype.parse = function(text, error) {
      if (text == null) {
        text = '';
      }
      if (this.maximumLength != null) {
        text = text.substring(0, this.maximumLength);
      }
      return text;
    };

    Formatter.prototype.isChangeValid = function(change, error) {
      var available, newText, selectedRange, text, truncatedLength, _ref;
      _ref = change.proposed, selectedRange = _ref.selectedRange, text = _ref.text;
      if ((this.maximumLength != null) && text.length > this.maximumLength) {
        available = this.maximumLength - (text.length - change.inserted.text.length);
        newText = change.current.text.substring(0, change.current.selectedRange.start);
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

    return Formatter;

  })();

  module.exports = Formatter;

}).call(this);

},{}],14:[function(require,module,exports){
(function() {
  var UndoManager, hasGetter,
    __slice = [].slice;

  hasGetter = function(object, property) {
    var e, _ref, _ref1, _ref2;
    try {
      Object.getOwnPropertyDescriptor({}, 'sq');
    } catch (_error) {
      e = _error;
      return;
    }
    if (object != null ? (_ref = object.constructor) != null ? _ref.prototype : void 0 : void 0) {
      if ((_ref1 = Object.getOwnPropertyDescriptor(object.constructor.prototype, property)) != null ? _ref1.get : void 0) {
        return true;
      }
    }
    return ((_ref2 = Object.getOwnPropertyDescriptor(object, property)) != null ? _ref2.get : void 0) != null;
  };

  UndoManager = (function() {
    UndoManager.prototype._undos = null;

    UndoManager.prototype._redos = null;

    UndoManager.prototype._isUndoing = false;

    UndoManager.prototype._isRedoing = false;

    function UndoManager() {
      this._undos = [];
      this._redos = [];
    }

    UndoManager.prototype.canUndo = function() {
      return this._undos.length !== 0;
    };

    UndoManager.prototype.canRedo = function() {
      return this._redos.length !== 0;
    };

    UndoManager.prototype.isUndoing = function() {
      return this._isUndoing;
    };

    UndoManager.prototype.isRedoing = function() {
      return this._isRedoing;
    };

    UndoManager.prototype.registerUndo = function() {
      var args, selector, target;
      target = arguments[0], selector = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (this._isUndoing) {
        this._appendRedo.apply(this, [target, selector].concat(__slice.call(args)));
      } else {
        if (!this._isRedoing) {
          this._redos.length = 0;
        }
        this._appendUndo.apply(this, [target, selector].concat(__slice.call(args)));
      }
      return null;
    };

    UndoManager.prototype._appendUndo = function() {
      var args, selector, target;
      target = arguments[0], selector = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      return this._undos.push({
        target: target,
        selector: selector,
        args: args
      });
    };

    UndoManager.prototype._appendRedo = function() {
      var args, selector, target;
      target = arguments[0], selector = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      return this._redos.push({
        target: target,
        selector: selector,
        args: args
      });
    };

    UndoManager.prototype.undo = function() {
      var args, selector, target, _ref;
      if (!this.canUndo()) {
        throw new Error('there are no registered undos');
      }
      _ref = this._undos.pop(), target = _ref.target, selector = _ref.selector, args = _ref.args;
      this._isUndoing = true;
      target[selector].apply(target, args);
      this._isUndoing = false;
      return null;
    };

    UndoManager.prototype.redo = function() {
      var args, selector, target, _ref;
      if (!this.canRedo()) {
        throw new Error('there are no registered redos');
      }
      _ref = this._redos.pop(), target = _ref.target, selector = _ref.selector, args = _ref.args;
      this._isRedoing = true;
      target[selector].apply(target, args);
      this._isRedoing = false;
      return null;
    };

    UndoManager.prototype.proxyFor = function(target) {
      var proxy, selector, _fn,
        _this = this;
      proxy = {};
      _fn = function(selector) {
        return proxy[selector] = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _this.registerUndo.apply(_this, [target, selector].concat(__slice.call(args)));
        };
      };
      for (selector in target) {
        if (hasGetter(target, selector)) {
          continue;
        }
        if (typeof target[selector] !== 'function') {
          continue;
        }
        _fn(selector);
      }
      return proxy;
    };

    return UndoManager;

  })();

  module.exports = UndoManager;

}).call(this);

},{}],2:[function(require,module,exports){
(function() {
  var AMEX, AdaptiveCardFormatter, AmexCardFormatter, DefaultCardFormatter, determineCardType, _ref;

  AmexCardFormatter = require('./amex_card_formatter');

  DefaultCardFormatter = require('./default_card_formatter');

  _ref = require('./card_utils'), determineCardType = _ref.determineCardType, AMEX = _ref.AMEX;

  AdaptiveCardFormatter = (function() {
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
      if (determineCardType(pan.replace(/[^\d]+/g, '')) === AMEX) {
        return this.amexCardFormatter;
      } else {
        return this.defaultCardFormatter;
      }
    };

    return AdaptiveCardFormatter;

  })();

  module.exports = AdaptiveCardFormatter;

}).call(this);

},{"./amex_card_formatter":3,"./default_card_formatter":5,"./card_utils":15}],5:[function(require,module,exports){
(function() {
  var DefaultCardFormatter, DelimitedTextFormatter, luhnCheck, validCardLength, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DelimitedTextFormatter = require('./delimited_text_formatter');

  _ref = require('./card_utils'), validCardLength = _ref.validCardLength, luhnCheck = _ref.luhnCheck;

  DefaultCardFormatter = (function(_super) {
    __extends(DefaultCardFormatter, _super);

    function DefaultCardFormatter() {
      _ref1 = DefaultCardFormatter.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    DefaultCardFormatter.prototype.delimiter = ' ';

    DefaultCardFormatter.prototype.maximumLength = 16 + 3;

    DefaultCardFormatter.prototype.hasDelimiterAtIndex = function(index) {
      return index === 4 || index === 9 || index === 14;
    };

    DefaultCardFormatter.prototype.parse = function(text, error) {
      var value;
      value = this._valueFromText(text);
      if (!validCardLength(value)) {
        if (typeof error === "function") {
          error('card-formatter.number-too-short');
        }
      }
      if (!luhnCheck(value)) {
        if (typeof error === "function") {
          error('card-formatter.invalid-number');
        }
      }
      return DefaultCardFormatter.__super__.parse.call(this, text, error);
    };

    DefaultCardFormatter.prototype._valueFromText = function(text) {
      return DefaultCardFormatter.__super__._valueFromText.call(this, (text != null ? text : '').replace(/[^\d]/g, ''));
    };

    return DefaultCardFormatter;

  })(DelimitedTextFormatter);

  module.exports = DefaultCardFormatter;

}).call(this);

},{"./delimited_text_formatter":6,"./card_utils":15}],3:[function(require,module,exports){
(function() {
  var AmexCardFormatter, DefaultCardFormatter, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DefaultCardFormatter = require('./default_card_formatter');

  AmexCardFormatter = (function(_super) {
    __extends(AmexCardFormatter, _super);

    function AmexCardFormatter() {
      _ref = AmexCardFormatter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AmexCardFormatter.prototype.maximumLength = 15 + 2;

    AmexCardFormatter.prototype.hasDelimiterAtIndex = function(index) {
      return index === 4 || index === 11;
    };

    return AmexCardFormatter;

  })(DefaultCardFormatter);

  module.exports = AmexCardFormatter;

}).call(this);

},{"./default_card_formatter":5}],4:[function(require,module,exports){
(function() {
  var AdaptiveCardFormatter, CardMaskStrategy, CardTextField, TextField, determineCardType,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextField = require('./text_field');

  AdaptiveCardFormatter = require('./adaptive_card_formatter');

  determineCardType = require('./card_utils').determineCardType;

  CardMaskStrategy = {
    None: 'None',
    DoneEditing: 'DoneEditing'
  };

  CardTextField = (function(_super) {
    __extends(CardTextField, _super);

    function CardTextField(element) {
      CardTextField.__super__.constructor.call(this, element, new AdaptiveCardFormatter());
      this.setCardMaskStrategy(CardMaskStrategy.None);
    }

    CardTextField.prototype.cardType = function() {
      return determineCardType(this.value());
    };

    CardTextField.prototype.cardMaskStrategy = function() {
      return this._cardMaskStrategy;
    };

    CardTextField.prototype.setCardMaskStrategy = function(cardMaskStrategy) {
      if (cardMaskStrategy !== this._cardMaskStrategy) {
        this._cardMaskStrategy = cardMaskStrategy;
        this._syncMask();
      }
      return null;
    };

    CardTextField.prototype.cardMask = function() {
      var last4, text, toMask;
      text = this.text();
      toMask = text.slice(0, -4);
      last4 = text.slice(-4);
      return toMask.replace(/\d/g, '•') + last4;
    };

    CardTextField.prototype._masked = false;

    CardTextField.prototype._editing = false;

    CardTextField.prototype.text = function() {
      if (this._masked) {
        return this._unmaskedText;
      } else {
        return CardTextField.__super__.text.call(this);
      }
    };

    CardTextField.prototype.setText = function(text) {
      if (this._masked) {
        this._unmaskedText = text;
        text = this.cardMask();
      }
      return CardTextField.__super__.setText.call(this, text);
    };

    CardTextField.prototype.textFieldDidEndEditing = function() {
      this._editing = false;
      return this._syncMask();
    };

    CardTextField.prototype.textFieldDidBeginEditing = function() {
      this._editing = true;
      return this._syncMask();
    };

    CardTextField.prototype._enableMasking = function() {
      if (!this._masked) {
        this._unmaskedText = this.text();
        this._masked = true;
        return this.setText(this._unmaskedText);
      }
    };

    CardTextField.prototype._disableMasking = function() {
      if (this._masked) {
        this._masked = false;
        this.setText(this._unmaskedText);
        return this._unmaskedText = null;
      }
    };

    CardTextField.prototype._syncMask = function() {
      if (this.cardMaskStrategy() === CardMaskStrategy.DoneEditing) {
        if (this._editing) {
          return this._disableMasking();
        } else {
          return this._enableMasking();
        }
      }
    };

    return CardTextField;

  })(TextField);

  CardTextField.CardMaskStrategy = CardMaskStrategy;

  module.exports = CardTextField;

}).call(this);

},{"./text_field":13,"./adaptive_card_formatter":2,"./card_utils":15}],7:[function(require,module,exports){
(function() {
  var ExpiryDateField, ExpiryDateFormatter, TextField,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextField = require('./text_field');

  ExpiryDateFormatter = require('./expiry_date_formatter');

  ExpiryDateField = (function(_super) {
    __extends(ExpiryDateField, _super);

    function ExpiryDateField(element) {
      ExpiryDateField.__super__.constructor.call(this, element, new ExpiryDateFormatter());
    }

    ExpiryDateField.prototype.textFieldDidEndEditing = function() {
      var value;
      value = this.value();
      if (value) {
        return this.setText(this.formatter().format(value));
      }
    };

    return ExpiryDateField;

  })(TextField);

  module.exports = ExpiryDateField;

}).call(this);

},{"./text_field":13,"./expiry_date_formatter":8}],6:[function(require,module,exports){
(function() {
  var DelimitedTextFormatter, Formatter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Formatter = require('./formatter');

  DelimitedTextFormatter = (function(_super) {
    __extends(DelimitedTextFormatter, _super);

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

    function DelimitedTextFormatter(delimiter) {
      var _ref;
      if (delimiter == null) {
        delimiter = this.delimiter;
      }
      this.delimiter = delimiter;
      if (((_ref = this.delimiter) != null ? _ref.length : void 0) !== 1) {
        throw new Error('delimiter must have just one character');
      }
    }

    DelimitedTextFormatter.prototype.format = function(value) {
      return this._textFromValue(value);
    };

    DelimitedTextFormatter.prototype._textFromValue = function(value) {
      var chr, delimiter, result, _i, _len;
      if (!value) {
        return '';
      }
      result = '';
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        chr = value[_i];
        while (delimiter = this.delimiterAt(result.length)) {
          result += delimiter;
        }
        result += chr;
        while (delimiter = this.delimiterAt(result.length)) {
          result += delimiter;
        }
      }
      return result;
    };

    DelimitedTextFormatter.prototype.parse = function(text, error) {
      return this._valueFromText(text);
    };

    DelimitedTextFormatter.prototype._valueFromText = function(text) {
      var chr;
      if (!text) {
        return '';
      }
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = text.length; _i < _len; _i++) {
          chr = text[_i];
          if (!this.isDelimiter(chr)) {
            _results.push(chr);
          }
        }
        return _results;
      }).call(this)).join('');
    };

    DelimitedTextFormatter.prototype.isChangeValid = function(change, error) {
      var endMovedLeft, endMovedOverADelimiter, endMovedRight, hasSelection, isChangeValid, newCursorPosition, newText, range, startMovedLeft, startMovedOverADelimiter, startMovedRight, value;
      if (!DelimitedTextFormatter.__super__.isChangeValid.call(this, change, error)) {
        return false;
      }
      newText = change.proposed.text;
      range = change.proposed.selectedRange;
      hasSelection = range.length !== 0;
      startMovedLeft = range.start < change.current.selectedRange.start;
      startMovedRight = range.start > change.current.selectedRange.start;
      endMovedLeft = (range.start + range.length) < (change.current.selectedRange.start + change.current.selectedRange.length);
      endMovedRight = (range.start + range.length) > (change.current.selectedRange.start + change.current.selectedRange.length);
      startMovedOverADelimiter = startMovedLeft && this.hasDelimiterAtIndex(range.start) || startMovedRight && this.hasDelimiterAtIndex(range.start - 1);
      endMovedOverADelimiter = endMovedLeft && this.hasDelimiterAtIndex(range.start + range.length) || endMovedRight && this.hasDelimiterAtIndex(range.start + range.length - 1);
      if (this.isDelimiter(change.deleted.text)) {
        newCursorPosition = change.deleted.start - 1;
        while (this.isDelimiter(newText.charAt(newCursorPosition))) {
          newText = newText.substring(0, newCursorPosition) + newText.substring(newCursorPosition + 1);
          newCursorPosition--;
        }
        newText = newText.substring(0, newCursorPosition) + newText.substring(newCursorPosition + 1);
      }
      if (startMovedLeft && startMovedOverADelimiter) {
        while (this.delimiterAt(range.start - 1)) {
          range.start--;
          range.length++;
        }
        range.start--;
        range.length++;
      }
      if (startMovedRight) {
        while (this.delimiterAt(range.start)) {
          range.start++;
          range.length--;
        }
        if (startMovedOverADelimiter) {
          range.start++;
          range.length--;
          while (this.delimiterAt(range.start)) {
            range.start++;
            range.length--;
          }
        }
      }
      if (hasSelection) {
        if (endMovedOverADelimiter) {
          if (endMovedLeft) {
            while (this.delimiterAt(range.start + range.length - 1)) {
              range.length--;
            }
            range.length--;
          }
          if (endMovedRight) {
            while (this.delimiterAt(range.start + range.length)) {
              range.length++;
            }
            range.length++;
          }
        }
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
      isChangeValid = true;
      value = this._valueFromText(newText, function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        isChangeValid = false;
        return error.apply(null, args);
      });
      if (isChangeValid) {
        change.proposed.text = this._textFromValue(value);
      }
      return isChangeValid;
    };

    return DelimitedTextFormatter;

  })(Formatter);

  module.exports = DelimitedTextFormatter;

}).call(this);

},{"./formatter":10}],8:[function(require,module,exports){
(function() {
  var DelimitedTextFormatter, ExpiryDateFormatter, interpretTwoDigitYear, zpad2, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DelimitedTextFormatter = require('./delimited_text_formatter');

  zpad2 = require('./utils').zpad2;

  interpretTwoDigitYear = function(year) {
    var centuries, thisCentury, thisYear;
    thisYear = new Date().getFullYear();
    thisCentury = thisYear - (thisYear % 100);
    centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort(function(a, b) {
      return Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b));
    });
    return year + centuries[0];
  };

  ExpiryDateFormatter = (function(_super) {
    __extends(ExpiryDateFormatter, _super);

    function ExpiryDateFormatter() {
      _ref = ExpiryDateFormatter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ExpiryDateFormatter.prototype.delimiter = '/';

    ExpiryDateFormatter.prototype.maximumLength = 5;

    ExpiryDateFormatter.prototype.hasDelimiterAtIndex = function(index) {
      return index === 2;
    };

    ExpiryDateFormatter.prototype.format = function(value) {
      var month, year;
      if (!value) {
        return '';
      }
      month = value.month, year = value.year;
      year = year % 100;
      return ExpiryDateFormatter.__super__.format.call(this, zpad2(month) + zpad2(year));
    };

    ExpiryDateFormatter.prototype.parse = function(text, error) {
      var month, year, _ref1;
      _ref1 = text.split(this.delimiter), month = _ref1[0], year = _ref1[1];
      if ((month != null ? month.match(/^(0?[1-9]|1\d)$/) : void 0) && (year != null ? year.match(/^\d\d?$/) : void 0)) {
        month = Number(month);
        year = interpretTwoDigitYear(Number(year));
        return {
          month: month,
          year: year
        };
      } else {
        error('expiry-date-formatter.invalid-date');
        return null;
      }
    };

    ExpiryDateFormatter.prototype.isChangeValid = function(change, error) {
      var isBackspace, match, newText;
      isBackspace = change.proposed.text.length < change.current.text.length;
      newText = change.proposed.text;
      if (isBackspace) {
        if (change.deleted.text === this.delimiter) {
          newText = newText[0];
        }
        if (newText === '0') {
          newText = '';
        }
      } else if (change.inserted.text === this.delimiter && change.current.text === '1') {
        newText = "01" + this.delimiter;
      } else if (change.inserted.text.length > 0 && !/^\d$/.test(change.inserted.text)) {
        error('expiry-date-formatter.only-digits-allowed');
        return false;
      } else {
        if (/^[2-9]$/.test(newText)) {
          newText = '0' + newText;
        }
        if (/^1[3-9]$/.test(newText)) {
          error('expiry-date-formatter.invalid-month');
          return false;
        }
        if (newText === '00') {
          error('expiry-date-formatter.invalid-month');
          return false;
        }
        if (/^(0[1-9]|1[0-2])$/.test(newText)) {
          newText += this.delimiter;
        }
        if ((match = newText.match(/^(\d\d)(.)(\d\d?).*$/)) && match[2] === this.delimiter) {
          newText = match[1] + this.delimiter + match[3];
        }
      }
      change.proposed.text = newText;
      change.proposed.selectedRange = {
        start: newText.length,
        length: 0
      };
      return true;
    };

    return ExpiryDateFormatter;

  })(DelimitedTextFormatter);

  module.exports = ExpiryDateFormatter;

}).call(this);

},{"./delimited_text_formatter":6,"./utils":16}],12:[function(require,module,exports){
(function() {
  var DelimitedTextFormatter, SocialSecurityNumberFormatter, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DelimitedTextFormatter = require('./delimited_text_formatter');

  SocialSecurityNumberFormatter = (function(_super) {
    __extends(SocialSecurityNumberFormatter, _super);

    function SocialSecurityNumberFormatter() {
      _ref = SocialSecurityNumberFormatter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    SocialSecurityNumberFormatter.prototype.delimiter = '-';

    SocialSecurityNumberFormatter.prototype.maximumLength = 9 + 2;

    SocialSecurityNumberFormatter.prototype.hasDelimiterAtIndex = function(index) {
      return index === 3 || index === 6;
    };

    SocialSecurityNumberFormatter.prototype.isChangeValid = function(change) {
      if (/^\d*$/.test(change.inserted.text)) {
        return SocialSecurityNumberFormatter.__super__.isChangeValid.call(this, change);
      } else {
        return false;
      }
    };

    return SocialSecurityNumberFormatter;

  })(DelimitedTextFormatter);

  module.exports = SocialSecurityNumberFormatter;

}).call(this);

},{"./delimited_text_formatter":6}],11:[function(require,module,exports){
(function() {
  var DELIMITER_PATTERN, DelimitedTextFormatter, NANP_PHONE_DELIMITERS, NANP_PHONE_DELIMITERS_WITH_1, NANP_PHONE_DELIMITERS_WITH_PLUS, PhoneFormatter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  DelimitedTextFormatter = require('./delimited_text_formatter');

  NANP_PHONE_DELIMITERS = {
    0: '(',
    4: ')',
    5: ' ',
    9: '-'
  };

  NANP_PHONE_DELIMITERS_WITH_1 = {
    1: ' ',
    2: '(',
    6: ')',
    7: ' ',
    11: '-'
  };

  NANP_PHONE_DELIMITERS_WITH_PLUS = {
    2: ' ',
    3: '(',
    7: ')',
    8: ' ',
    12: '-'
  };

  DELIMITER_PATTERN = /[-\(\) ]/g;

  PhoneFormatter = (function(_super) {
    __extends(PhoneFormatter, _super);

    PhoneFormatter.prototype.maximumLength = null;

    PhoneFormatter.prototype.delimiterMap = null;

    function PhoneFormatter() {
      if (arguments.length !== 0) {
        throw new Error("were you trying to set a delimiter (" + arguments[0] + ")?");
      }
    }

    PhoneFormatter.prototype.isDelimiter = function(chr) {
      var delimiter, index;
      return __indexOf.call((function() {
        var _ref, _results;
        _ref = this.delimiterMap;
        _results = [];
        for (index in _ref) {
          delimiter = _ref[index];
          _results.push(delimiter);
        }
        return _results;
      }).call(this), chr) >= 0;
    };

    PhoneFormatter.prototype.delimiterAt = function(index) {
      return this.delimiterMap[index];
    };

    PhoneFormatter.prototype.hasDelimiterAtIndex = function(index) {
      return this.delimiterAt(index) != null;
    };

    PhoneFormatter.prototype.parse = function(text, error) {
      var digits;
      digits = this.digitsWithoutCountryCode(text);
      if (!(text.length >= 10)) {
        if (typeof error === "function") {
          error('phone-formatter.number-too-short');
        }
      }
      if (digits[0] === '0') {
        if (typeof error === "function") {
          error('phone-formatter.area-code-zero');
        }
      }
      if (digits[0] === '1') {
        if (typeof error === "function") {
          error('phone-formatter.area-code-one');
        }
      }
      if (digits[1] === '9') {
        if (typeof error === "function") {
          error('phone-formatter.area-code-n9n');
        }
      }
      if (digits[3] === '1') {
        if (typeof error === "function") {
          error('phone-formatter.central-office-one');
        }
      }
      if (digits.slice(4, 6) === '11') {
        if (typeof error === "function") {
          error('phone-formatter.central-office-n11');
        }
      }
      return PhoneFormatter.__super__.parse.call(this, text, error);
    };

    PhoneFormatter.prototype.format = function(value) {
      this.guessFormatFromText(value);
      return PhoneFormatter.__super__.format.call(this, this.removeDelimiterMapChars(value));
    };

    PhoneFormatter.prototype.isChangeValid = function(change, error) {
      var formatted, selectedRange, text, toInsert, _ref;
      this.guessFormatFromText(change.proposed.text);
      if (change.inserted.text.length > 1) {
        _ref = change.current, text = _ref.text, selectedRange = _ref.selectedRange;
        toInsert = change.inserted.text;
        formatted = this.format((text.slice(0, selectedRange.start) + toInsert + text.slice(selectedRange.start + selectedRange.length)).replace(/[^\d]/g, ''));
        change.proposed = {
          text: formatted,
          selectedRange: {
            start: formatted.length - (text.length - (selectedRange.start + selectedRange.length)),
            length: 0
          }
        };
        return PhoneFormatter.__super__.isChangeValid.call(this, change, error);
      }
      if (/^\d*$/.test(change.inserted.text) || change.proposed.text.indexOf('+') === 0) {
        return PhoneFormatter.__super__.isChangeValid.call(this, change, error);
      } else {
        return false;
      }
    };

    PhoneFormatter.prototype.guessFormatFromText = function(text) {
      if ((text != null ? text[0] : void 0) === '+') {
        this.delimiterMap = NANP_PHONE_DELIMITERS_WITH_PLUS;
        return this.maximumLength = 1 + 1 + 10 + 5;
      } else if ((text != null ? text[0] : void 0) === '1') {
        this.delimiterMap = NANP_PHONE_DELIMITERS_WITH_1;
        return this.maximumLength = 1 + 10 + 5;
      } else {
        this.delimiterMap = NANP_PHONE_DELIMITERS;
        return this.maximumLength = 10 + 4;
      }
    };

    PhoneFormatter.prototype.digitsWithoutCountryCode = function(text) {
      var digits, extraDigits;
      digits = (text != null ? text : '').replace(/[^\d]/g, '');
      extraDigits = digits.length - 10;
      if (extraDigits > 0) {
        digits = digits.substr(extraDigits);
      }
      return digits;
    };

    PhoneFormatter.prototype.removeDelimiterMapChars = function(text) {
      return (text != null ? text : '').replace(DELIMITER_PATTERN, '');
    };

    return PhoneFormatter;

  })(DelimitedTextFormatter);

  module.exports = PhoneFormatter;

}).call(this);

},{"./delimited_text_formatter":6}],13:[function(require,module,exports){
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
      this._focusout = __bind(this._focusout, this);
      this._focusin = __bind(this._focusin, this);
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
      this.element.on('focusin.field-kit', this._focusin);
      this.element.on('focusout.field-kit', this._focusout);
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
        if (event.charCode !== 0) {
          charCode = event.charCode || event.keyCode;
          return this.rollbackInvalidChanges(function() {
            return _this.insertText(String.fromCharCode(charCode));
          });
        }
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

    TextField.prototype._focusin = function(event) {
      this._textFieldDidBeginEditing();
      return this._syncPlaceholder();
    };

    TextField.prototype._focusout = function(event) {
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

},{"./formatter":10,"./undo_manager":14,"./keybindings":17}],15:[function(require,module,exports){
(function() {
  var AMEX, DISCOVER, JCB, MASTERCARD, VISA, determineCardType, luhnCheck, validCardLength;

  AMEX = 'amex';

  DISCOVER = 'discover';

  JCB = 'jcb';

  MASTERCARD = 'mastercard';

  VISA = 'visa';

  determineCardType = function(pan) {
    var firsttwo, halfiin, iin;
    if (pan == null) {
      return null;
    }
    pan = pan.toString();
    firsttwo = parseInt(pan.slice(0, 2), 10);
    iin = parseInt(pan.slice(0, 6), 10);
    halfiin = parseInt(pan.slice(0, 3), 10);
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
  };

  luhnCheck = function(pan) {
    var digit, flip, i, sum, _i, _ref;
    sum = 0;
    flip = true;
    for (i = _i = _ref = pan.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
      if (!(pan.charAt(i) !== ' ')) {
        continue;
      }
      digit = parseInt(pan.charAt(i), 10);
      sum += (flip = !flip) ? Math.floor((digit * 2) / 10) + Math.floor(digit * 2 % 10) : digit;
    }
    return sum % 10 === 0;
  };

  validCardLength = function(pan) {
    var _ref, _ref1;
    switch (determineCardType(pan)) {
      case VISA:
        return (_ref = pan.length) === 13 || _ref === 16;
      case DISCOVER:
      case MASTERCARD:
        return pan.length === 16;
      case JCB:
        return (_ref1 = pan.length) === 15 || _ref1 === 16;
      case AMEX:
        return pan.length === 15;
      default:
        return false;
    }
  };

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

}).call(this);

},{}],16:[function(require,module,exports){
(function() {
  var endsWith, isDigits, startsWith, trim, zpad, zpad2;

  isDigits = function(string) {
    return /^\d*$/.test(string);
  };

  startsWith = function(prefix, string) {
    return string.slice(0, prefix.length) === prefix;
  };

  endsWith = function(suffix, string) {
    return string.slice(string.length - suffix.length) === suffix;
  };

  if (''.trim) {
    trim = function(string) {
      return string.trim();
    };
  } else {
    trim = function(string) {
      return string.replace(/(^\s+|\s+$)/, '');
    };
  }

  zpad = function(length, n) {
    var result;
    result = "" + n;
    while (result.length < length) {
      result = "0" + result;
    }
    return result;
  };

  zpad2 = function(n) {
    return zpad(2, n);
  };

  module.exports = {
    isDigits: isDigits,
    startsWith: startsWith,
    endsWith: endsWith,
    trim: trim,
    zpad: zpad,
    zpad2: zpad2
  };

}).call(this);

},{}],17:[function(require,module,exports){
(function() {
  var A, ALT, BACKSPACE, BindingSet, CTRL, DELETE, DOWN, ENTER, KEYS, LEFT, META, NINE, RIGHT, SHIFT, TAB, UP, Y, Z, ZERO, build, cache, keyBindingsForPlatform,
    __slice = [].slice;

  A = 65;

  Y = 89;

  Z = 90;

  ZERO = 48;

  NINE = 57;

  LEFT = 37;

  RIGHT = 39;

  UP = 38;

  DOWN = 40;

  BACKSPACE = 8;

  DELETE = 46;

  TAB = 9;

  ENTER = 13;

  KEYS = {
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
      return (ZERO <= keyCode && keyCode <= NINE);
    },
    isDirectional: function(keyCode) {
      return keyCode === LEFT || keyCode === RIGHT || keyCode === UP || keyCode === DOWN;
    }
  };

  CTRL = 1 << 0;

  META = 1 << 1;

  ALT = 1 << 2;

  SHIFT = 1 << 3;

  cache = {};

  keyBindingsForPlatform = function(platform) {
    var ctrl, osx;
    osx = platform === 'OSX';
    ctrl = osx ? META : CTRL;
    return cache[platform] || (cache[platform] = build(platform, function(bind) {
      bind(A, ctrl, 'selectAll');
      bind(LEFT, null, 'moveLeft');
      bind(LEFT, ALT, 'moveWordLeft');
      bind(LEFT, SHIFT, 'moveLeftAndModifySelection');
      bind(LEFT, ALT | SHIFT, 'moveWordLeftAndModifySelection');
      if (osx) {
        bind(LEFT, META, 'moveToBeginningOfLine');
      }
      if (osx) {
        bind(LEFT, META | SHIFT, 'moveToBeginningOfLineAndModifySelection');
      }
      bind(RIGHT, null, 'moveRight');
      bind(RIGHT, ALT, 'moveWordRight');
      bind(RIGHT, SHIFT, 'moveRightAndModifySelection');
      bind(RIGHT, ALT | SHIFT, 'moveWordRightAndModifySelection');
      if (osx) {
        bind(RIGHT, META, 'moveToEndOfLine');
      }
      if (osx) {
        bind(RIGHT, META | SHIFT, 'moveToEndOfLineAndModifySelection');
      }
      bind(UP, null, 'moveUp');
      bind(UP, ALT, 'moveToBeginningOfParagraph');
      bind(UP, SHIFT, 'moveUpAndModifySelection');
      bind(UP, ALT | SHIFT, 'moveParagraphBackwardAndModifySelection');
      if (osx) {
        bind(UP, META, 'moveToBeginningOfDocument');
      }
      if (osx) {
        bind(UP, META | SHIFT, 'moveToBeginningOfDocumentAndModifySelection');
      }
      bind(DOWN, null, 'moveDown');
      bind(DOWN, ALT, 'moveToEndOfParagraph');
      bind(DOWN, SHIFT, 'moveDownAndModifySelection');
      bind(DOWN, ALT | SHIFT, 'moveParagraphForwardAndModifySelection');
      if (osx) {
        bind(DOWN, META, 'moveToEndOfDocument');
      }
      if (osx) {
        bind(DOWN, META | SHIFT, 'moveToEndOfDocumentAndModifySelection');
      }
      bind(BACKSPACE, null, 'deleteBackward');
      bind(BACKSPACE, SHIFT, 'deleteBackward');
      bind(BACKSPACE, ALT, 'deleteWordBackward');
      bind(BACKSPACE, ALT | SHIFT, 'deleteWordBackward');
      if (osx) {
        bind(BACKSPACE, CTRL, 'deleteBackwardByDecomposingPreviousCharacter');
      }
      if (osx) {
        bind(BACKSPACE, CTRL | SHIFT, 'deleteBackwardByDecomposingPreviousCharacter');
      }
      bind(BACKSPACE, ctrl, 'deleteBackwardToBeginningOfLine');
      bind(BACKSPACE, ctrl | SHIFT, 'deleteBackwardToBeginningOfLine');
      bind(DELETE, null, 'deleteForward');
      bind(DELETE, ALT, 'deleteWordForward');
      bind(TAB, null, 'insertTab');
      bind(TAB, SHIFT, 'insertBackTab');
      bind(ENTER, null, 'insertNewline');
      bind(Z, ctrl, 'undo');
      if (osx) {
        bind(Z, META | SHIFT, 'redo');
      }
      if (!osx) {
        return bind(Y, CTRL, 'redo');
      }
    }));
  };

  build = function(platform, callback) {
    var result;
    result = new BindingSet(platform);
    callback(function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return result.bind.apply(result, args);
    });
    return result;
  };

  BindingSet = (function() {
    BindingSet.prototype.platform = null;

    BindingSet.prototype.bindings = null;

    function BindingSet(platform) {
      this.platform = platform;
      this.bindings = {};
    }

    BindingSet.prototype.bind = function(keyCode, modifiers, action) {
      var _base;
      return ((_base = this.bindings)[keyCode] || (_base[keyCode] = {}))[modifiers || 0] = action;
    };

    BindingSet.prototype.actionForEvent = function(event) {
      var bindingsForKeyCode, modifiers;
      if (bindingsForKeyCode = this.bindings[event.keyCode]) {
        modifiers = 0;
        if (event.altKey) {
          modifiers |= ALT;
        }
        if (event.ctrlKey) {
          modifiers |= CTRL;
        }
        if (event.metaKey) {
          modifiers |= META;
        }
        if (event.shiftKey) {
          modifiers |= SHIFT;
        }
        return bindingsForKeyCode[modifiers];
      }
    };

    return BindingSet;

  })();

  module.exports = {
    KEYS: KEYS,
    keyBindingsForPlatform: keyBindingsForPlatform
  };

}).call(this);

},{}],9:[function(require,module,exports){
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

},{"./formatter":10,"./utils":16,"stround":18}],18:[function(require,module,exports){
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