(function() {
    "use strict";
    var $$formatter$$$__Object$defineProperty = Object.defineProperty;

    var $$formatter$$Formatter = function() {
      function Formatter() {}

      $$formatter$$$__Object$defineProperty(Formatter.prototype, "format", {
        value: function(text) {
          if (text === undefined || text === null) { text = ''; }
          if (this.maximumLength !== undefined && this.maximumLength !== null) {
            text = text.substring(0, this.maximumLength);
          }
          return text;
        },

        enumerable: false,
        writable: true
      });

      $$formatter$$$__Object$defineProperty(Formatter.prototype, "parse", {
        value: function(text) {
          if (text === undefined || text === null) { text = ''; }
          if (this.maximumLength !== undefined && this.maximumLength !== null) {
            text = text.substring(0, this.maximumLength);
          }
          return text;
        },

        enumerable: false,
        writable: true
      });

      $$formatter$$$__Object$defineProperty(Formatter.prototype, "isChangeValid", {
        value: function(change) {
          var selectedRange = change.proposed.selectedRange;
          var text = change.proposed.text;
          if (this.maximumLength !== undefined && this.maximumLength !== null && text.length > this.maximumLength) {
            var available = this.maximumLength - (text.length - change.inserted.text.length);
            var newText = change.current.text.substring(0, change.current.selectedRange.start);
            if (available > 0) {
              newText += change.inserted.text.substring(0, available);
            }
            newText += change.current.text.substring(change.current.selectedRange.start + change.current.selectedRange.length);
            var truncatedLength = text.length - newText.length;
            change.proposed.text = newText;
            selectedRange.start -= truncatedLength;
          }
          return true;
        },

        enumerable: false,
        writable: true
      });

      return Formatter;
    }();

    var $$formatter$$default = $$formatter$$Formatter;
    var $$delimited_text_formatter$$$__Array$prototype$slice = Array.prototype.slice;
    var $$delimited_text_formatter$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$delimited_text_formatter$$$__Object$defineProperty = Object.defineProperty;
    var $$delimited_text_formatter$$$__Object$create = Object.create;

    var $$delimited_text_formatter$$DelimitedTextFormatter = function($__super) {
      function DelimitedTextFormatter(delimiter) {
        var isLazy = (arguments[1] !== void 0 ? arguments[1] : false);
        if (!delimiter) { delimiter = this.delimiter; }

        if (delimiter === null || delimiter === undefined || delimiter.length !== 1) {
          throw new Error('delimiter must have just one character');
        }

        this.delimiter = delimiter;

        // If the formatter is lazy, delimiter will not be added until input has gone
        // past the delimiter index. Useful for 'optional' extension, like zip codes.
        // 94103  ->  type '1'  ->  94103-1
        this.isLazy = isLazy;
      }

      DelimitedTextFormatter.__proto__ = ($__super !== null ? $__super : Function.prototype);
      DelimitedTextFormatter.prototype = $$delimited_text_formatter$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$delimited_text_formatter$$$__Object$defineProperty(DelimitedTextFormatter.prototype, "constructor", {
        value: DelimitedTextFormatter
      });

      $$delimited_text_formatter$$$__Object$defineProperty(DelimitedTextFormatter.prototype, "delimiterAt", {
        value: function(index) {
          if (!this.hasDelimiterAtIndex(index)) {
            return null;
          }
          return this.delimiter;
        },

        enumerable: false,
        writable: true
      });

      $$delimited_text_formatter$$$__Object$defineProperty(DelimitedTextFormatter.prototype, "isDelimiter", {
        value: function(chr) {
          return chr === this.delimiter;
        },

        enumerable: false,
        writable: true
      });

      $$delimited_text_formatter$$$__Object$defineProperty(DelimitedTextFormatter.prototype, "format", {
        value: function(value) {
          return this._textFromValue(value);
        },

        enumerable: false,
        writable: true
      });

      $$delimited_text_formatter$$$__Object$defineProperty(DelimitedTextFormatter.prototype, "_textFromValue", {
        value: function(value) {
          if (!value) { return ''; }

          var result = '';
          var delimiter;
          var maximumLength = this.maximumLength;

          for (var i = 0, l = value.length; i < l; i++) {
            while ((delimiter = this.delimiterAt(result.length))) {
              result += delimiter;
            }
            result += value[i];
            if (!this.isLazy) {
              while ((delimiter = this.delimiterAt(result.length))) {
                result += delimiter;
              }
            }
          }

          if (maximumLength !== undefined && maximumLength !== null) {
            return result.slice(0, maximumLength);
          } else {
            return result;
          }
        },

        enumerable: false,
        writable: true
      });

      $$delimited_text_formatter$$$__Object$defineProperty(DelimitedTextFormatter.prototype, "parse", {
        value: function(text) {
          return this._valueFromText(text);
        },

        enumerable: false,
        writable: true
      });

      $$delimited_text_formatter$$$__Object$defineProperty(DelimitedTextFormatter.prototype, "_valueFromText", {
        value: function(text) {
          if (!text) { return ''; }
          var result = '';
          for (var i = 0, l = text.length; i < l; i++) {
            if (!this.isDelimiter(text[i])) {
              result += text[i];
            }
          }
          return result;
        },

        enumerable: false,
        writable: true
      });

      $$delimited_text_formatter$$$__Object$defineProperty(DelimitedTextFormatter.prototype, "isChangeValid", {
        value: function(change, error) {
          if (!$$delimited_text_formatter$$$__Object$getPrototypeOf(DelimitedTextFormatter.prototype).isChangeValid.call(this, change, error)) {
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
                // move right over any immediately following delimiters
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

          var result = true;

          var value = this._valueFromText(newText, function() {
            var args = [].slice.call(arguments, 0);
            result = false;
            error.apply(null, $$delimited_text_formatter$$$__Array$prototype$slice.call(args));
          });

          if (result) {
            change.proposed.text = this._textFromValue(value);
          }

          return result;
        },

        enumerable: false,
        writable: true
      });

      return DelimitedTextFormatter;
    }($$formatter$$default);

    var $$delimited_text_formatter$$default = $$delimited_text_formatter$$DelimitedTextFormatter;
    var $$card_utils$$AMEX        = 'amex';
    var $$card_utils$$DISCOVER    = 'discover';
    var $$card_utils$$JCB         = 'jcb';
    var $$card_utils$$MASTERCARD  = 'mastercard';
    var $$card_utils$$VISA        = 'visa';

    function $$card_utils$$determineCardType(pan) {
      if (pan === null || pan === undefined) {
        return null;
      }

      pan = pan.toString();
      var firsttwo = parseInt(pan.slice(0, 2), 10);
      var iin = parseInt(pan.slice(0, 6), 10);
      var halfiin = parseInt(pan.slice(0, 3), 10);

      if (pan[0] === '4') {
        return $$card_utils$$VISA;
      } else if (pan.slice(0, 4) === '6011' || firsttwo === 65 || (halfiin >= 664 && halfiin <= 649) || (iin >= 622126 && iin <= 622925)) {
        return $$card_utils$$DISCOVER;
      } else if (pan.slice(0, 4) === '2131' || pan.slice(0, 4) === '1800' || firsttwo === 35) {
        return $$card_utils$$JCB;
      } else if (firsttwo >= 51 && firsttwo <= 55) {
        return $$card_utils$$MASTERCARD;
      } else if (firsttwo === 34 || firsttwo === 37) {
        return $$card_utils$$AMEX;
      }
    }

    function $$card_utils$$luhnCheck(pan) {
      var sum = 0;
      var flip = true;
      for (var i = pan.length - 1; i >= 0; i--) {
        var digit = parseInt(pan.charAt(i), 10);
        sum += (flip = !flip) ? Math.floor((digit * 2) / 10) + Math.floor(digit * 2 % 10) : digit;
      }

      return sum % 10 === 0;
    }

    function $$card_utils$$validCardLength(pan) {
      switch ($$card_utils$$determineCardType(pan)) {
        case $$card_utils$$VISA:
          return pan.length === 13 || pan.length === 16;
        case $$card_utils$$DISCOVER: case $$card_utils$$MASTERCARD:
          return pan.length === 16;
        case $$card_utils$$JCB:
          return pan.length === 15 || pan.length === 16;
        case $$card_utils$$AMEX:
          return pan.length === 15;
        default:
          return false;
      }
    }

    var $$default_card_formatter$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$default_card_formatter$$$__Object$defineProperty = Object.defineProperty;
    var $$default_card_formatter$$$__Object$create = Object.create;

    var $$default_card_formatter$$DefaultCardFormatter = function($__super) {
      function DefaultCardFormatter() {
        $$default_card_formatter$$$__Object$getPrototypeOf(DefaultCardFormatter.prototype).constructor.call(this, ' ');
      }

      DefaultCardFormatter.__proto__ = ($__super !== null ? $__super : Function.prototype);
      DefaultCardFormatter.prototype = $$default_card_formatter$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$default_card_formatter$$$__Object$defineProperty(DefaultCardFormatter.prototype, "constructor", {
        value: DefaultCardFormatter
      });

      $$default_card_formatter$$$__Object$defineProperty(DefaultCardFormatter.prototype, "hasDelimiterAtIndex", {
        value: function(index) {
          return index === 4 || index === 9 || index === 14;
        },

        enumerable: false,
        writable: true
      });

      $$default_card_formatter$$$__Object$defineProperty(DefaultCardFormatter.prototype, "parse", {
        value: function(text, error) {
          var value = this._valueFromText(text);
          if (typeof error === 'function') {
            if (!$$card_utils$$validCardLength(value)) {
              error('card-formatter.number-too-short');
            }
            if (!$$card_utils$$luhnCheck(value)) {
              error('card-formatter.invalid-number');
            }
          }
          return $$default_card_formatter$$$__Object$getPrototypeOf(DefaultCardFormatter.prototype).parse.call(this, text, error);
        },

        enumerable: false,
        writable: true
      });

      $$default_card_formatter$$$__Object$defineProperty(DefaultCardFormatter.prototype, "_valueFromText", {
        value: function(text) {
          return $$default_card_formatter$$$__Object$getPrototypeOf(DefaultCardFormatter.prototype)._valueFromText.call(this, (text || '').replace(/[^\d]/g, ''));
        },

        enumerable: false,
        writable: true
      });

      return DefaultCardFormatter;
    }($$delimited_text_formatter$$default);

    $$default_card_formatter$$DefaultCardFormatter.prototype.maximumLength = 16 + 3;
    var $$default_card_formatter$$default = $$default_card_formatter$$DefaultCardFormatter;
    var $$amex_card_formatter$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$amex_card_formatter$$$__Object$defineProperty = Object.defineProperty;
    var $$amex_card_formatter$$$__Object$create = Object.create;

    var $$amex_card_formatter$$AmexCardFormatter = function($__super) {
      function AmexCardFormatter() {
        $$amex_card_formatter$$$__Object$getPrototypeOf(AmexCardFormatter.prototype).constructor.call(this);
        this.maximumLength = 15 + 2;
      }

      AmexCardFormatter.__proto__ = ($__super !== null ? $__super : Function.prototype);
      AmexCardFormatter.prototype = $$amex_card_formatter$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$amex_card_formatter$$$__Object$defineProperty(AmexCardFormatter.prototype, "constructor", {
        value: AmexCardFormatter
      });

      $$amex_card_formatter$$$__Object$defineProperty(AmexCardFormatter.prototype, "hasDelimiterAtIndex", {
        value: function(index) {
          return index === 4 || index === 11;
        },

        enumerable: false,
        writable: true
      });

      return AmexCardFormatter;
    }($$default_card_formatter$$default);

    var $$amex_card_formatter$$default = $$amex_card_formatter$$AmexCardFormatter;
    var $$adaptive_card_formatter$$$__Object$defineProperty = Object.defineProperty;

    var $$adaptive_card_formatter$$AdaptiveCardFormatter = function() {
      function AdaptiveCardFormatter() {
        this.amexCardFormatter = new $$amex_card_formatter$$default();
        this.defaultCardFormatter = new $$default_card_formatter$$default();
        this.formatter = this.defaultCardFormatter;
      }

      $$adaptive_card_formatter$$$__Object$defineProperty(AdaptiveCardFormatter.prototype, "format", {
        value: function(pan) {
          return this._formatterForPan(pan).format(pan);
        },

        enumerable: false,
        writable: true
      });

      $$adaptive_card_formatter$$$__Object$defineProperty(AdaptiveCardFormatter.prototype, "parse", {
        value: function(text, error) {
          return this.formatter.parse(text, error);
        },

        enumerable: false,
        writable: true
      });

      $$adaptive_card_formatter$$$__Object$defineProperty(AdaptiveCardFormatter.prototype, "isChangeValid", {
        value: function(change) {
          this.formatter = this._formatterForPan(change.proposed.text);
          return this.formatter.isChangeValid(change);
        },

        enumerable: false,
        writable: true
      });

      $$adaptive_card_formatter$$$__Object$defineProperty(AdaptiveCardFormatter.prototype, "_formatterForPan", {
        value: function(pan) {
          if ($$card_utils$$determineCardType(pan.replace(/[^\d]+/g, '')) === $$card_utils$$AMEX) {
            return this.amexCardFormatter;
          } else {
            return this.defaultCardFormatter;
          }
        },

        enumerable: false,
        writable: true
      });

      return AdaptiveCardFormatter;
    }();

    var $$adaptive_card_formatter$$default = $$adaptive_card_formatter$$AdaptiveCardFormatter;
    var $$utils$$$__Array$prototype$slice = Array.prototype.slice;
    var $$utils$$DIGITS_PATTERN = /^\d*$/;
    var $$utils$$SURROUNDING_SPACE_PATTERN = /(^\s+|\s+$)/;

    function $$utils$$isDigits(string) {
      return $$utils$$DIGITS_PATTERN.test(string);
    }

    function $$utils$$startsWith(prefix, string) {
      return string.slice(0, prefix.length) === prefix;
    }

    function $$utils$$endsWith(suffix, string) {
      return string.slice(string.length - suffix.length) === suffix;
    }

    var $$utils$$trim = (typeof ''.trim === 'function') ?
      function(string) { return string.trim(); } :
      function(string) { return string.replace($$utils$$SURROUNDING_SPACE_PATTERN, ''); };

    function $$utils$$zpad(length, n) {
      var result = ''+n;
      while (result.length < length) {
        result = '0'+result;
      }
      return result;
    }

    function $$utils$$zpad2(n) {
      return $$utils$$zpad(2, n);
    }

    function $$utils$$bind(fn, context) {
      return fn.bind(context);
    }

    if (!Function.prototype.bind) {
      /* jshint freeze:false */
      Function.prototype.bind = function(context) {
        var prependedArgs = [].slice.call(arguments, 1);
        var self = this;

        return function() {
          var args = [].slice.call(arguments, 0);
          return self.apply(context, prependedArgs.concat(args));
        };
      };
    }

    var $$utils$$hasOwnProp = Object.prototype.hasOwnProperty;

    function $$utils$$forEach(iterable, iterator) {
      if (iterable && typeof iterable.forEach === 'function') {
        iterable.forEach(iterator);
      } else if ({}.toString.call(iterable) === '[object Array]') {
        for (var i = 0, l = iterable.length; i < l; i++) {
          iterator.call(null, iterable[i], i, iterable);
        }
      } else {
        for (var key in iterable) {
          if ($$utils$$hasOwnProp.call(iterable, key)) {
            iterator.call(null, iterable[key], key, iterable);
          }
        }
      }
    }

    var $$utils$$getOwnPropertyNames = (function() {
      var getOwnPropertyNames = Object.getOwnPropertyNames;

      try {
        Object.getOwnPropertyNames({}, 'sq');
      } catch (e) {
        // IE 8
        getOwnPropertyNames = function(object) {
          var result = [];
          for (var key in object) {
            if ($$utils$$hasOwnProp.call(object, key)) {
              result.push(key);
            }
          }
          return result;
        };
      }

      return getOwnPropertyNames;
    })();

    /* jshint proto:true */
    var $$utils$$getPrototypeOf = Object.getPrototypeOf || (function(object) {
      return object.__proto__;
    });

    function $$utils$$hasGetter(object, property) {
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

    function $$utils$$getAllPropertyNames(object) {
      var $__0;

      if (object === null || object === undefined) {
        return [];
      }

      var result = $$utils$$getOwnPropertyNames(object);
      var prototype = object.constructor && object.constructor.prototype;

      while (prototype) {
        ($__0 = result).push.apply($__0, $$utils$$$__Array$prototype$slice.call($$utils$$getOwnPropertyNames(prototype)));
        prototype = $$utils$$getPrototypeOf(prototype);
      }

      return result;
    }

    var $$undo_manager$$$__Array$prototype$slice = Array.prototype.slice;
    var $$undo_manager$$$__Object$defineProperty = Object.defineProperty;

    var $$undo_manager$$UndoManager = function() {
      function UndoManager() {
        this._undos = [];
        this._redos = [];
        this._isUndoing = false;
        this._isRedoing = false;
      }

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "canUndo", {
        value: function() {
          return this._undos.length !== 0;
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "canRedo", {
        value: function() {
          return this._redos.length !== 0;
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "isUndoing", {
        value: function() {
          return this._isUndoing;
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "isRedoing", {
        value: function() {
          return this._isRedoing;
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "registerUndo", {
        value: function(target, selector) {
          var args = [].slice.call(arguments, 2);

          if (this._isUndoing) {
            this._appendRedo.apply(this, [target, selector].concat($$undo_manager$$$__Array$prototype$slice.call(args)));
          } else {
            if (!this._isRedoing) {
              this._redos.length = 0;
            }
            this._appendUndo.apply(this, [target, selector].concat($$undo_manager$$$__Array$prototype$slice.call(args)));
          }

          return null;
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "_appendUndo", {
        value: function(target, selector) {
          var args = [].slice.call(arguments, 2);

          this._undos.push({
            target: target,
            selector: selector,
            args: args
          });
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "_appendRedo", {
        value: function(target, selector) {
          var args = [].slice.call(arguments, 2);

          this._redos.push({
            target: target,
            selector: selector,
            args: args
          });
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "undo", {
        value: function() {
          if (!this.canUndo()) {
            throw new Error('there are no registered undos');
          }
          var data = this._undos.pop();
          var target = data.target;
          var selector = data.selector;
          var args = data.args;
          this._isUndoing = true;
          target[selector].apply(target, args);
          this._isUndoing = false;
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "redo", {
        value: function() {
          if (!this.canRedo()) {
            throw new Error('there are no registered redos');
          }
          var data = this._redos.pop();
          var target = data.target;
          var selector = data.selector;
          var args = data.args;
          this._isRedoing = true;
          target[selector].apply(target, args);
          this._isRedoing = false;
          return null;
        },

        enumerable: false,
        writable: true
      });

      $$undo_manager$$$__Object$defineProperty(UndoManager.prototype, "proxyFor", {
        value: function(target) {
          var proxy = {};
          var self = this;

          function proxyMethod(selector) {
            return function() {
              var $__0;
              var args = [].slice.call(arguments, 0);
              ($__0 = self).registerUndo.apply($__0, [target, selector].concat($$undo_manager$$$__Array$prototype$slice.call(args)));
            };
          }

          $$utils$$getAllPropertyNames(target).forEach(function(selector) {
            // don't trigger anything that has a getter
            if ($$utils$$hasGetter(target, selector)) { return; }

            // don't try to proxy properties that aren't functions
            if (typeof target[selector] !== 'function') { return; }

            // set up a proxy function to register an undo
            proxy[selector] = proxyMethod(selector);
          });

          return proxy;
        },

        enumerable: false,
        writable: true
      });

      return UndoManager;
    }();

    var $$undo_manager$$default = $$undo_manager$$UndoManager;
    var $$keybindings$$$__Array$prototype$slice = Array.prototype.slice;
    var $$keybindings$$$__Object$defineProperty = Object.defineProperty;
    var $$keybindings$$A = 65;
    var $$keybindings$$Y = 89;
    var $$keybindings$$Z = 90;
    var $$keybindings$$ZERO = 48;
    var $$keybindings$$NINE = 57;
    var $$keybindings$$LEFT = 37;
    var $$keybindings$$RIGHT = 39;
    var $$keybindings$$UP = 38;
    var $$keybindings$$DOWN = 40;
    var $$keybindings$$BACKSPACE = 8;
    var $$keybindings$$DELETE = 46;
    var $$keybindings$$TAB = 9;
    var $$keybindings$$ENTER = 13;

    var $$keybindings$$KEYS = {
      A: $$keybindings$$A,
      Y: $$keybindings$$Y,
      Z: $$keybindings$$Z,
      ZERO: $$keybindings$$ZERO,
      NINE: $$keybindings$$NINE,
      LEFT: $$keybindings$$LEFT,
      RIGHT: $$keybindings$$RIGHT,
      UP: $$keybindings$$UP,
      DOWN: $$keybindings$$DOWN,
      BACKSPACE: $$keybindings$$BACKSPACE,
      DELETE: $$keybindings$$DELETE,
      TAB: $$keybindings$$TAB,
      ENTER: $$keybindings$$ENTER,

      isDigit: function(keyCode) {
        return $$keybindings$$ZERO <= keyCode && keyCode <= $$keybindings$$NINE;
      },

      isDirectional: function(keyCode) {
        return keyCode === $$keybindings$$LEFT || keyCode === $$keybindings$$RIGHT || keyCode === $$keybindings$$UP || keyCode === $$keybindings$$DOWN;
      }
    };

    var $$keybindings$$CTRL  = 1 << 0;
    var $$keybindings$$META  = 1 << 1;
    var $$keybindings$$ALT   = 1 << 2;
    var $$keybindings$$SHIFT = 1 << 3;
    var $$keybindings$$cache = {};

    function $$keybindings$$keyBindingsForPlatform(platform) {
      var osx = platform === 'OSX';
      var ctrl = osx ? $$keybindings$$META : $$keybindings$$CTRL;

      if (!$$keybindings$$cache[platform]) {
        $$keybindings$$cache[platform] = $$keybindings$$build(platform, function(bind) {
          bind($$keybindings$$A         , ctrl       , 'selectAll');
          bind($$keybindings$$LEFT      , null       , 'moveLeft');
          bind($$keybindings$$LEFT      , $$keybindings$$ALT        , 'moveWordLeft');
          bind($$keybindings$$LEFT      , $$keybindings$$SHIFT      , 'moveLeftAndModifySelection');
          bind($$keybindings$$LEFT      , $$keybindings$$ALT|$$keybindings$$SHIFT  , 'moveWordLeftAndModifySelection');
          bind($$keybindings$$RIGHT     , null       , 'moveRight');
          bind($$keybindings$$RIGHT     , $$keybindings$$ALT        , 'moveWordRight');
          bind($$keybindings$$RIGHT     , $$keybindings$$SHIFT      , 'moveRightAndModifySelection');
          bind($$keybindings$$RIGHT     , $$keybindings$$ALT|$$keybindings$$SHIFT  , 'moveWordRightAndModifySelection');
          bind($$keybindings$$UP        , null       , 'moveUp');
          bind($$keybindings$$UP        , $$keybindings$$ALT        , 'moveToBeginningOfParagraph');
          bind($$keybindings$$UP        , $$keybindings$$SHIFT      , 'moveUpAndModifySelection');
          bind($$keybindings$$UP        , $$keybindings$$ALT|$$keybindings$$SHIFT  , 'moveParagraphBackwardAndModifySelection');
          bind($$keybindings$$DOWN      , null       , 'moveDown');
          bind($$keybindings$$DOWN      , $$keybindings$$ALT        , 'moveToEndOfParagraph');
          bind($$keybindings$$DOWN      , $$keybindings$$SHIFT      , 'moveDownAndModifySelection');
          bind($$keybindings$$DOWN      , $$keybindings$$ALT|$$keybindings$$SHIFT  , 'moveParagraphForwardAndModifySelection');
          bind($$keybindings$$BACKSPACE , null       , 'deleteBackward');
          bind($$keybindings$$BACKSPACE , $$keybindings$$SHIFT      , 'deleteBackward');
          bind($$keybindings$$BACKSPACE , $$keybindings$$ALT        , 'deleteWordBackward');
          bind($$keybindings$$BACKSPACE , $$keybindings$$ALT|$$keybindings$$SHIFT  , 'deleteWordBackward');
          bind($$keybindings$$BACKSPACE , ctrl       , 'deleteBackwardToBeginningOfLine');
          bind($$keybindings$$BACKSPACE , ctrl|$$keybindings$$SHIFT , 'deleteBackwardToBeginningOfLine');
          bind($$keybindings$$DELETE    , null       , 'deleteForward');
          bind($$keybindings$$DELETE    , $$keybindings$$ALT        , 'deleteWordForward');
          bind($$keybindings$$TAB       , null       , 'insertTab');
          bind($$keybindings$$TAB       , $$keybindings$$SHIFT      , 'insertBackTab');
          bind($$keybindings$$ENTER     , null       , 'insertNewline');
          bind($$keybindings$$Z         , ctrl       , 'undo');

          if (osx) {
            bind($$keybindings$$LEFT      , $$keybindings$$META       , 'moveToBeginningOfLine');
            bind($$keybindings$$LEFT      , $$keybindings$$META|$$keybindings$$SHIFT , 'moveToBeginningOfLineAndModifySelection');
            bind($$keybindings$$RIGHT     , $$keybindings$$META       , 'moveToEndOfLine');
            bind($$keybindings$$RIGHT     , $$keybindings$$META|$$keybindings$$SHIFT , 'moveToEndOfLineAndModifySelection');
            bind($$keybindings$$UP        , $$keybindings$$META       , 'moveToBeginningOfDocument');
            bind($$keybindings$$UP        , $$keybindings$$META|$$keybindings$$SHIFT , 'moveToBeginningOfDocumentAndModifySelection');
            bind($$keybindings$$DOWN      , $$keybindings$$META       , 'moveToEndOfDocument');
            bind($$keybindings$$DOWN      , $$keybindings$$META|$$keybindings$$SHIFT , 'moveToEndOfDocumentAndModifySelection');
            bind($$keybindings$$BACKSPACE , $$keybindings$$CTRL       , 'deleteBackwardByDecomposingPreviousCharacter');
            bind($$keybindings$$BACKSPACE , $$keybindings$$CTRL|$$keybindings$$SHIFT , 'deleteBackwardByDecomposingPreviousCharacter');
            bind($$keybindings$$Z         , $$keybindings$$META|$$keybindings$$SHIFT , 'redo');
          } else {
            bind($$keybindings$$Y         , $$keybindings$$CTRL       , 'redo');
          }
        });
      }

      return $$keybindings$$cache[platform];
    }

    function $$keybindings$$build(platform, callback) {
      var result = new $$keybindings$$BindingSet(platform);
      callback(function() {
        var $__0;
        var args = [].slice.call(arguments, 0);
        return ($__0 = result).bind.apply($__0, $$keybindings$$$__Array$prototype$slice.call(args));
      });
      return result;
    }

    var $$keybindings$$BindingSet = function() {
      function BindingSet(platform) {
        this.platform = platform;
        this.bindings = {};
      }

      $$keybindings$$$__Object$defineProperty(BindingSet.prototype, "bind", {
        value: function(keyCode, modifiers, action) {
          if (!this.bindings[keyCode]) { this.bindings[keyCode] = {}; }
          this.bindings[keyCode][modifiers || 0] = action;
        },

        enumerable: false,
        writable: true
      });

      $$keybindings$$$__Object$defineProperty(BindingSet.prototype, "actionForEvent", {
        value: function(event) {
          var bindingsForKeyCode = this.bindings[event.keyCode];
          if (bindingsForKeyCode) {
            var modifiers = 0;
            if (event.altKey) { modifiers |= $$keybindings$$ALT; }
            if (event.ctrlKey) { modifiers |= $$keybindings$$CTRL; }
            if (event.metaKey) { modifiers |= $$keybindings$$META; }
            if (event.shiftKey) { modifiers |= $$keybindings$$SHIFT; }
            return bindingsForKeyCode[modifiers];
          }
        },

        enumerable: false,
        writable: true
      });

      return BindingSet;
    }();

    var $$caret$$default = Caret;
    var $$text_field$$$__Object$defineProperty = Object.defineProperty;

    var $$text_field$$AFFINITY = {
      UPSTREAM: 0,
      DOWNSTREAM: 1,
      NONE: null
    };

    function $$text_field$$isWordChar(chr) {
      return chr && /^\w$/.test(chr);
    }

    function $$text_field$$hasLeftWordBreakAtIndex(text, index) {
      if (index === 0) {
        return true;
      } else {
        return !$$text_field$$isWordChar(text[index - 1]) && $$text_field$$isWordChar(text[index]);
      }
    }

    function $$text_field$$hasRightWordBreakAtIndex(text, index) {
      if (index === text.length) {
        return true;
      } else {
        return $$text_field$$isWordChar(text[index]) && !$$text_field$$isWordChar(text[index + 1]);
      }
    }

    var $$text_field$$TextField = function() {
      function TextField(element, formatter) {
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
        this._focusout = $$utils$$bind(this._focusout, this);
        this._focusin = $$utils$$bind(this._focusin, this);
        this._click = $$utils$$bind(this._click, this);
        this._paste = $$utils$$bind(this._paste, this);
        this._keyUp = $$utils$$bind(this._keyUp, this);
        this._keyPress = $$utils$$bind(this._keyPress, this);
        this._keyDown = $$utils$$bind(this._keyDown, this);
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
        element.addEventListener('focusin', this._focusin);
        element.addEventListener('focusout', this._focusout);
        this._buildKeybindings();

        var window = element.ownerDocument.defaultView;

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
        this.selectionAffinity = $$text_field$$AFFINITY.NONE;
      }

      $$text_field$$$__Object$defineProperty(TextField.prototype, "textDidChange", {
        value: function() {},
        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "textFieldDidEndEditing", {
        value: function() {},
        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "textFieldDidBeginEditing", {
        value: function() {},
        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_textDidChange", {
        value: function() {
          var delegate = this._delegate;
          this.textDidChange();
          if (delegate && typeof delegate.textDidChange === 'function') {
            delegate.textDidChange(this);
          }

          // manually fire the HTML5 input event
          this._fireEvent('input');
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_textFieldDidEndEditing", {
        value: function() {
          var delegate = this._delegate;
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
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_textFieldDidBeginEditing", {
        value: function() {
          var delegate = this._delegate;
          this.textFieldDidBeginEditing();
          if (delegate && typeof delegate.textFieldDidBeginEditing === 'function') {
            delegate.textFieldDidBeginEditing(this);
          }
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "clearSelection", {
        value: function() {
          this.replaceSelection('');
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "delegate", {
        value: function() {
          return this._delegate;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setDelegate", {
        value: function(delegate) {
          this._delegate = delegate;
          return null;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "deleteBackward", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          if (range.length === 0) {
            range.start--;
            range.length++;
            this.setSelectedRange(range);
          }
          this.clearSelection();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "deleteWordBackward", {
        value: function(event) {
          if (this.hasSelection()) {
            this.deleteBackward(event);
          } else {
            event.preventDefault();
            var range = this.selectedRange();
            var start = this._lastWordBreakBeforeIndex(range.start);
            range.length += range.start - start;
            range.start = start;
            this.setSelectedRange(range);
            this.clearSelection();
          }
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "deleteBackwardByDecomposingPreviousCharacter", {
        value: function(event) {
          this.deleteBackward(event);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "deleteBackwardToBeginningOfLine", {
        value: function(event) {
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
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "deleteForward", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          if (range.length === 0) {
            range.length++;
            this.setSelectedRange(range);
          }
          return this.clearSelection();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "deleteWordForward", {
        value: function(event) {
          if (this.hasSelection()) {
            return this.deleteForward(event);
          } else {
            event.preventDefault();
            var range = this.selectedRange();
            var end = this._nextWordBreakAfterIndex(range.start + range.length);
            this.setSelectedRange({
              start: range.start,
              length: end - range.start
            });
            this.clearSelection();
          }
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "destroy", {
        value: function() {
          var element = this.element;
          element.removeEventListener('keydown', this._keyDown);
          element.removeEventListener('keypress', this._keyPress);
          element.removeEventListener('keyup', this._keyUp);
          element.removeEventListener('click', this._click);
          element.removeEventListener('paste', this._paste);
          element.removeEventListener('focusin', this._focusin);
          element.removeEventListener('focusout', this._focusout);
          delete element['field-kit-text-field'];
          return null;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "formatter", {
        value: function() {
          if (!this._formatter) {
            this._formatter = new $$formatter$$default();
            var maximumLengthString = this.element.getAttribute('maxlength');
            if (maximumLengthString !== undefined && maximumLengthString !== null) {
              this._formatter.maximumLength = parseInt(maximumLengthString, 10);
            }
          }

          return this._formatter;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setFormatter", {
        value: function(formatter) {
          var value = this.value();
          this._formatter = formatter;
          this.setValue(value);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "hasSelection", {
        value: function() {
          return this.selectedRange().length !== 0;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "insertBackTab", {
        value: function() {},
        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "insertTab", {
        value: function() {},
        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "insertText", {
        value: function(text) {
          var range;
          if (this.hasSelection()) {
            this.clearSelection();
          }

          this.replaceSelection(text);
          range = this.selectedRange();
          range.start += range.length;
          range.length = 0;
          return this.setSelectedRange(range);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "insertNewline", {
        value: function() {
          this._textFieldDidEndEditing();
          this._didEndEditingButKeptFocus = true;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "inspect", {
        value: function() {
          return '#<TextField text="' + this.text() + '">';
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveUp", {
        value: function(event) {
          event.preventDefault();
          this.setSelectedRange({
            start: 0,
            length: 0
          });
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToBeginningOfParagraph", {
        value: function(event) {
          this.moveUp(event);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveUpAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          switch (this.selectionAffinity) {
            case $$text_field$$AFFINITY.UPSTREAM:
            case $$text_field$$AFFINITY.NONE:
              // 12<34 56|78  =>  <1234 56|78
              range.length += range.start;
              range.start = 0;
              break;
            case $$text_field$$AFFINITY.DOWNSTREAM:
              // 12|34 56>78   =>   <12|34 5678
              range.length = range.start;
              range.start = 0;
              break;
          }
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.UPSTREAM);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveParagraphBackwardAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          switch (this.selectionAffinity) {
            case $$text_field$$AFFINITY.UPSTREAM:
            case $$text_field$$AFFINITY.NONE:
              // 12<34 56|78  =>  <1234 56|78
              range.length += range.start;
              range.start = 0;
              break;
            case $$text_field$$AFFINITY.DOWNSTREAM:
              // 12|34 56>78  =>  12|34 5678
              range.length = 0;
              break;
          }
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.UPSTREAM);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToBeginningOfDocument", {
        value: function(event) {
          // Since we only support a single line this is just an alias.
          this.moveToBeginningOfLine(event);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToBeginningOfDocumentAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          range.length += range.start;
          range.start = 0;
          return this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.UPSTREAM);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveDown", {
        value: function(event) {
          event.preventDefault();
          // 12|34 56|78  =>  1234 5678|
          var range = {
            start: this.text().length,
            length: 0
          };
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.NONE);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToEndOfParagraph", {
        value: function(event) {
          this.moveDown(event);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveDownAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          var end = this.text().length;
          if (this.selectionAffinity === $$text_field$$AFFINITY.UPSTREAM) {
            range.start += range.length;
          }
          range.length = end - range.start;
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.DOWNSTREAM);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveParagraphForwardAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          switch (this.selectionAffinity) {
            case $$text_field$$AFFINITY.DOWNSTREAM:
            case $$text_field$$AFFINITY.NONE:
              // 12|34 56>78  =>  12|34 5678>
              range.length = this.text().length - range.start;
              break;
            case $$text_field$$AFFINITY.UPSTREAM:
              // 12<34 56|78  =>  12|34 5678
              range.start += range.length;
              range.length = 0;
              break;
          }
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.DOWNSTREAM);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToEndOfDocument", {
        value: function(event) {
          // Since we only support a single line this is just an alias.
          this.moveToEndOfLine(event);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToEndOfDocumentAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          range.length = this.text().length - range.start;
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.DOWNSTREAM);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveLeft", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          if (range.length !== 0) {
            range.length = 0;
          } else {
            range.start--;
          }
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.NONE);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveLeftAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          switch (this.selectionAffinity) {
            case $$text_field$$AFFINITY.UPSTREAM:
            case $$text_field$$AFFINITY.NONE:
              this.selectionAffinity = $$text_field$$AFFINITY.UPSTREAM;
              range.start--;
              range.length++;
              break;
            case $$text_field$$AFFINITY.DOWNSTREAM:
              range.length--;
              break;
          }
          this.setSelectedRange(range);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveWordLeft", {
        value: function(event) {
          event.preventDefault();
          var index = this._lastWordBreakBeforeIndex(this.selectedRange().start - 1);
          this.setSelectedRange({ start: index, length: 0 });
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveWordLeftAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          switch (this.selectionAffinity) {
            case $$text_field$$AFFINITY.UPSTREAM:
            case $$text_field$$AFFINITY.NONE:
              this.selectionAffinity = $$text_field$$AFFINITY.UPSTREAM;
              var start = this._lastWordBreakBeforeIndex(range.start - 1);
              range.length += range.start - start;
              range.start = start;
              break;
            case $$text_field$$AFFINITY.DOWNSTREAM:
              var end = this._lastWordBreakBeforeIndex(range.start + range.length);
              if (end < range.start) {
                end = range.start;
              }
              range.length -= range.start + range.length - end;
              break;
          }
          this.setSelectedRange(range);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToBeginningOfLine", {
        value: function(event) {
          event.preventDefault();
          this.setSelectedRange({ start: 0, length: 0 });
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToBeginningOfLineAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          range.length += range.start;
          range.start = 0;
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.UPSTREAM);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveRight", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          if (range.length !== 0) {
            range.start += range.length;
            range.length = 0;
          } else {
            range.start++;
          }
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.NONE);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveRightAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          switch (this.selectionAffinity) {
            case $$text_field$$AFFINITY.UPSTREAM:
              range.start++;
              range.length--;
              break;
            case $$text_field$$AFFINITY.DOWNSTREAM:
            case $$text_field$$AFFINITY.NONE:
              this.selectionAffinity = $$text_field$$AFFINITY.DOWNSTREAM;
              range.length++;
              break;
          }
          this.setSelectedRange(range);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveWordRight", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          var index = this._nextWordBreakAfterIndex(range.start + range.length);
          this.setSelectedRange({ start: index, length: 0 });
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveWordRightAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          var start = range.start;
          var end = range.start + range.length;
          switch (this.selectionAffinity) {
            case $$text_field$$AFFINITY.UPSTREAM:
              start = Math.min(this._nextWordBreakAfterIndex(start), end);
              break;
            case $$text_field$$AFFINITY.DOWNSTREAM:
            case $$text_field$$AFFINITY.NONE:
              this.selectionAffinity = $$text_field$$AFFINITY.DOWNSTREAM;
              end = this._nextWordBreakAfterIndex(range.start + range.length);
              break;
          }
          this.setSelectedRange({ start: start, length: end - start });
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToEndOfLine", {
        value: function(event) {
          event.preventDefault();
          this.setSelectedRange({ start: this.text().length, length: 0 });
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "moveToEndOfLineAndModifySelection", {
        value: function(event) {
          event.preventDefault();
          var range = this.selectedRange();
          range.length = this.text().length - range.start;
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.DOWNSTREAM);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "readSelectionFromPasteboard", {
        value: function(pasteboard) {
          var range, text;
          text = pasteboard.getData('Text');
          this.replaceSelection(text);
          range = this.selectedRange();
          range.start += range.length;
          range.length = 0;
          this.setSelectedRange(range);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "replaceSelection", {
        value: function(replacement) {
          var range = this.selectedRange();
          var end = range.start + range.length;
          var text = this.text();
          text = text.substring(0, range.start) + replacement + text.substring(end);
          range.length = replacement.length;
          this.setText(text);
          this.setSelectedRangeWithAffinity(range, $$text_field$$AFFINITY.NONE);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "rightWordBreakIndexes", {
        value: function() {
          var result = [];
          var text = this.text();
          for (var i = 0, l = text.length; i <= l; i++) {
            if ($$text_field$$hasRightWordBreakAtIndex(text, i)) {
              result.push(i + 1);
            }
          }
          return result;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "rollbackInvalidChanges", {
        value: function(callback) {
          var result = null;
          var errorType = null;
          var change = $$text_field$$TextFieldStateChange.build(this, function() {
            result = callback();
          });
          var error = function(type) { errorType = type; };
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
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "selectAll", {
        value: function(event) {
          event.preventDefault();
          this.setSelectedRangeWithAffinity({
            start: 0,
            length: this.text().length
          }, $$text_field$$AFFINITY.NONE);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "text", {
        value: function() {
          return this.element.value;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setText", {
        value: function(text) {
          this.element.value = text;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "value", {
        value: function() {
          var text = this.text();
          var delegate = this.delegate();
          var formatter = this.formatter();
          if (!formatter) { return value; }

          return formatter.parse(text, function(errorType) {
            if (delegate) {
              if (typeof delegate.textFieldDidFailToParseString === 'function') {
                delegate.textFieldDidFailToParseString(this, text, errorType);
              }
            }
          }.bind(this));
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setValue", {
        value: function(value) {
          if (this._formatter) {
            value = this._formatter.format(value);
          }
          this.setText('' + value);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "selectedRange", {
        value: function() {
          var caret = this._needsManualCaret ?
              this._manualCaret :
              $$caret$$default.get(this.element);

          return {
            start: caret.start,
            length: caret.end - caret.start
          };
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setSelectedRange", {
        value: function(range) {
          return this.setSelectedRangeWithAffinity(range, this.selectionAffinity);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setSelectedRangeWithAffinity", {
        value: function(range, affinity) {
          var min = 0;
          var max = this.text().length;
          var caret = {
            start: Math.max(min, Math.min(max, range.start)),
            end: Math.max(min, Math.min(max, range.start + range.length))
          };
          this._manualCaret = caret;
          $$caret$$default.set(this.element, caret.start, caret.end);
          this.selectionAffinity = range.length === 0 ? $$text_field$$AFFINITY.NONE : affinity;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "selectionAnchor", {
        value: function() {
          var range = this.selectedRange();
          switch (this.selectionAffinity) {
            case $$text_field$$AFFINITY.UPSTREAM:
              return range.start + range.length;
            case $$text_field$$AFFINITY.DOWNSTREAM:
              return range.start;
            default:
              return null;
          }
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "allowsUndo", {
        value: function() {
          return this._allowsUndo;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setAllowsUndo", {
        value: function(allowsUndo) {
          this._allowsUndo = allowsUndo;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "redo", {
        value: function(event) {
          if (this.undoManager().canRedo()) {
            this.undoManager().redo();
          }
          event.preventDefault();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "undo", {
        value: function(event) {
          if (this.undoManager().canUndo()) {
            this.undoManager().undo();
          }
          event.preventDefault();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "undoManager", {
        value: function() {
          return this._undoManager || (this._undoManager = new $$undo_manager$$default());
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "becomeFirstResponder", {
        value: function() {
          this.element.focus();
          this.rollbackInvalidChanges(function() {
            this.element.select();
            this._syncPlaceholder();
          }.bind(this));
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "hasFocus", {
        value: function() {
          return this.element.ownerDocument.activeElement === this.element;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "isEnabled", {
        value: function() {
          return this._enabled;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setEnabled", {
        value: function(enabled) {
          this._enabled = enabled;
          this._syncPlaceholder();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "resignFirstResponder", {
        value: function(event) {
          if (event !== undefined && event !== null) {
            event.preventDefault();
          }
          this.element.blur();
          this._syncPlaceholder();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "disabledPlaceholder", {
        value: function() {
          return this._disabledPlaceholder;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setDisabledPlaceholder", {
        value: function(_disabledPlaceholder) {
          this._disabledPlaceholder = _disabledPlaceholder;
          this._syncPlaceholder();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "focusedPlaceholder", {
        value: function() {
          return this._focusedPlaceholder;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setFocusedPlaceholder", {
        value: function(_focusedPlaceholder) {
          this._focusedPlaceholder = _focusedPlaceholder;
          this._syncPlaceholder();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "placeholder", {
        value: function() {
          return this._placeholder;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setPlaceholder", {
        value: function(_placeholder) {
          this._placeholder = _placeholder;
          this.element.setAttribute('placeholder', this._placeholder);
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "unfocusedPlaceholder", {
        value: function() {
          return this._unfocusedPlaceholder;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "setUnfocusedPlaceholder", {
        value: function(_unfocusedPlaceholder) {
          this._unfocusedPlaceholder = _unfocusedPlaceholder;
          this._syncPlaceholder();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_applyChangeFromUndoManager", {
        value: function(change) {
          this.undoManager().proxyFor(this)._applyChangeFromUndoManager(change);

          if (this.undoManager().isUndoing()) {
            this.setText(change.current.text);
            this.setSelectedRange(change.current.selectedRange);
          } else {
            this.setText(change.proposed.text);
            this.setSelectedRange(change.proposed.selectedRange);
          }

          this._textDidChange();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_buildKeybindings", {
        value: function() {
          var doc = this.element.ownerDocument;
          var win = doc.defaultView || doc.parentWindow;
          var userAgent = win.navigator.userAgent;
          var osx = /^Mozilla\/[\d\.]+ \(Macintosh/.test(userAgent);
          this._bindings = $$keybindings$$keyBindingsForPlatform(osx ? 'OSX' : 'Default');
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_click", {
        value: function() {
          if (this._needsManualCaret) {
            this._manualCaret = $$caret$$default.get(this.element);
          }
          this.selectionAffinity = $$text_field$$AFFINITY.NONE;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_fireEvent", {
        value: function(eventType) {
          if (typeof CustomEvent === 'undefined') {
            var event = document.createEvent('Event');
            event.initEvent(eventType, false, false);
            this.element.dispatchEvent(event);
          } else {
            this.element.dispatchEvent(new CustomEvent(eventType, {}));
          }
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_focusin", {
        value: function() {
          this._textFieldDidBeginEditing();
          return this._syncPlaceholder();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_focusout", {
        value: function() {
          this._textFieldDidEndEditing();
          return this._syncPlaceholder();
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_keyDown", {
        value: function(event) {
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
                this.rollbackInvalidChanges(function() {
                  return this[action](event);
                }.bind(this));
                break;
            }
          }
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_keyPress", {
        value: function(event) {
          var keyCode = event.keyCode;
          if (!event.metaKey && !event.ctrlKey &&
              keyCode !== $$keybindings$$KEYS.ENTER &&
              keyCode !== $$keybindings$$KEYS.TAB &&
              keyCode !== $$keybindings$$KEYS.BACKSPACE) {
            event.preventDefault();
            if (event.charCode !== 0) {
              var charCode = event.charCode || event.keyCode;
              this.rollbackInvalidChanges(function() {
                return this.insertText(String.fromCharCode(charCode));
              }.bind(this));
            }
          }
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_keyUp", {
        value: function(event) {
          this.rollbackInvalidChanges(function() {
            if (event.keyCode === $$keybindings$$KEYS.TAB) {
              this.selectAll(event);
            }
          }.bind(this));
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_lastWordBreakBeforeIndex", {
        value: function(index) {
          var indexes = this._leftWordBreakIndexes();
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
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_leftWordBreakIndexes", {
        value: function() {
          var result = [];
          var text = this.text();
          for (var i = 0, l = text.length; i < l; i++) {
            if ($$text_field$$hasLeftWordBreakAtIndex(text, i)) {
              result.push(i);
            }
          }
          return result;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_nextWordBreakAfterIndex", {
        value: function(index) {
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
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_paste", {
        value: function(event) {
          event.preventDefault();
          this.rollbackInvalidChanges(function() {
            this.readSelectionFromPasteboard(event.originalEvent.clipboardData);
          }.bind(this));
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextField.prototype, "_syncPlaceholder", {
        value: function() {
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
        },

        enumerable: false,
        writable: true
      });

      return TextField;
    }();

    var $$text_field$$TextFieldStateChange = function() {
      function TextFieldStateChange(field) {
        this.field = field;
      }

      $$text_field$$$__Object$defineProperty(TextFieldStateChange.prototype, "hasChanges", {
        value: function() {
          this.recomputeDiff();
          return this.current.text !== this.proposed.text ||
            this.current.selectedRange.start !== this.proposed.selectedRange.start ||
            this.current.selectedRange.length !== this.proposed.selectedRange.length;
        },

        enumerable: false,
        writable: true
      });

      $$text_field$$$__Object$defineProperty(TextFieldStateChange.prototype, "recomputeDiff", {
        value: function() {
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
        },

        enumerable: false,
        writable: true
      });

      return TextFieldStateChange;
    }();

    /**
     * Builds a new {TextFieldStateChange} that will allow you to
     * compute differences, and see the current vs proposed changes.
     *
     * @param {FieldKitField} field
     * @param {function} callback called when you want changes to the field
     *    take place. Current will be calculated before this callback.
     *    Proposed will be calculated after this callback.
     *
     * @return {object} change object with current and proposed properties
     */
    $$text_field$$TextFieldStateChange.build = function(field, callback) {
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

    var $$text_field$$default = $$text_field$$TextField;
    var $$card_text_field$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$card_text_field$$$__Object$defineProperty = Object.defineProperty;
    var $$card_text_field$$$__Object$create = Object.create;

    var $$card_text_field$$CardMaskStrategy = {
      None: 'None',
      DoneEditing: 'DoneEditing'
    };

    var $$card_text_field$$CardTextField = function($__super) {
      function CardTextField(element) {
        $$card_text_field$$$__Object$getPrototypeOf(CardTextField.prototype).constructor.call(this, element, new $$adaptive_card_formatter$$default());
        this.setCardMaskStrategy($$card_text_field$$CardMaskStrategy.None);

        /**
         * Whether we are currently masking the displayed text.
         */
        this._masked = false;

        /**
         * Whether we are currently editing.
         */
        this._editing = false;
      }

      CardTextField.__proto__ = ($__super !== null ? $__super : Function.prototype);
      CardTextField.prototype = $$card_text_field$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "constructor", {
        value: CardTextField
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "cardType", {
        value: function() {
          return $$card_utils$$determineCardType(this.value());
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "cardMaskStrategy", {
        value: function() {
          return this._cardMaskStrategy;
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "setCardMaskStrategy", {
        value: function(cardMaskStrategy) {
          if (cardMaskStrategy !== this._cardMaskStrategy) {
            this._cardMaskStrategy = cardMaskStrategy;
            this._syncMask();
          }

          return null;
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "cardMask", {
        value: function() {
          var text   = this.text();
          var toMask = text.slice(0, -4);
          var last4  = text.slice(-4);

          return toMask.replace(/\d/g, '•') + last4;
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "text", {
        value: function() {
          if (this._masked) {
            return this._unmaskedText;
          } else {
            return $$card_text_field$$$__Object$getPrototypeOf(CardTextField.prototype).text.call(this);
          }
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "setText", {
        value: function(text) {
          if (this._masked) {
            this._unmaskedText = text;
            text = this.cardMask();
          }
          $$card_text_field$$$__Object$getPrototypeOf(CardTextField.prototype).setText.call(this, text);
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "textFieldDidEndEditing", {
        value: function() {
          this._editing = false;
          this._syncMask();
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "textFieldDidBeginEditing", {
        value: function() {
          this._editing = true;
          this._syncMask();
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "_enableMasking", {
        value: function() {
          if (!this._masked) {
            this._unmaskedText = this.text();
            this._masked = true;
            this.setText(this._unmaskedText);
          }
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "_disableMasking", {
        value: function() {
          if (this._masked) {
            this._masked = false;
            this.setText(this._unmaskedText);
            this._unmaskedText = null;
          }
        },

        enumerable: false,
        writable: true
      });

      $$card_text_field$$$__Object$defineProperty(CardTextField.prototype, "_syncMask", {
        value: function() {
          if (this.cardMaskStrategy() === $$card_text_field$$CardMaskStrategy.DoneEditing) {
            if (this._editing) {
              this._disableMasking();
            } else {
              this._enableMasking();
            }
          }
        },

        enumerable: false,
        writable: true
      });

      return CardTextField;
    }($$text_field$$default);

    $$card_text_field$$CardTextField.CardMaskStrategy = $$card_text_field$$CardMaskStrategy;
    var $$card_text_field$$default = $$card_text_field$$CardTextField;
    var $$expiry_date_formatter$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$expiry_date_formatter$$$__Object$defineProperty = Object.defineProperty;
    var $$expiry_date_formatter$$$__Object$create = Object.create;

    function $$expiry_date_formatter$$interpretTwoDigitYear(year) {
      var thisYear = new Date().getFullYear();
      var thisCentury = thisYear - (thisYear % 100);
      var centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort(function(a, b) {
        return Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b));
      });
      return year + centuries[0];
    }

    var $$expiry_date_formatter$$ExpiryDateFormatter = function($__super) {
      function ExpiryDateFormatter() {
        $$expiry_date_formatter$$$__Object$getPrototypeOf(ExpiryDateFormatter.prototype).constructor.call(this, '/');
        this.maximumLength = 5;
      }

      ExpiryDateFormatter.__proto__ = ($__super !== null ? $__super : Function.prototype);
      ExpiryDateFormatter.prototype = $$expiry_date_formatter$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$expiry_date_formatter$$$__Object$defineProperty(ExpiryDateFormatter.prototype, "constructor", {
        value: ExpiryDateFormatter
      });

      $$expiry_date_formatter$$$__Object$defineProperty(ExpiryDateFormatter.prototype, "hasDelimiterAtIndex", {
        value: function(index) {
          return index === 2;
        },

        enumerable: false,
        writable: true
      });

      $$expiry_date_formatter$$$__Object$defineProperty(ExpiryDateFormatter.prototype, "format", {
        value: function(value) {
          if (!value) { return ''; }

          var month = value.month;
          var year = value.year;
          year = year % 100;

          return $$expiry_date_formatter$$$__Object$getPrototypeOf(ExpiryDateFormatter.prototype).format.call(this, $$utils$$zpad2(month) + $$utils$$zpad2(year));
        },

        enumerable: false,
        writable: true
      });

      $$expiry_date_formatter$$$__Object$defineProperty(ExpiryDateFormatter.prototype, "parse", {
        value: function(text, error) {
          var monthAndYear = text.split(this.delimiter);
          var month = monthAndYear[0];
          var year = monthAndYear[1];
          if (month && month.match(/^(0?[1-9]|1\d)$/) && year && year.match(/^\d\d?$/)) {
            month = Number(month);
            year = $$expiry_date_formatter$$interpretTwoDigitYear(Number(year));
            return { month: month, year: year };
          } else {
            if (typeof error === 'function') {
              error('expiry-date-formatter.invalid-date');
            }
            return null;
          }
        },

        enumerable: false,
        writable: true
      });

      $$expiry_date_formatter$$$__Object$defineProperty(ExpiryDateFormatter.prototype, "isChangeValid", {
        value: function(change, error) {
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

            var match = newText.match(/^(\d\d)(.)(\d\d?).*$/);
            if (match && match[2] === this.delimiter) {
              newText = match[1] + this.delimiter + match[3];
            }
          }

          change.proposed.text = newText;
          change.proposed.selectedRange = { start: newText.length, length: 0 };

          return true;
        },

        enumerable: false,
        writable: true
      });

      return ExpiryDateFormatter;
    }($$delimited_text_formatter$$default);

    var $$expiry_date_formatter$$default = $$expiry_date_formatter$$ExpiryDateFormatter;
    var $$expiry_date_field$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$expiry_date_field$$$__Object$defineProperty = Object.defineProperty;
    var $$expiry_date_field$$$__Object$create = Object.create;

    var $$expiry_date_field$$ExpiryDateField = function($__super) {
      function ExpiryDateField(element) {
        $$expiry_date_field$$$__Object$getPrototypeOf(ExpiryDateField.prototype).constructor.call(this, element, new $$expiry_date_formatter$$default());
      }

      ExpiryDateField.__proto__ = ($__super !== null ? $__super : Function.prototype);
      ExpiryDateField.prototype = $$expiry_date_field$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$expiry_date_field$$$__Object$defineProperty(ExpiryDateField.prototype, "constructor", {
        value: ExpiryDateField
      });

      $$expiry_date_field$$$__Object$defineProperty(ExpiryDateField.prototype, "textFieldDidEndEditing", {
        value: function() {
          var value = this.value();
          if (value) {
            return this.setText(this.formatter().format(value));
          }
        },

        enumerable: false,
        writable: true
      });

      return ExpiryDateField;
    }($$text_field$$default);

    var $$expiry_date_field$$default = $$expiry_date_field$$ExpiryDateField;

    var stround$$modes = {
      CEILING: 0,
      FLOOR: 1,
      DOWN: 2,
      UP: 3,
      HALF_EVEN: 4,
      HALF_DOWN: 5,
      HALF_UP: 6
    };

    /**
     * @const
     * @private
     * */
    var stround$$NEG = '-';

    /**
     * @const
     * @private
     * */
    var stround$$SEP = '.';

    /**
     * @const
     * @private
     * */
    var stround$$NEG_PATTERN = '-';

    /**
     * @const
     * @private
     * */
    var stround$$SEP_PATTERN = '\\.';

    /**
     * @const
     * @private
     * */
    var stround$$NUMBER_PATTERN = new RegExp(
      '^(' + stround$$NEG_PATTERN + ')?(\\d*)(?:' + stround$$SEP_PATTERN + '(\\d*))?$'
    );

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
    function stround$$increment(strint) {
      var length = strint.length;

      if (length === 0) {
        return '1';
      }

      var last = parseInt(strint[length-1], 10);

      if (last === 9) {
        return stround$$increment(strint.slice(0, length-1)) + '0';
      } else {
        return strint.slice(0, length-1) + (last+1);
      }
    }

    function stround$$parse(strnum) {
      switch (strnum) {
        case 'NaN': case 'Infinity': case '-Infinity':
          return null;
      }

      var match = strnum.match(stround$$NUMBER_PATTERN);

      if (!match) {
        throw new Error('cannot round malformed number: '+strnum);
      }

      return [
        match[1] !== undefined,
        match[2],
        match[3] || ''
      ];
    }

    function stround$$format(parts) {
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

      return (negative ? stround$$NEG + intPart : intPart) + (fracPart.length ? stround$$SEP + fracPart : '');
    }

    function stround$$shiftParts(parts, exponent) {
      var negative = parts[0];
      var intPart = parts[1];
      var fracPart = parts[2];
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

      return [negative, intPart, fracPart];
    }

    function stround$$shift(strnum, exponent) {
      if (typeof strnum === 'number') {
        strnum = ''+strnum;
      }

      var parsed = stround$$parse(strnum);
      if (parsed === null) {
        return strnum;
      } else {
        return stround$$format(stround$$shiftParts(parsed, exponent));
      }
    }

    function stround$$round(strnum, precision, mode) {
      if (typeof strnum === 'number') {
        strnum = ''+strnum;
      }

      if (typeof strnum !== 'string') {
        throw new Error('expected a string or number, got: '+strnum);
      }

      if (strnum.length === 0) {
        return strnum;
      }

      if (precision === null || precision === undefined) {
        precision = 0;
      }

      if (mode === undefined) {
        mode = stround$$modes.HALF_EVEN;
      }

      var parsed = stround$$parse(strnum);

      if (parsed === null) {
        return strnum;
      }

      if (precision > 0) {
        parsed = stround$$shiftParts(parsed, precision);
      }

      var i, length;

      var negative = parsed[0];
      var intPart = parsed[1];
      var fracPart = parsed[2];

      switch (mode) {
        case stround$$modes.CEILING: case stround$$modes.FLOOR: case stround$$modes.UP:
          var foundNonZeroDigit = false;
          for (i = 0, length = fracPart.length; i < length; i++) {
            if (fracPart[i] !== '0') {
              foundNonZeroDigit = true;
              break;
            }
          }
          if (foundNonZeroDigit) {
            if (mode === stround$$modes.UP || (negative !== (mode === stround$$modes.CEILING))) {
              intPart = stround$$increment(intPart);
            }
          }
          break;

        case stround$$modes.HALF_EVEN: case stround$$modes.HALF_DOWN: case stround$$modes.HALF_UP:
          var shouldRoundUp = false;
          var firstFracPartDigit = parseInt(fracPart[0], 10);

          if (firstFracPartDigit > 5) {
            shouldRoundUp = true;
          } else if (firstFracPartDigit === 5) {
            if (mode === stround$$modes.HALF_UP) {
              shouldRoundUp = true;
            }

            if (!shouldRoundUp) {
              for (i = 1, length = fracPart.length; i < length; i++) {
                if (fracPart[i] !== '0') {
                  shouldRoundUp = true;
                  break;
                }
              }
            }

            if (!shouldRoundUp && mode === stround$$modes.HALF_EVEN) {
              var lastIntPartDigit = parseInt(intPart[intPart.length-1], 10);
              shouldRoundUp = lastIntPartDigit % 2 !== 0;
            }
          }

          if (shouldRoundUp) {
            intPart = stround$$increment(intPart);
          }
          break;
      }

      return stround$$format(stround$$shiftParts([negative, intPart, ''], -precision));
    }

    var $$number_formatter$$$__Array$prototype$slice = Array.prototype.slice;
    var $$number_formatter$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$number_formatter$$$__Object$defineProperty = Object.defineProperty;
    var $$number_formatter$$$__Object$create = Object.create;

    // Style
    var $$number_formatter$$NONE = 0;

    var $$number_formatter$$CURRENCY = 1;
    var $$number_formatter$$PERCENT = 2;
    var $$number_formatter$$DEFAULT_LOCALE = 'en-US';
    var $$number_formatter$$DEFAULT_COUNTRY = 'US';

    function $$number_formatter$$splitLocaleComponents(locale) {
      var match = locale.match(/^([a-z][a-z])(?:[-_]([a-z][a-z]))?$/i);
      if (match) {
        var lang = match[1] && match[1].toLowerCase();
        var country = match[2] && match[2].toLowerCase();
        return { lang: lang, country: country };
      }
    }

    /**
     * This simple property getter assumes that properties will never be functions
     * and so attempts to run those functions using the given args.
     */
    function $$number_formatter$$get(object, key) {
      var args = [].slice.call(arguments, 2);

      if (object) {
        var value = object[key];
        if (typeof value === 'function') {
          return value.apply(null, $$number_formatter$$$__Array$prototype$slice.call(args));
        } else {
          return value;
        }
      }
    }

    var $$number_formatter$$NumberFormatter = function($__super) {
      function NumberFormatter() {
        $$number_formatter$$$__Object$getPrototypeOf(NumberFormatter.prototype).constructor.call(this);
        this._locale = 'en';
        this.setNumberStyle($$number_formatter$$NONE);
      }

      NumberFormatter.__proto__ = ($__super !== null ? $__super : Function.prototype);
      NumberFormatter.prototype = $$number_formatter$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "constructor", {
        value: NumberFormatter
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "allowsFloats", {
        value: function() {
          return this._get('allowsFloats');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setAllowsFloats", {
        value: function(allowsFloats) {
          this._allowsFloats = allowsFloats;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "alwaysShowsDecimalSeparator", {
        value: function() {
          return this._get('alwaysShowsDecimalSeparator');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setAlwaysShowsDecimalSeparator", {
        value: function(alwaysShowsDecimalSeparator) {
          this._alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "countryCode", {
        value: function() {
          return this._countryCode || $$number_formatter$$DEFAULT_COUNTRY;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setCountryCode", {
        value: function(countryCode) {
          this._countryCode = countryCode;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "currencyCode", {
        value: function() {
          return this._get('currencyCode');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setCurrencyCode", {
        value: function(currencyCode) {
          this._currencyCode = currencyCode;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "currencySymbol", {
        value: function() {
          if (this._shouldShowNativeCurrencySymbol()) {
            return this._get('currencySymbol');
          } else {
            return this._get('internationalCurrencySymbol');
          }
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setCurrencySymbol", {
        value: function(currencySymbol) {
          this._currencySymbol = currencySymbol;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "_shouldShowNativeCurrencySymbol", {
        value: function() {
          var regionDefaultCurrencyCode = this._regionDefaults().currencyCode;
          if (typeof regionDefaultCurrencyCode === 'function') {
            regionDefaultCurrencyCode = regionDefaultCurrencyCode();
          }
          return this.currencyCode() === regionDefaultCurrencyCode;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "decimalSeparator", {
        value: function() {
          return this._get('decimalSeparator');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setDecimalSeparator", {
        value: function(decimalSeparator) {
          this._decimalSeparator = decimalSeparator;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "groupingSeparator", {
        value: function() {
          return this._get('groupingSeparator');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setGroupingSeparator", {
        value: function(groupingSeparator) {
          this._groupingSeparator = groupingSeparator;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "groupingSize", {
        value: function() {
          return this._get('groupingSize');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setGroupingSize", {
        value: function(groupingSize) {
          this._groupingSize = groupingSize;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "internationalCurrencySymbol", {
        value: function() {
          return this._get('internationalCurrencySymbol');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setInternationalCurrencySymbol", {
        value: function(internationalCurrencySymbol) {
          this._internationalCurrencySymbol = internationalCurrencySymbol;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "isLenient", {
        value: function() {
          return this._lenient;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setLenient", {
        value: function(lenient) {
          this._lenient = lenient;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "locale", {
        value: function() {
          return this._locale || $$number_formatter$$DEFAULT_LOCALE;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setLocale", {
        value: function(locale) {
          this._locale = locale;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "maximum", {
        value: function() {
          return this._maximum;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setMaximum", {
        value: function(max) {
          this._maximum = max;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "minimum", {
        value: function() {
          return this._minimum;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setMinimum", {
        value: function(min) {
          this._minimum = min;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "maximumFractionDigits", {
        value: function() {
          var result = this._get('maximumFractionDigits');
          var minimumFractionDigits = this._minimumFractionDigits;
          if (result !== null && result !== undefined &&
              minimumFractionDigits !== null && minimumFractionDigits !== undefined &&
              minimumFractionDigits > result) {
            result = minimumFractionDigits;
          }
          return result;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setMaximumFractionDigits", {
        value: function(maximumFractionDigits) {
          this._maximumFractionDigits = maximumFractionDigits;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "minimumFractionDigits", {
        value: function() {
          var result = this._get('minimumFractionDigits');
          var maximumFractionDigits = this._maximumFractionDigits;
          if (result !== null && result !== undefined &&
              maximumFractionDigits !== null && maximumFractionDigits !== undefined &&
              maximumFractionDigits < result) {
            result = maximumFractionDigits;
          }
          return result;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setMinimumFractionDigits", {
        value: function(minimumFractionDigits) {
          this._minimumFractionDigits = minimumFractionDigits;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "maximumIntegerDigits", {
        value: function() {
          var result = this._get('maximumIntegerDigits');
          var minimumIntegerDigits = this._minimumIntegerDigits;
          if (result !== null && result !== undefined &&
              minimumIntegerDigits !== null && minimumIntegerDigits !== undefined &&
              minimumIntegerDigits > result) {
            result = minimumIntegerDigits;
          }
          return result;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setMaximumIntegerDigits", {
        value: function(maximumIntegerDigits) {
          this._maximumIntegerDigits = maximumIntegerDigits;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "minimumIntegerDigits", {
        value: function() {
          var result = this._get('minimumIntegerDigits');
          var maximumIntegerDigits = this._maximumIntegerDigits;
          if (result !== null && result !== undefined &&
              maximumIntegerDigits !== null && maximumIntegerDigits !== undefined &&
              maximumIntegerDigits < result) {
            result = maximumIntegerDigits;
          }
          return result;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setMinimumIntegerDigits", {
        value: function(minimumIntegerDigits) {
          this._minimumIntegerDigits = minimumIntegerDigits;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "exponent", {
        value: function() {
          return this._get('exponent');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setExponent", {
        value: function(exponent) {
          this._exponent = exponent;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "negativeInfinitySymbol", {
        value: function() {
          return this._get('negativeInfinitySymbol');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setNegativeInfinitySymbol", {
        value: function(negativeInfinitySymbol) {
          this._negativeInfinitySymbol = negativeInfinitySymbol;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "negativePrefix", {
        value: function() {
          return this._get('negativePrefix');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setNegativePrefix", {
        value: function(prefix) {
          this._negativePrefix = prefix;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "negativeSuffix", {
        value: function() {
          return this._get('negativeSuffix');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setNegativeSuffix", {
        value: function(prefix) {
          this._negativeSuffix = prefix;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "notANumberSymbol", {
        value: function() {
          return this._get('notANumberSymbol');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setNotANumberSymbol", {
        value: function(notANumberSymbol) {
          this._notANumberSymbol = notANumberSymbol;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "nullSymbol", {
        value: function() {
          return this._get('nullSymbol');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setNullSymbol", {
        value: function(nullSymbol) {
          this._nullSymbol = nullSymbol;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "numberStyle", {
        value: function() {
          return this._numberStyle;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setNumberStyle", {
        value: function(numberStyle) {
          this._numberStyle = numberStyle;
          switch (this._numberStyle) {
            case $$number_formatter$$NONE:
              this._styleDefaults = $$number_formatter$$StyleDefaults.NONE;
              break;
            case $$number_formatter$$PERCENT:
              this._styleDefaults = $$number_formatter$$StyleDefaults.PERCENT;
              break;
            case $$number_formatter$$CURRENCY:
              this._styleDefaults = $$number_formatter$$StyleDefaults.CURRENCY;
              break;
            default:
              this._styleDefaults = null;
          }
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "percentSymbol", {
        value: function() {
          return this._get('percentSymbol');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setPercentSymbol", {
        value: function(percentSymbol) {
          this._percentSymbol = percentSymbol;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "positiveInfinitySymbol", {
        value: function() {
          return this._get('positiveInfinitySymbol');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setPositiveInfinitySymbol", {
        value: function(positiveInfinitySymbol) {
          this._positiveInfinitySymbol = positiveInfinitySymbol;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "positivePrefix", {
        value: function() {
          return this._get('positivePrefix');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setPositivePrefix", {
        value: function(prefix) {
          this._positivePrefix = prefix;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "positiveSuffix", {
        value: function() {
          return this._get('positiveSuffix');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setPositiveSuffix", {
        value: function(prefix) {
          this._positiveSuffix = prefix;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "roundingMode", {
        value: function() {
          return this._get('roundingMode');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setRoundingMode", {
        value: function(roundingMode) {
          this._roundingMode = roundingMode;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "usesGroupingSeparator", {
        value: function() {
          return this._get('usesGroupingSeparator');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setUsesGroupingSeparator", {
        value: function(usesGroupingSeparator) {
          this._usesGroupingSeparator = usesGroupingSeparator;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "zeroSymbol", {
        value: function() {
          return this._get('zeroSymbol');
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "setZeroSymbol", {
        value: function(zeroSymbol) {
          this._zeroSymbol = zeroSymbol;
          return this;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "_get", {
        value: function(attr) {
          var value = this['_' + attr];
          if (value !== null && value !== undefined) {
            return value;
          }
          var styleDefaults = this._styleDefaults;
          var localeDefaults = this._localeDefaults();
          var regionDefaults = this._regionDefaults();
          value = $$number_formatter$$get(styleDefaults, attr, this, localeDefaults);
          if (value !== null && value !== undefined) {
            return value;
          }
          value = $$number_formatter$$get(localeDefaults, attr, this, styleDefaults);
          if (value !== null && value !== undefined) {
            return value;
          }
          value = $$number_formatter$$get(regionDefaults, attr, this, styleDefaults);
          if (value !== null && value !== undefined) {
            return value;
          }
          value = $$number_formatter$$get(this._currencyDefaults(), attr, this, localeDefaults);
          if (value !== null && value !== undefined) {
            return value;
          }
          return null;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "format", {
        value: function(number) {
          if (number === '') {
            return '';
          }

          var zeroSymbol = this.zeroSymbol();
          if (zeroSymbol !== undefined && zeroSymbol !== null && number === 0) {
            return zeroSymbol;
          }

          var nullSymbol = this.nullSymbol();
          if (nullSymbol !== undefined && nullSymbol !== null && number === null) {
            return nullSymbol;
          }

          var notANumberSymbol = this.notANumberSymbol();
          if (notANumberSymbol !== undefined && notANumberSymbol !== null && isNaN(number)) {
            return notANumberSymbol;
          }

          var positiveInfinitySymbol = this.positiveInfinitySymbol();
          if (positiveInfinitySymbol !== undefined && positiveInfinitySymbol !== null && number === Infinity) {
            return positiveInfinitySymbol;
          }

          var negativeInfinitySymbol = this.negativeInfinitySymbol();
          if (negativeInfinitySymbol !== undefined && negativeInfinitySymbol !== null && number === -Infinity) {
            return negativeInfinitySymbol;
          }

          var negative = number < 0;

          var parts = (''+Math.abs(number)).split('.');
          var integerPart = parts[0];
          var fractionPart = parts[1] || '';

          var exponent = this.exponent();
          if (exponent !== undefined && exponent !== null) {
            var shifted = stround$$shiftParts([negative, integerPart, fractionPart], exponent);
            negative = shifted[0];
            integerPart = shifted[1];
            fractionPart = shifted[2];
            while (integerPart[0] === '0') {
              integerPart = integerPart.slice(1);
            }
          }

          // round fraction part to the maximum length
          var maximumFractionDigits = this.maximumFractionDigits();
          if (fractionPart.length > maximumFractionDigits) {
            var unrounded = "" + integerPart + "." + fractionPart + "";
            var rounded = this._round(negative ? "-" + unrounded + "" : unrounded);
            if (rounded[0] === '-') {
              rounded = rounded.slice(1);
            }
            parts = rounded.split('.');
            integerPart = parts[0];
            fractionPart = parts[1] || '';
          }

          // right-pad fraction zeros up to the minimum length
          var minimumFractionDigits = this.minimumFractionDigits();
          while (fractionPart.length < minimumFractionDigits) {
            fractionPart += '0';
          }

          // left-pad integer zeros up to the minimum length
          var minimumIntegerDigits = this.minimumIntegerDigits();
          while (integerPart.length < minimumIntegerDigits) {
            integerPart = '0' + integerPart;
          }

          // eat any unneeded trailing zeros
          while (fractionPart.length > minimumFractionDigits && fractionPart.slice(-1) === '0') {
            fractionPart = fractionPart.slice(0, -1);
          }

          // left-truncate any integer digits over the maximum length
          var maximumIntegerDigits = this.maximumIntegerDigits();
          if (maximumIntegerDigits !== undefined && maximumIntegerDigits !== null && integerPart.length > maximumIntegerDigits) {
            integerPart = integerPart.slice(-maximumIntegerDigits);
          }

          // add the decimal separator
          if (fractionPart.length > 0 || this.alwaysShowsDecimalSeparator()) {
            fractionPart = this.decimalSeparator() + fractionPart;
          }

          if (this.usesGroupingSeparator()) {
            var integerPartWithGroupingSeparators = '';
            var copiedCharacterCount = 0;

            for (var i = integerPart.length - 1; i >= 0; i--) {
              if (copiedCharacterCount > 0 && copiedCharacterCount % this.groupingSize() === 0) {
                integerPartWithGroupingSeparators = this.groupingSeparator() + integerPartWithGroupingSeparators;
              }
              integerPartWithGroupingSeparators = integerPart[i] + integerPartWithGroupingSeparators;
              copiedCharacterCount++;
            }
            integerPart = integerPartWithGroupingSeparators;
          }

          var result = integerPart + fractionPart;

          // surround with the appropriate prefix and suffix
          if (negative) {
            result = this.negativePrefix() + result + this.negativeSuffix();
          } else {
            result = this.positivePrefix() + result + this.positiveSuffix();
          }
          return result;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "_round", {
        value: function(number) {
          return stround$$round(number, this.maximumFractionDigits(), this.roundingMode());
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "parse", {
        value: function(string, error) {
          var result;
          var positivePrefix = this.positivePrefix();
          var negativePrefix = this.negativePrefix();
          var positiveSuffix = this.positiveSuffix();
          var negativeSuffix = this.negativeSuffix();

          if (this.isLenient()) {
            string = string.replace(/\s/g, '');
            positivePrefix = $$utils$$trim(positivePrefix);
            negativePrefix = $$utils$$trim(negativePrefix);
            positiveSuffix = $$utils$$trim(positiveSuffix);
            negativeSuffix = $$utils$$trim(negativeSuffix);
          }

          var zeroSymbol;
          var nullSymbol;
          var notANumberSymbol;
          var positiveInfinitySymbol;
          var negativeInfinitySymbol;
          var innerString;

          if ((zeroSymbol = this.zeroSymbol()) !== undefined && zeroSymbol !== null && string === zeroSymbol) {
            result = 0;
          } else if ((nullSymbol = this.nullSymbol()) !== undefined && nullSymbol !== null && string === nullSymbol) {
            result = null;
          } else if ((notANumberSymbol = this.notANumberSymbol()) !== undefined && notANumberSymbol !== null && string === notANumberSymbol) {
            result = NaN;
          } else if ((positiveInfinitySymbol = this.positiveInfinitySymbol()) !== undefined && positiveInfinitySymbol !== null && string === positiveInfinitySymbol) {
            result = Infinity;
          } else if ((negativeInfinitySymbol = this.negativeInfinitySymbol()) !== undefined && negativeInfinitySymbol !== null && string === negativeInfinitySymbol) {
            result = -Infinity;
          } else {
            var hasNegativePrefix = $$utils$$startsWith(negativePrefix, string);
            var hasNegativeSuffix = $$utils$$endsWith(negativeSuffix, string);
            if (hasNegativePrefix && (this.isLenient() || hasNegativeSuffix)) {
              innerString = string.slice(negativePrefix.length);
              if (hasNegativeSuffix) {
                innerString = innerString.slice(0, innerString.length - negativeSuffix.length);
              }
              result = this._parseAbsoluteValue(innerString, error);
              if (result !== undefined && result !== null) {
                result *= -1;
              }
            } else {
              var hasPositivePrefix = $$utils$$startsWith(positivePrefix, string);
              var hasPositiveSuffix = $$utils$$endsWith(positiveSuffix, string);
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
                if (typeof error === 'function') {
                  error('number-formatter.invalid-format');
                }
                return null;
              }
            }
          }

          if (result !== undefined && result !== null) {
            var minimum = this.minimum();
            if (minimum !== undefined && minimum !== null && result < minimum) {
              if (typeof error === 'function') {
                error('number-formatter.out-of-bounds.below-minimum');
              }
              return null;
            }

            var maximum = this.maximum();
            if (maximum !== undefined && maximum !== null && result > maximum) {
              if (typeof error === 'function') {
                error('number-formatter.out-of-bounds.above-maximum');
              }
              return null;
            }
          }

          return result;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "_parseAbsoluteValue", {
        value: function(string, error) {
          var number;
          if (string.length === 0) {
            if (typeof error === 'function') {
              error('number-formatter.invalid-format');
            }
            return null;
          }

          var parts = string.split(this.decimalSeparator());
          if (parts.length > 2) {
            if (typeof error === 'function') {
              error('number-formatter.invalid-format');
            }
            return null;
          }

          var integerPart = parts[0];
          var fractionPart = parts[1] || '';

          if (this.usesGroupingSeparator()) {
            var groupingSize = this.groupingSize();
            var groupParts = integerPart.split(this.groupingSeparator());

            if (!this.isLenient()) {
              if (groupParts.length > 1) {
                // disallow 1000,000
                if (groupParts[0].length > groupingSize) {
                  if (typeof error === 'function') {
                    error('number-formatter.invalid-format.grouping-size');
                  }
                  return null;
                }

                // disallow 1,00
                var groupPartsTail = groupParts.slice(1);
                for (var i = 0, l = groupPartsTail.length; i < l; i++) {
                  if (groupPartsTail[i].length !== groupingSize) {
                    if (typeof error === 'function') {
                      error('number-formatter.invalid-format.grouping-size');
                    }
                    return null;
                  }
                }
              }
            }

            // remove grouping separators
            integerPart = groupParts.join('');
          }

          if (!$$utils$$isDigits(integerPart) || !$$utils$$isDigits(fractionPart)) {
            if (typeof error === 'function') {
              error('number-formatter.invalid-format');
            }
            return null;
          }

          var exponent = this.exponent();
          if (exponent !== undefined && exponent !== null) {
            var shifted = stround$$shiftParts([false, integerPart, fractionPart], -exponent);
            integerPart = shifted[1];
            fractionPart = shifted[2];
          }

          number = Number(integerPart) + Number('.' + (fractionPart || '0'));

          if (!this.allowsFloats() && number !== ~~number) {
            if (typeof error === 'function') {
              error('number-formatter.floats-not-allowed');
            }
            return null;
          }

          return number;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "_currencyDefaults", {
        value: function() {
          var result = {};

          $$utils$$forEach($$number_formatter$$CurrencyDefaults['default'], function(value, key) {
            result[key] = value;
          });

          $$utils$$forEach($$number_formatter$$CurrencyDefaults[this.currencyCode()], function(value, key) {
            result[key] = value;
          });

          return result;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "_regionDefaults", {
        value: function() {
          var result = {};

          $$utils$$forEach($$number_formatter$$RegionDefaults.default, function(value, key) {
            result[key] = value;
          });

          $$utils$$forEach($$number_formatter$$RegionDefaults[this.countryCode()], function(value, key) {
            result[key] = value;
          });

          return result;
        },

        enumerable: false,
        writable: true
      });

      $$number_formatter$$$__Object$defineProperty(NumberFormatter.prototype, "_localeDefaults", {
        value: function() {
          var locale      = this.locale();
          var countryCode = this.countryCode();
          var lang = $$number_formatter$$splitLocaleComponents(locale).lang;
          var result = {};

          var defaultFallbacks = [
            $$number_formatter$$RegionDefaults.default,
            $$number_formatter$$LocaleDefaults.default,
            $$number_formatter$$RegionDefaults[countryCode],  // CA
            $$number_formatter$$LocaleDefaults[lang],         // fr
            $$number_formatter$$LocaleDefaults[locale]        // fr-CA
          ];

          $$utils$$forEach(defaultFallbacks, function(defaults) {
            $$utils$$forEach(defaults, function(value, key) {
              result[key] = value;
            });
          });

          return result;
        },

        enumerable: false,
        writable: true
      });

      return NumberFormatter;
    }($$formatter$$default);

    /**
     * Defaults
     */

    $$number_formatter$$NumberFormatter.prototype._allowsFloats = null;

    $$number_formatter$$NumberFormatter.prototype._alwaysShowsDecimalSeparator = null;
    $$number_formatter$$NumberFormatter.prototype._countryCode = null;
    $$number_formatter$$NumberFormatter.prototype._currencyCode = null;
    $$number_formatter$$NumberFormatter.prototype._exponent = null;
    $$number_formatter$$NumberFormatter.prototype._groupingSeparator = null;
    $$number_formatter$$NumberFormatter.prototype._groupingSize = null;
    $$number_formatter$$NumberFormatter.prototype._lenient = false;
    $$number_formatter$$NumberFormatter.prototype._locale = null;
    $$number_formatter$$NumberFormatter.prototype._internationalCurrencySymbol = null;
    $$number_formatter$$NumberFormatter.prototype._maximumFractionDigits = null;
    $$number_formatter$$NumberFormatter.prototype._minimumFractionDigits = null;
    $$number_formatter$$NumberFormatter.prototype._maximumIntegerDigits = null;
    $$number_formatter$$NumberFormatter.prototype._minimumIntegerDigits = null;
    $$number_formatter$$NumberFormatter.prototype._maximum = null;
    $$number_formatter$$NumberFormatter.prototype._minimum = null;
    $$number_formatter$$NumberFormatter.prototype._notANumberSymbol = null;
    $$number_formatter$$NumberFormatter.prototype._nullSymbol = null;
    $$number_formatter$$NumberFormatter.prototype._numberStyle = null;
    $$number_formatter$$NumberFormatter.prototype._roundingMode = null;
    $$number_formatter$$NumberFormatter.prototype._usesGroupingSeparator = null;
    $$number_formatter$$NumberFormatter.prototype._zeroSymbol = null;

    /**
     * Aliases
     */

    $$number_formatter$$NumberFormatter.prototype.stringFromNumber = $$number_formatter$$NumberFormatter.prototype.format;

    $$number_formatter$$NumberFormatter.prototype.numberFromString = $$number_formatter$$NumberFormatter.prototype.parse;
    $$number_formatter$$NumberFormatter.prototype.minusSign = $$number_formatter$$NumberFormatter.prototype.negativePrefix;
    $$number_formatter$$NumberFormatter.prototype.setMinusSign = $$number_formatter$$NumberFormatter.prototype.setNegativePrefix;
    $$number_formatter$$NumberFormatter.prototype.plusSign = $$number_formatter$$NumberFormatter.prototype.positivePrefix;
    $$number_formatter$$NumberFormatter.prototype.setPlusSign = $$number_formatter$$NumberFormatter.prototype.setPositivePrefix;
    $$number_formatter$$NumberFormatter.Rounding = stround$$modes;

    $$number_formatter$$NumberFormatter.Style = {
      NONE: $$number_formatter$$NONE,
      CURRENCY: $$number_formatter$$CURRENCY,
      PERCENT: $$number_formatter$$PERCENT
    };

    var $$number_formatter$$StyleDefaults = {
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
          return $$number_formatter$$get(locale, 'positiveCurrencyPrefix', formatter, this);
        },
        positiveSuffix: function(formatter, locale) {
          return $$number_formatter$$get(locale, 'positiveCurrencySuffix', formatter, this);
        },
        negativePrefix: function(formatter, locale) {
          return $$number_formatter$$get(locale, 'negativeCurrencyPrefix', formatter, this);
        },
        negativeSuffix: function(formatter, locale) {
          return $$number_formatter$$get(locale, 'negativeCurrencySuffix', formatter, this);
        }
      }
    };

    var $$number_formatter$$LocaleDefaults = {
      'default': {
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
        roundingMode: $$number_formatter$$NumberFormatter.Rounding.HALF_EVEN,
        positiveCurrencyPrefix: function(formatter) {
          return formatter.currencySymbol();
        },
        positiveCurrencySuffix: '',
        negativeCurrencyPrefix: function(formatter) {
          return '(' + formatter.currencySymbol();
        },
        negativeCurrencySuffix: function() {
          return ')';
        }
      },
      fr: {
        decimalSeparator: ',',
        groupingSeparator: ' ',
        percentSymbol: ' %',
        positiveCurrencyPrefix: '',
        positiveCurrencySuffix: function(formatter) {
          return ' ' + formatter.currencySymbol();
        },
        negativeCurrencyPrefix: function() {
          return '(';
        },
        negativeCurrencySuffix: function(formatter) {
          return ' ' + formatter.currencySymbol() + ')';
        }
      },
      ja: {
        negativeCurrencyPrefix: function(formatter) {
          return '-' + formatter.currencySymbol();
        },
        negativeCurrencySuffix: ''
      },
      'en-GB': {
        negativeCurrencyPrefix: function(formatter) {
          return '-' + formatter.currencySymbol();
        },
        negativeCurrencySuffix: ''
      }
    };

    var $$number_formatter$$RegionDefaults = {
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

    var $$number_formatter$$CurrencyDefaults = {
      'default': {
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

    var $$number_formatter$$default = $$number_formatter$$NumberFormatter;
    var $$phone_formatter$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$phone_formatter$$$__Object$defineProperty = Object.defineProperty;
    var $$phone_formatter$$$__Object$create = Object.create;

    // (415) 555-1212
    var $$phone_formatter$$NANP_PHONE_DELIMITERS = {
      0: '(',
      4: ')',
      5: ' ',
      9: '-'
    };

    // 1 (415) 555-1212
    var $$phone_formatter$$NANP_PHONE_DELIMITERS_WITH_1 = {
      1:  ' ',
      2:  '(',
      6:  ')',
      7:  ' ',
      11: '-'
    };

    // +1 (415) 555-1212
    var $$phone_formatter$$NANP_PHONE_DELIMITERS_WITH_PLUS = {
      2:  ' ',
      3:  '(',
      7:  ')',
      8:  ' ',
      12: '-'
    };

    // This should match any characters in the maps above.
    var $$phone_formatter$$DELIMITER_PATTERN = /[-\(\) ]/g;

    var $$phone_formatter$$PhoneFormatter = function($__super) {
      function PhoneFormatter() {
        var args = [].slice.call(arguments, 0);

        if (args.length !== 0) {
          throw new Error('were you trying to set a delimiter ('+args[0]+')?');
        }
      }

      PhoneFormatter.__proto__ = ($__super !== null ? $__super : Function.prototype);
      PhoneFormatter.prototype = $$phone_formatter$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "constructor", {
        value: PhoneFormatter
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "isDelimiter", {
        value: function(chr) {
          var map = this.delimiterMap;
          for (var index in map) {
            if (map.hasOwnProperty(index)) {
              if (map[index] === chr) {
                return true;
              }
            }
          }
          return false;
        },

        enumerable: false,
        writable: true
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "delimiterAt", {
        value: function(index) {
          return this.delimiterMap[index];
        },

        enumerable: false,
        writable: true
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "hasDelimiterAtIndex", {
        value: function(index) {
          var delimiter = this.delimiterAt(index);
          return delimiter !== undefined && delimiter !== null;
        },

        enumerable: false,
        writable: true
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "parse", {
        value: function(text, error) {
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
          return $$phone_formatter$$$__Object$getPrototypeOf(PhoneFormatter.prototype).parse.call(this, text, error);
        },

        enumerable: false,
        writable: true
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "format", {
        value: function(value) {
          this.guessFormatFromText(value);
          return $$phone_formatter$$$__Object$getPrototypeOf(PhoneFormatter.prototype).format.call(this, this.removeDelimiterMapChars(value));
        },

        enumerable: false,
        writable: true
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "isChangeValid", {
        value: function(change, error) {
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

            return $$phone_formatter$$$__Object$getPrototypeOf(PhoneFormatter.prototype).isChangeValid.call(this, change, error);
          }

          if (/^\d*$/.test(change.inserted.text) || change.proposed.text.indexOf('+') === 0) {
            return $$phone_formatter$$$__Object$getPrototypeOf(PhoneFormatter.prototype).isChangeValid.call(this, change, error);
          } else {
            return false;
          }
        },

        enumerable: false,
        writable: true
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "guessFormatFromText", {
        value: function(text) {
          if (text && text[0] === '+') {
            this.delimiterMap = $$phone_formatter$$NANP_PHONE_DELIMITERS_WITH_PLUS;
            this.maximumLength = 1 + 1 + 10 + 5;
          } else if (text && text[0] === '1') {
            this.delimiterMap = $$phone_formatter$$NANP_PHONE_DELIMITERS_WITH_1;
            this.maximumLength = 1 + 10 + 5;
          } else {
            this.delimiterMap = $$phone_formatter$$NANP_PHONE_DELIMITERS;
            this.maximumLength = 10 + 4;
          }
        },

        enumerable: false,
        writable: true
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "digitsWithoutCountryCode", {
        value: function(text) {
          var digits = (text || '').replace(/[^\d]/g, '');
          var extraDigits = digits.length - 10;
          if (extraDigits > 0) {
            digits = digits.substr(extraDigits);
          }
          return digits;
        },

        enumerable: false,
        writable: true
      });

      $$phone_formatter$$$__Object$defineProperty(PhoneFormatter.prototype, "removeDelimiterMapChars", {
        value: function(text) {
          return (text || '').replace($$phone_formatter$$DELIMITER_PATTERN, '');
        },

        enumerable: false,
        writable: true
      });

      return PhoneFormatter;
    }($$delimited_text_formatter$$default);

    var $$phone_formatter$$default = $$phone_formatter$$PhoneFormatter;
    var $$social_security_number_formatter$$$__Object$getPrototypeOf = Object.getPrototypeOf;
    var $$social_security_number_formatter$$$__Object$defineProperty = Object.defineProperty;
    var $$social_security_number_formatter$$$__Object$create = Object.create;
    var $$social_security_number_formatter$$DIGITS_PATTERN = /^\d*$/;

    var $$social_security_number_formatter$$SocialSecurityNumberFormatter = function($__super) {
      function SocialSecurityNumberFormatter() {
        $$social_security_number_formatter$$$__Object$getPrototypeOf(SocialSecurityNumberFormatter.prototype).constructor.call(this, '-');
        this.maximumLength = 9 + 2;
      }

      SocialSecurityNumberFormatter.__proto__ = ($__super !== null ? $__super : Function.prototype);
      SocialSecurityNumberFormatter.prototype = $$social_security_number_formatter$$$__Object$create(($__super !== null ? $__super.prototype : null));

      $$social_security_number_formatter$$$__Object$defineProperty(SocialSecurityNumberFormatter.prototype, "constructor", {
        value: SocialSecurityNumberFormatter
      });

      $$social_security_number_formatter$$$__Object$defineProperty(SocialSecurityNumberFormatter.prototype, "hasDelimiterAtIndex", {
        value: function(index) {
          return index === 3 || index === 6;
        },

        enumerable: false,
        writable: true
      });

      $$social_security_number_formatter$$$__Object$defineProperty(SocialSecurityNumberFormatter.prototype, "isChangeValid", {
        value: function(change) {
          if ($$social_security_number_formatter$$DIGITS_PATTERN.test(change.inserted.text)) {
            return $$social_security_number_formatter$$$__Object$getPrototypeOf(SocialSecurityNumberFormatter.prototype).isChangeValid.call(this, change);
          } else {
            return false;
          }
        },

        enumerable: false,
        writable: true
      });

      return SocialSecurityNumberFormatter;
    }($$delimited_text_formatter$$default);

    var $$social_security_number_formatter$$default = $$social_security_number_formatter$$SocialSecurityNumberFormatter;

    var index$$FieldKit = {
      AdaptiveCardFormatter: $$adaptive_card_formatter$$default,
      AmexCardFormatter: $$amex_card_formatter$$default,
      CardTextField: $$card_text_field$$default,
      CardUtils: {
        AMEX: $$card_utils$$AMEX,
        DISCOVER: $$card_utils$$DISCOVER,
        VISA: $$card_utils$$VISA,
        MASTERCARD: $$card_utils$$MASTERCARD,
        determineCardType: $$card_utils$$determineCardType,
        luhnCheck: $$card_utils$$luhnCheck,
        validCardLength: $$card_utils$$validCardLength
      },
      DefaultCardFormatter: $$default_card_formatter$$default,
      DelimitedTextFormatter: $$delimited_text_formatter$$default,
      ExpiryDateField: $$expiry_date_field$$default,
      ExpiryDateFormatter: $$expiry_date_formatter$$default,
      Formatter: $$formatter$$default,
      NumberFormatter: $$number_formatter$$default,
      PhoneFormatter: $$phone_formatter$$default,
      SocialSecurityNumberFormatter: $$social_security_number_formatter$$default,
      TextField: $$text_field$$default,
      UndoManager: $$undo_manager$$default
    };

    if (typeof define === 'function' && define.amd) {
      define(function() { return index$$FieldKit; });
    } else if (typeof module !== 'undefined' && module.exports) {
      module.exports = index$$FieldKit;
    } else if (typeof window !== 'undefined') {
      window.FieldKit = index$$FieldKit;
    } else {
      this.FieldKit = index$$FieldKit;
    }
}).call(this);