(function() {
    "use strict";
    var $$formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /*! jshint esnext:true, undef:true, unused:true */

    /**
     * Base class providing basic formatting, parsing, and change validation to be
     * customized in subclasses.
     */

    var $$formatter$$Formatter = (function () {
      function Formatter() {
        $$formatter$$_classCallCheck(this, Formatter);
      }

      $$formatter$$_createClass(Formatter, {
        format: {
          /**
           * @param {string} text
           * @returns {string}
           */

          value: function format(text) {
            if (text === undefined || text === null) {
              text = "";
            }
            if (this.maximumLength !== undefined && this.maximumLength !== null) {
              text = text.substring(0, this.maximumLength);
            }
            return text;
          }
        },
        parse: {

          /**
           * @param {string} text
           * @returns {string}
           */

          value: function parse(text) {
            if (text === undefined || text === null) {
              text = "";
            }
            if (this.maximumLength !== undefined && this.maximumLength !== null) {
              text = text.substring(0, this.maximumLength);
            }
            return text;
          }
        },
        isChangeValid: {

          /**
           * Determines whether the given change should be allowed and, if so, whether
           * it should be altered.
           *
           * @param {TextFieldStateChange} change
           * @returns {boolean}
           */

          value: function isChangeValid(change) {
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
          }
        }
      });

      return Formatter;
    })();

    var $$formatter$$default = $$formatter$$Formatter;
    var $$delimited_text_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$delimited_text_formatter$$_get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var $$delimited_text_formatter$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$delimited_text_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * A generic delimited formatter.
     *
     * @extends Formatter
     */

    var $$delimited_text_formatter$$DelimitedTextFormatter = (function (_Formatter) {
      /**
       * @param {string=} delimiter
       * @param {boolean=} isLazy
       * @throws {Error} delimiter must have just one character
       */

      function DelimitedTextFormatter() {
        var delimiter = arguments[0] === undefined ? this.delimiter : arguments[0];
        var isLazy = arguments[1] === undefined ? false : arguments[1];

        $$delimited_text_formatter$$_classCallCheck(this, DelimitedTextFormatter);

        if (delimiter === null || delimiter === undefined || delimiter.length !== 1) {
          throw new Error("delimiter must have just one character");
        }
        this.delimiter = delimiter;

        // If the formatter is lazy, delimiter will not be added until input has gone
        // past the delimiter index. Useful for 'optional' extension, like zip codes.
        // 94103  ->  type '1'  ->  94103-1
        this.isLazy = isLazy;
      }

      $$delimited_text_formatter$$_inherits(DelimitedTextFormatter, _Formatter);

      $$delimited_text_formatter$$_createClass(DelimitedTextFormatter, {
        delimiterAt: {

          /**
           * Determines the delimiter character at the given index.
           *
           * @param {number} index
           * @returns {?string}
           */

          value: function delimiterAt(index) {
            if (!this.hasDelimiterAtIndex(index)) {
              return null;
            }
            return this.delimiter;
          }
        },
        isDelimiter: {

          /**
           * Determines whether the given character is a delimiter.
           *
           * @param {string} chr
           * @returns {boolean}
           */

          value: function isDelimiter(chr) {
            return chr === this.delimiter;
          }
        },
        format: {

          /**
           * Formats the given value by adding delimiters where needed.
           *
           * @param {?string} value
           * @returns {string}
           */

          value: function format(value) {
            return this._textFromValue(value);
          }
        },
        _textFromValue: {

          /**
           * Formats the given value by adding delimiters where needed.
           *
           * @param {?string} value
           * @returns {string}
           * @private
           */

          value: function _textFromValue(value) {
            if (!value) {
              return "";
            }

            var result = "";
            var delimiter;
            var maximumLength = this.maximumLength;

            for (var i = 0, l = value.length; i < l; i++) {
              while (delimiter = this.delimiterAt(result.length)) {
                result += delimiter;
              }
              result += value[i];
              if (!this.isLazy) {
                while (delimiter = this.delimiterAt(result.length)) {
                  result += delimiter;
                }
              }
            }

            if (maximumLength !== undefined && maximumLength !== null) {
              return result.slice(0, maximumLength);
            } else {
              return result;
            }
          }
        },
        parse: {

          /**
           * Parses the given text by removing delimiters.
           *
           * @param {?string} text
           * @returns {string}
           */

          value: function parse(text) {
            return this._valueFromText(text);
          }
        },
        _valueFromText: {

          /**
           * Parses the given text by removing delimiters.
           *
           * @param {?string} text
           * @returns {string}
           * @private
           */

          value: function _valueFromText(text) {
            if (!text) {
              return "";
            }
            var result = "";
            for (var i = 0, l = text.length; i < l; i++) {
              if (!this.isDelimiter(text[i])) {
                result += text[i];
              }
            }
            return result;
          }
        },
        isChangeValid: {

          /**
           * Determines whether the given change should be allowed and, if so, whether
           * it should be altered.
           *
           * @param {TextFieldStateChange} change
           * @param {function(string)} error
           * @returns {boolean}
           */

          value: function isChangeValid(change, error) {
            if (!$$delimited_text_formatter$$_get(Object.getPrototypeOf(DelimitedTextFormatter.prototype), "isChangeValid", this).call(this, change, error)) {
              return false;
            }

            var newText = change.proposed.text;
            var range = change.proposed.selectedRange;
            var hasSelection = range.length !== 0;

            var startMovedLeft = range.start < change.current.selectedRange.start;
            var startMovedRight = range.start > change.current.selectedRange.start;
            var endMovedLeft = range.start + range.length < change.current.selectedRange.start + change.current.selectedRange.length;
            var endMovedRight = range.start + range.length > change.current.selectedRange.start + change.current.selectedRange.length;

            var startMovedOverADelimiter = startMovedLeft && this.hasDelimiterAtIndex(range.start) || startMovedRight && this.hasDelimiterAtIndex(range.start - 1);
            var endMovedOverADelimiter = endMovedLeft && this.hasDelimiterAtIndex(range.start + range.length) || endMovedRight && this.hasDelimiterAtIndex(range.start + range.length - 1);

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
              // move right over any delimiters found on the way, including any leading delimiters
              for (var i = change.current.selectedRange.start; i < range.start + range.length; i++) {
                if (this.delimiterAt(i)) {
                  range.start++;
                  if (range.length > 0) {
                    range.length--;
                  }
                }
              }

              while (this.delimiterAt(range.start)) {
                range.start++;
                range.length--;
              }
            }

            if (hasSelection) {
              // Otherwise, the logic for the range start takes care of everything.
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

            var value = this._valueFromText(newText, function () {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              result = false;
              error.apply(undefined, args);
            });

            if (result) {
              change.proposed.text = this._textFromValue(value);
            }

            return result;
          }
        }
      });

      return DelimitedTextFormatter;
    })($$formatter$$default);

    var $$delimited_text_formatter$$default = $$delimited_text_formatter$$DelimitedTextFormatter;
    /*! jshint esnext:true, undef:true, unused:true */

    /**
     * @TODO Make this an enum
     */
    var $$card_utils$$AMEX = "amex";
    var $$card_utils$$DISCOVER = "discover";
    var $$card_utils$$JCB = "jcb";
    var $$card_utils$$MASTERCARD = "mastercard";
    var $$card_utils$$VISA = "visa";

    function $$card_utils$$determineCardType(pan) {
      if (pan === null || pan === undefined) {
        return null;
      }

      pan = pan.toString();
      var firsttwo = parseInt(pan.slice(0, 2), 10);
      var iin = parseInt(pan.slice(0, 6), 10);
      var halfiin = parseInt(pan.slice(0, 3), 10);

      if (pan[0] === "4") {
        return $$card_utils$$VISA;
      } else if (pan.slice(0, 4) === "6011" || firsttwo === 65 || halfiin >= 664 && halfiin <= 649 || iin >= 622126 && iin <= 622925) {
        return $$card_utils$$DISCOVER;
      } else if (pan.slice(0, 4) === "2131" || pan.slice(0, 4) === "1800" || firsttwo === 35) {
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
        sum += (flip = !flip) ? Math.floor(digit * 2 / 10) + Math.floor(digit * 2 % 10) : digit;
      }

      return sum % 10 === 0;
    }

    function $$card_utils$$validCardLength(pan) {
      switch ($$card_utils$$determineCardType(pan)) {
        case $$card_utils$$VISA:
          return pan.length === 13 || pan.length === 16;
        case $$card_utils$$DISCOVER:case $$card_utils$$MASTERCARD:
          return pan.length === 16;
        case $$card_utils$$JCB:
          return pan.length === 15 || pan.length === 16;
        case $$card_utils$$AMEX:
          return pan.length === 15;
        default:
          return false;
      }
    }var $$default_card_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$default_card_formatter$$_get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var $$default_card_formatter$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$default_card_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * A generic credit card formatter.
     *
     * @extends DelimitedTextFormatter
     */

    var $$default_card_formatter$$DefaultCardFormatter = (function (_DelimitedTextFormatter) {
      function DefaultCardFormatter() {
        $$default_card_formatter$$_classCallCheck(this, DefaultCardFormatter);

        $$default_card_formatter$$_get(Object.getPrototypeOf(DefaultCardFormatter.prototype), "constructor", this).call(this, " ");
      }

      $$default_card_formatter$$_inherits(DefaultCardFormatter, _DelimitedTextFormatter);

      $$default_card_formatter$$_createClass(DefaultCardFormatter, {
        hasDelimiterAtIndex: {

          /**
           * @param {number} index
           * @returns {boolean}
           */

          value: function hasDelimiterAtIndex(index) {
            return index === 4 || index === 9 || index === 14;
          }
        },
        parse: {

          /**
           * Will call parse on the formatter.
           *
           * @param {string} text
           * @param {function(string)} error
           * @returns {string} returns value with delimiters removed
           */

          value: function parse(text, error) {
            var value = this._valueFromText(text);
            if (typeof error === "function") {
              if (!$$card_utils$$validCardLength(value)) {
                error("card-formatter.number-too-short");
              }
              if (!$$card_utils$$luhnCheck(value)) {
                error("card-formatter.invalid-number");
              }
            }
            return $$default_card_formatter$$_get(Object.getPrototypeOf(DefaultCardFormatter.prototype), "parse", this).call(this, text, error);
          }
        },
        _valueFromText: {

          /**
           * Parses the given text by removing delimiters.
           *
           * @param {?string} text
           * @returns {string}
           * @private
           */

          value: function _valueFromText(text) {
            return $$default_card_formatter$$_get(Object.getPrototypeOf(DefaultCardFormatter.prototype), "_valueFromText", this).call(this, (text || "").replace(/[^\d]/g, ""));
          }
        },
        maximumLength: {

          /**
           * Gets the maximum length of a formatted default card number.
           *
           * @returns {number}
           */

          get: function () {
            return 16 + 3;
          }
        }
      });

      return DefaultCardFormatter;
    })($$delimited_text_formatter$$default);

    var $$default_card_formatter$$default = $$default_card_formatter$$DefaultCardFormatter;
    var $$amex_card_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$amex_card_formatter$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$amex_card_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * Amex credit card formatter.
     *
     * @extends DefaultCardFormatter
     */

    var $$amex_card_formatter$$AmexCardFormatter = (function (_DefaultCardFormatter) {
      function AmexCardFormatter() {
        $$amex_card_formatter$$_classCallCheck(this, AmexCardFormatter);

        if (_DefaultCardFormatter != null) {
          _DefaultCardFormatter.apply(this, arguments);
        }
      }

      $$amex_card_formatter$$_inherits(AmexCardFormatter, _DefaultCardFormatter);

      $$amex_card_formatter$$_createClass(AmexCardFormatter, {
        hasDelimiterAtIndex: {
          /**
           * @override
           */

          value: function hasDelimiterAtIndex(index) {
            return index === 4 || index === 11;
          }
        },
        maximumLength: {

          /**
           * @override
           */

          get: function () {
            return 15 + 2;
          }
        }
      });

      return AmexCardFormatter;
    })($$default_card_formatter$$default);

    var $$amex_card_formatter$$default = $$amex_card_formatter$$AmexCardFormatter;
    var $$adaptive_card_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$adaptive_card_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * AdaptiveCardFormatter will decide if it needs to use
     * {@link AmexCardFormatter} or {@link DefaultCardFormatter}.
     */

    var $$adaptive_card_formatter$$AdaptiveCardFormatter = (function () {
      function AdaptiveCardFormatter() {
        $$adaptive_card_formatter$$_classCallCheck(this, AdaptiveCardFormatter);

        /** @private */
        this.amexCardFormatter = new $$amex_card_formatter$$default();
        /** @private */
        this.defaultCardFormatter = new $$default_card_formatter$$default();
        /** @private */
        this.formatter = this.defaultCardFormatter;
      }

      $$adaptive_card_formatter$$_createClass(AdaptiveCardFormatter, {
        format: {

          /**
           * Will pick the right formatter based on the `pan` and will return the
           * formatted string.
           *
           * @param {string} pan
           * @returns {string} formatted string
           */

          value: function format(pan) {
            return this._formatterForPan(pan).format(pan);
          }
        },
        parse: {

          /**
           * Will call parse on the formatter.
           *
           * @param {string} text
           * @param {function(string)} error
           * @returns {string} returns value with delimiters removed
           */

          value: function parse(text, error) {
            return this.formatter.parse(text, error);
          }
        },
        isChangeValid: {

          /**
           * Determines whether the given change should be allowed and, if so, whether
           * it should be altered.
           *
           * @param {TextFieldStateChange} change
           * @param {function(!string)} error
           * @returns {boolean}
           */

          value: function isChangeValid(change, error) {
            this.formatter = this._formatterForPan(change.proposed.text);
            return this.formatter.isChangeValid(change, error);
          }
        },
        _formatterForPan: {

          /**
           * Decides which formatter to use.
           *
           * @param {string} pan
           * @returns {Formatter}
           * @private
           */

          value: function _formatterForPan(pan) {
            if ($$card_utils$$determineCardType(pan.replace(/[^\d]+/g, "")) === $$card_utils$$AMEX) {
              return this.amexCardFormatter;
            } else {
              return this.defaultCardFormatter;
            }
          }
        }
      });

      return AdaptiveCardFormatter;
    })();

    var $$adaptive_card_formatter$$default = $$adaptive_card_formatter$$AdaptiveCardFormatter;
    var $$utils$$_toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

    /*! jshint esnext:true, undef:true, unused:true */

    /**
     * @const
     * @private
     */
    var $$utils$$DIGITS_PATTERN = /^\d*$/;

    /**
     * @const
     * @private
     */
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

    /**
     * @param {string} string
     * @returns {string}
     */
    var $$utils$$trim = typeof "".trim === "function" ? function (string) {
      return string.trim();
    } : function (string) {
      return string.replace($$utils$$SURROUNDING_SPACE_PATTERN, "");
    };

    function $$utils$$zpad(length, n) {
      var result = "" + n;
      while (result.length < length) {
        result = "0" + result;
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
      Function.prototype.bind = function (context) {
        for (var _len = arguments.length, prependedArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          prependedArgs[_key - 1] = arguments[_key];
        }

        var self = this;
        return function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return self.apply(context, prependedArgs.concat(args));
        };
      };
    }

    var $$utils$$hasOwnProp = Object.prototype.hasOwnProperty;
    function $$utils$$forEach(iterable, iterator) {
      if (iterable && typeof iterable.forEach === "function") {
        iterable.forEach(iterator);
      } else if (({}).toString.call(iterable) === "[object Array]") {
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

    var $$utils$$getOwnPropertyNames = (function () {
      var getOwnPropertyNames = Object.getOwnPropertyNames;

      try {
        Object.getOwnPropertyNames({}, "sq");
      } catch (e) {
        // IE 8
        getOwnPropertyNames = function (object) {
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
    var $$utils$$getPrototypeOf = Object.getPrototypeOf || function (object) {
      return object.__proto__;
    };
    function $$utils$$hasGetter(object, property) {
      // Skip if getOwnPropertyDescriptor throws (IE8)
      try {
        Object.getOwnPropertyDescriptor({}, "sq");
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
      if (object === null || object === undefined) {
        return [];
      }

      var result = $$utils$$getOwnPropertyNames(object);

      var prototype = object.constructor && object.constructor.prototype;
      while (prototype) {
        result.push.apply(result, $$utils$$_toConsumableArray($$utils$$getOwnPropertyNames(prototype)));
        prototype = $$utils$$getPrototypeOf(prototype);
      }

      return result;
    }var $$undo_manager$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$undo_manager$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * UndoManager is a general-purpose recorder of operations for undo and redo.
     *
     * Registering an undo action is done by specifying the changed object, along
     * with a method to invoke to revert its state and the arguments for that
     * method. When performing undo an UndoManager saves the operations reverted so
     * that you can redo the undos.
     */

    var $$undo_manager$$UndoManager = (function () {
      function UndoManager() {
        $$undo_manager$$_classCallCheck(this, UndoManager);

        /** @private */
        this._undos = [];
        /** @private */
        this._redos = [];
        /** @private */
        this._isUndoing = false;
        /** @private */
        this._isRedoing = false;
      }

      $$undo_manager$$_createClass(UndoManager, {
        canUndo: {

          /**
           * Determines whether there are any undo actions on the stack.
           *
           * @returns {boolean}
           */

          value: function canUndo() {
            return this._undos.length !== 0;
          }
        },
        canRedo: {

          /**
           * Determines whether there are any redo actions on the stack.
           *
           * @returns {boolean}
           */

          value: function canRedo() {
            return this._redos.length !== 0;
          }
        },
        isUndoing: {

          /**
           * Indicates whether or not this manager is currently processing an undo.
           *
           * @returns {boolean}
           */

          value: function isUndoing() {
            return this._isUndoing;
          }
        },
        isRedoing: {

          /**
           * Indicates whether or not this manager is currently processing a redo.
           *
           * @returns {boolean}
           */

          value: function isRedoing() {
            return this._isRedoing;
          }
        },
        registerUndo: {

          /**
           * Manually registers an simple undo action with the given args.
           *
           * If this undo manager is currently undoing then this will register a redo
           * action instead. If this undo manager is neither undoing or redoing then the
           * redo stack will be cleared.
           *
           * @param {Object} target call `selector` on this object
           * @param {string} selector the method name to call on `target`
           * @param {...Object} args arguments to pass when calling `selector` on `target`
           */

          value: function registerUndo(target, selector) {
            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
              args[_key - 2] = arguments[_key];
            }

            if (this._isUndoing) {
              this._appendRedo.apply(this, [target, selector].concat(args));
            } else {
              if (!this._isRedoing) {
                this._redos.length = 0;
              }
              this._appendUndo.apply(this, [target, selector].concat(args));
            }
          }
        },
        _appendUndo: {

          /**
           * Appends an undo action to the internal stack.
           *
           * @param {Object} target call `selector` on this object
           * @param {string} selector the method name to call on `target`
           * @param {...Object} args arguments to pass when calling `selector` on `target`
           * @private
           */

          value: function _appendUndo(target, selector) {
            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
              args[_key - 2] = arguments[_key];
            }

            this._undos.push({
              target: target,
              selector: selector,
              args: args
            });
          }
        },
        _appendRedo: {

          /**
           * Appends a redo action to the internal stack.
           *
           * @param {Object} target call `selector` on this object
           * @param {string} selector the method name to call on `target`
           * @param {...Object} args arguments to pass when calling `selector` on `target`
           * @private
           */

          value: function _appendRedo(target, selector) {
            for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
              args[_key - 2] = arguments[_key];
            }

            this._redos.push({
              target: target,
              selector: selector,
              args: args
            });
          }
        },
        undo: {

          /**
           * Performs the top-most undo action on the stack.
           *
           * @throws {Error} Raises an error if there are no available undo actions.
           */

          value: function undo() {
            if (!this.canUndo()) {
              throw new Error("there are no registered undos");
            }
            var data = this._undos.pop();
            var target = data.target;
            var selector = data.selector;
            var args = data.args;
            this._isUndoing = true;
            target[selector].apply(target, args);
            this._isUndoing = false;
          }
        },
        redo: {

          /**
           * Performs the top-most redo action on the stack.
           *
           * @throws {Error} Raises an error if there are no available redo actions.
           */

          value: function redo() {
            if (!this.canRedo()) {
              throw new Error("there are no registered redos");
            }
            var data = this._redos.pop();
            var target = data.target;
            var selector = data.selector;
            var args = data.args;
            this._isRedoing = true;
            target[selector].apply(target, args);
            this._isRedoing = false;
          }
        },
        proxyFor: {

          /**
           * Returns a proxy object based on target that will register undo/redo actions
           * by calling methods on the proxy.
           *
           * @example
           *     setSize(size) {
           *       this.undoManager.proxyFor(this).setSize(this._size);
           *       this._size = size;
           *     }
           *
           * @param {Object} target call `selector` on this object
           * @returns {Object}
           */

          value: function proxyFor(target) {
            var proxy = {};
            var self = this;

            function proxyMethod(selector) {
              return function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                self.registerUndo.apply(self, [target, selector].concat(args));
              };
            }

            $$utils$$getAllPropertyNames(target).forEach(function (selector) {
              // don't trigger anything that has a getter
              if ($$utils$$hasGetter(target, selector)) {
                return;
              }

              // don't try to proxy properties that aren't functions
              if (typeof target[selector] !== "function") {
                return;
              }

              // set up a proxy function to register an undo
              proxy[selector] = proxyMethod(selector);
            });

            return proxy;
          }
        }
      });

      return UndoManager;
    })();

    var $$undo_manager$$default = $$undo_manager$$UndoManager;
    var $$keybindings$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$keybindings$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /*! jshint esnext:true, undef:true, unused:true */

    /** @private */
    var $$keybindings$$A = 65;
    /** @private */
    var $$keybindings$$Y = 89;
    /** @private */
    var $$keybindings$$Z = 90;
    /** @private */
    var $$keybindings$$ZERO = 48;
    /** @private */
    var $$keybindings$$NINE = 57;
    /** @private */
    var $$keybindings$$LEFT = 37;
    /** @private */
    var $$keybindings$$RIGHT = 39;
    /** @private */
    var $$keybindings$$UP = 38;
    /** @private */
    var $$keybindings$$DOWN = 40;
    /** @private */
    var $$keybindings$$BACKSPACE = 8;
    /** @private */
    var $$keybindings$$DELETE = 46;
    /** @private */
    var $$keybindings$$TAB = 9;
    /** @private */
    var $$keybindings$$ENTER = 13;

    /**
     * @namespace KEYS
     */
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

      /**
       * @param {number} keyCode
       * @returns {boolean}
       */
      isDigit: function isDigit(keyCode) {
        return $$keybindings$$ZERO <= keyCode && keyCode <= $$keybindings$$NINE;
      },

      /**
       * Is an arrow keyCode.
       *
       * @param {number} keyCode
       * @returns {boolean}
       */
      isDirectional: function isDirectional(keyCode) {
        return keyCode === $$keybindings$$LEFT || keyCode === $$keybindings$$RIGHT || keyCode === $$keybindings$$UP || keyCode === $$keybindings$$DOWN;
      }
    };

    var $$keybindings$$CTRL = 1 << 0;
    var $$keybindings$$META = 1 << 1;
    var $$keybindings$$ALT = 1 << 2;
    var $$keybindings$$SHIFT = 1 << 3;

    var $$keybindings$$cache = {};
    function $$keybindings$$keyBindingsForPlatform(platform) {
      var osx = platform === "OSX";
      var ctrl = osx ? $$keybindings$$META : $$keybindings$$CTRL;

      if (!$$keybindings$$cache[platform]) {
        $$keybindings$$cache[platform] = $$keybindings$$build(function (bind) {
          bind($$keybindings$$A, ctrl, "selectAll");
          bind($$keybindings$$LEFT, null, "moveLeft");
          bind($$keybindings$$LEFT, $$keybindings$$ALT, "moveWordLeft");
          bind($$keybindings$$LEFT, $$keybindings$$SHIFT, "moveLeftAndModifySelection");
          bind($$keybindings$$LEFT, $$keybindings$$ALT | $$keybindings$$SHIFT, "moveWordLeftAndModifySelection");
          bind($$keybindings$$RIGHT, null, "moveRight");
          bind($$keybindings$$RIGHT, $$keybindings$$ALT, "moveWordRight");
          bind($$keybindings$$RIGHT, $$keybindings$$SHIFT, "moveRightAndModifySelection");
          bind($$keybindings$$RIGHT, $$keybindings$$ALT | $$keybindings$$SHIFT, "moveWordRightAndModifySelection");
          bind($$keybindings$$UP, null, "moveUp");
          bind($$keybindings$$UP, $$keybindings$$ALT, "moveToBeginningOfParagraph");
          bind($$keybindings$$UP, $$keybindings$$SHIFT, "moveUpAndModifySelection");
          bind($$keybindings$$UP, $$keybindings$$ALT | $$keybindings$$SHIFT, "moveParagraphBackwardAndModifySelection");
          bind($$keybindings$$DOWN, null, "moveDown");
          bind($$keybindings$$DOWN, $$keybindings$$ALT, "moveToEndOfParagraph");
          bind($$keybindings$$DOWN, $$keybindings$$SHIFT, "moveDownAndModifySelection");
          bind($$keybindings$$DOWN, $$keybindings$$ALT | $$keybindings$$SHIFT, "moveParagraphForwardAndModifySelection");
          bind($$keybindings$$BACKSPACE, null, "deleteBackward");
          bind($$keybindings$$BACKSPACE, $$keybindings$$SHIFT, "deleteBackward");
          bind($$keybindings$$BACKSPACE, $$keybindings$$ALT, "deleteWordBackward");
          bind($$keybindings$$BACKSPACE, $$keybindings$$ALT | $$keybindings$$SHIFT, "deleteWordBackward");
          bind($$keybindings$$BACKSPACE, ctrl, "deleteBackwardToBeginningOfLine");
          bind($$keybindings$$BACKSPACE, ctrl | $$keybindings$$SHIFT, "deleteBackwardToBeginningOfLine");
          bind($$keybindings$$DELETE, null, "deleteForward");
          bind($$keybindings$$DELETE, $$keybindings$$ALT, "deleteWordForward");
          bind($$keybindings$$TAB, null, "insertTab");
          bind($$keybindings$$TAB, $$keybindings$$SHIFT, "insertBackTab");
          bind($$keybindings$$ENTER, null, "insertNewline");
          bind($$keybindings$$Z, ctrl, "undo");

          if (osx) {
            bind($$keybindings$$LEFT, $$keybindings$$META, "moveToBeginningOfLine");
            bind($$keybindings$$LEFT, $$keybindings$$META | $$keybindings$$SHIFT, "moveToBeginningOfLineAndModifySelection");
            bind($$keybindings$$RIGHT, $$keybindings$$META, "moveToEndOfLine");
            bind($$keybindings$$RIGHT, $$keybindings$$META | $$keybindings$$SHIFT, "moveToEndOfLineAndModifySelection");
            bind($$keybindings$$UP, $$keybindings$$META, "moveToBeginningOfDocument");
            bind($$keybindings$$UP, $$keybindings$$META | $$keybindings$$SHIFT, "moveToBeginningOfDocumentAndModifySelection");
            bind($$keybindings$$DOWN, $$keybindings$$META, "moveToEndOfDocument");
            bind($$keybindings$$DOWN, $$keybindings$$META | $$keybindings$$SHIFT, "moveToEndOfDocumentAndModifySelection");
            bind($$keybindings$$BACKSPACE, $$keybindings$$CTRL, "deleteBackwardByDecomposingPreviousCharacter");
            bind($$keybindings$$BACKSPACE, $$keybindings$$CTRL | $$keybindings$$SHIFT, "deleteBackwardByDecomposingPreviousCharacter");
            bind($$keybindings$$Z, $$keybindings$$META | $$keybindings$$SHIFT, "redo");
          } else {
            bind($$keybindings$$Y, $$keybindings$$CTRL, "redo");
          }
        });
      }

      return $$keybindings$$cache[platform];
    }

    function $$keybindings$$build(callback) {
      var result = new $$keybindings$$BindingSet();
      callback(function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return result.bind.apply(result, args);
      });
      return result;
    }

    /**
     * @private
     */

    var $$keybindings$$BindingSet = (function () {
      function BindingSet() {
        $$keybindings$$_classCallCheck(this, BindingSet);

        this.bindings = {};
      }

      $$keybindings$$_createClass(BindingSet, {
        bind: {

          /**
           * @param {number} keyCode
           * @param {number} modifiers
           * @param {string} action
           */

          value: function bind(keyCode, modifiers, action) {
            if (!this.bindings[keyCode]) {
              this.bindings[keyCode] = {};
            }
            this.bindings[keyCode][modifiers || 0] = action;
          }
        },
        actionForEvent: {

          /**
           * @param {Event} event
           * @returns {?string}
           */

          value: function actionForEvent(event) {
            var bindingsForKeyCode = this.bindings[event.keyCode];
            if (bindingsForKeyCode) {
              var modifiers = 0;
              if (event.altKey) {
                modifiers |= $$keybindings$$ALT;
              }
              if (event.ctrlKey) {
                modifiers |= $$keybindings$$CTRL;
              }
              if (event.metaKey) {
                modifiers |= $$keybindings$$META;
              }
              if (event.shiftKey) {
                modifiers |= $$keybindings$$SHIFT;
              }
              return bindingsForKeyCode[modifiers];
            }
          }
        }
      });

      return BindingSet;
    })();
    var $$caret$$default = Caret;
    var $$text_field$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$text_field$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * Enum for text direction affinity.
     *
     * @const
     * @enum {number}
     * @private
     */
    var $$text_field$$Affinity = {
      UPSTREAM: 0,
      DOWNSTREAM: 1,
      NONE: null
    };

    /**
     * Tests is string passed in is a single word.
     *
     * @param {string} chr
     * @returns {boolean}
     * @private
     */
    function $$text_field$$isWordChar(chr) {
      return chr && /^\w$/.test(chr);
    }

    /**
     * Checks if char to the left of {index} in {string}
     * is a break (non-char).
     *
     * @param {string} text
     * @param {number} index
     * @returns {boolean}
     * @private
     */
    function $$text_field$$hasLeftWordBreakAtIndex(text, index) {
      if (index === 0) {
        return true;
      } else {
        return !$$text_field$$isWordChar(text[index - 1]) && $$text_field$$isWordChar(text[index]);
      }
    }

    /**
     * Checks if char to the right of {index} in {string}
     * is a break (non-char).
     *
     * @param {string} text
     * @param {number} index
     * @returns {boolean}
     * @private
     */
    function $$text_field$$hasRightWordBreakAtIndex(text, index) {
      if (index === text.length) {
        return true;
      } else {
        return $$text_field$$isWordChar(text[index]) && !$$text_field$$isWordChar(text[index + 1]);
      }
    }

    /**
     * TextField is the simplest input and the base for more complex
     * types to inherit.
     */

    var $$text_field$$TextField = (function () {
      /**
       * Sets up the initial properties of the TextField and
       * sets  up the event listeners
       *
       * @param {HTMLElement} element
       * @param {Formatter} formatter
       */

      function TextField(element, formatter) {
        $$text_field$$_classCallCheck(this, TextField);

        if (typeof element.get === "function") {
          console.warn("DEPRECATION: FieldKit.TextField instances should no longer be " + "created with a jQuery-wrapped element.");
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
        this._valueOnFocus = "";
        this._blur = $$utils$$bind(this._blur, this);
        this._focus = $$utils$$bind(this._focus, this);
        this._click = $$utils$$bind(this._click, this);
        this._paste = $$utils$$bind(this._paste, this);
        this._keyUp = $$utils$$bind(this._keyUp, this);
        this._keyPress = $$utils$$bind(this._keyPress, this);
        this._keyDown = $$utils$$bind(this._keyDown, this);
        if (element["field-kit-text-field"]) {
          throw new Error("already attached a TextField to this element");
        } else {
          element["field-kit-text-field"] = this;
        }
        element.addEventListener("keydown", this._keyDown);
        element.addEventListener("keypress", this._keyPress);
        element.addEventListener("keyup", this._keyUp);
        element.addEventListener("click", this._click);
        element.addEventListener("paste", this._paste);
        element.addEventListener("focus", this._focus);
        element.addEventListener("blur", this._blur);
        this._buildKeybindings();

        var window = element.ownerDocument.defaultView;

        /**
         * Fixes caret bug (Android) that caused the input
         * to place inserted characters in the wrong place
         * Expected: 1234 5678|  =>  1234 5678 9|
         * Bug: 1234 5678|  =>  1234 5679| 8
         *
         * @private
         */
        this._needsManualCaret = window.navigator.userAgent.toLowerCase().indexOf("android") > -1;

        /**
         * Contains one of the Affinity enum to indicate the preferred direction of
         * selection.
         *
         * @private
         */
        this.selectionAffinity = $$text_field$$Affinity.NONE;
      }

      $$text_field$$_createClass(TextField, {
        textDidChange: {

          /**
           * **** Public Events ****
           */

          /**
           * Called when the user has changed the text of the field. Can be used in
           * subclasses to perform actions suitable for this event.
           *
           * @private
           */

          value: function textDidChange() {}
        },
        textFieldDidEndEditing: {

          /**
           * Called when the user has in some way declared that they are done editing,
           * such as leaving the field or perhaps pressing enter. Can be used in
           * subclasses to perform actions suitable for this event.
           *
           * @private
           */

          value: function textFieldDidEndEditing() {}
        },
        textFieldDidBeginEditing: {

          /**
           * Performs actions necessary for beginning editing.
           *
           * @private
           */

          value: function textFieldDidBeginEditing() {}
        },
        _textDidChange: {

          /**
           * **** Private Events ****
           */

          /**
           * Performs actions necessary for text change.
           *
           * @private
           */

          value: function _textDidChange() {
            var delegate = this._delegate;
            this.textDidChange();
            if (delegate && typeof delegate.textDidChange === "function") {
              delegate.textDidChange(this);
            }

            // manually fire the HTML5 input event
            this._fireEvent("input");
          }
        },
        _textFieldDidEndEditing: {

          /**
           * Performs actions necessary for ending editing.
           *
           * @private
           */

          value: function _textFieldDidEndEditing() {
            var delegate = this._delegate;
            this.textFieldDidEndEditing();
            if (delegate && typeof delegate.textFieldDidEndEditing === "function") {
              delegate.textFieldDidEndEditing(this);
            }

            // manually fire the HTML5 change event, only when a change has been made since focus
            if (this._isDirty && this._valueOnFocus !== this.element.value) {
              this._fireEvent("change");
            }

            // reset the dirty property
            this._isDirty = false;
            this._valueOnFocus = "";
          }
        },
        _textFieldDidBeginEditing: {

          /**
           * Performs actions necessary for beginning editing.
           *
           * @private
           */

          value: function _textFieldDidBeginEditing() {
            var delegate = this._delegate;
            this.textFieldDidBeginEditing();
            if (delegate && typeof delegate.textFieldDidBeginEditing === "function") {
              delegate.textFieldDidBeginEditing(this);
            }
          }
        },
        clearSelection: {

          /**
           * **** Public Methods ****
           */

          /**
           * Clears all characters in the existing selection.
           *
           * @example
           *     // 12|34567|8
           *     clearSelection();
           *     // 12|8
           *
           */

          value: function clearSelection() {
            this.replaceSelection("");
          }
        },
        delegate: {

          /**
           * Gets the current delegate for this text field.
           *
           * @returns {TextFieldDelegate}
           */

          value: function delegate() {
            return this._delegate;
          }
        },
        setDelegate: {

          /**
           * Sets the current delegate for this text field.
           *
           * @param {TextFieldDelegate} delegate
           */

          value: function setDelegate(delegate) {
            this._delegate = delegate;
          }
        },
        deleteBackward: {

          /**
           * Deletes backward one character or clears a non-empty selection.
           *
           * @example
           *
           *     // |What's up, doc?
           *     deleteBackward(event);
           *     // |What's up, doc?
           *
           *     // What'|s up, doc?
           *     deleteBackward(event);
           *     // What|s up, doc?
           *
           *     // |What's| up, doc?
           *     deleteBackward(event);
           *     // | up, doc?
           */

          value: function deleteBackward(event) {
            event.preventDefault();
            var range = this.selectedRange();
            if (range.length === 0) {
              range.start--;
              range.length++;
              this.setSelectedRange(range);
            }
            this.clearSelection();
          }
        },
        deleteWordBackward: {

          /**
           * Deletes backward one word or clears a non-empty selection.
           *
           * @example
           *     // |What's up, doc?
           *     deleteWordBackward(event);
           *     // |What's up, doc?
           *
           *     // What'|s up, doc?
           *     deleteWordBackward(event);
           *     // |s up, doc?
           *
           *     // |What's| up, doc?
           *     deleteWordBackward(event);
           *     // | up, doc?
           */

          value: function deleteWordBackward(event) {
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
          }
        },
        deleteBackwardByDecomposingPreviousCharacter: {

          /**
           * Deletes backward one character, clears a non-empty selection, or decomposes
           * an accented character to its simple form.
           *
           * @TODO Make this work as described.
           *
           * @example
           *     // |fiancée
           *     deleteBackwardByDecomposingPreviousCharacter(event);
           *     // |What's up, doc?
           *
           *     // fianc|é|e
           *     deleteBackwardByDecomposingPreviousCharacter(event);
           *     // fianc|e
           *
           *     // fiancé|e
           *     deleteBackwardByDecomposingPreviousCharacter(event);
           *     // fiance|e
           *
           */

          value: function deleteBackwardByDecomposingPreviousCharacter(event) {
            this.deleteBackward(event);
          }
        },
        deleteBackwardToBeginningOfLine: {

          /**
           * Deletes all characters before the cursor or clears a non-empty selection.
           *
           * @example
           *     // The quick |brown fox.
           *     deleteBackwardToBeginningOfLine(event);
           *     // |brown fox.
           *
           *     // The |quick |brown fox.
           *     deleteBackwardToBeginningOfLine(event);
           *     // The brown fox.
           *
           */

          value: function deleteBackwardToBeginningOfLine(event) {
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
        },
        deleteForward: {

          /**
           * Deletes forward one character or clears a non-empty selection.
           *
           * @example
           *     // What's up, doc?|
           *     deleteForward(event);
           *     // What's up, doc?|
           *
           *     // What'|s up, doc?
           *     deleteForward(event);
           *     // What'| up, doc?
           *
           *     // |What's| up, doc?
           *     deleteForward(event);
           *     // | up, doc?
           *
           */

          value: function deleteForward(event) {
            event.preventDefault();
            var range = this.selectedRange();
            if (range.length === 0) {
              range.length++;
              this.setSelectedRange(range);
            }
            this.clearSelection();
          }
        },
        deleteWordForward: {

          /**
           * Deletes forward one word or clears a non-empty selection.
           *
           * @example
           *     // What's up, doc?|
           *     deleteWordForward(event);
           *     // What's up, doc?|
           *
           *     // What's |up, doc?
           *     deleteWordForward(event);
           *     // What's |, doc?
           *
           *     // |What's| up, doc?
           *     deleteWordForward(event);
           *     // | up, doc?
           */

          value: function deleteWordForward(event) {
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
          }
        },
        destroy: {

          /**
           * Tears down FieldKit
           */

          value: function destroy() {
            var element = this.element;
            element.removeEventListener("keydown", this._keyDown);
            element.removeEventListener("keypress", this._keyPress);
            element.removeEventListener("keyup", this._keyUp);
            element.removeEventListener("click", this._click);
            element.removeEventListener("paste", this._paste);
            element.removeEventListener("focus", this._focus);
            element.removeEventListener("blur", this._blur);
            delete element["field-kit-text-field"];
          }
        },
        formatter: {

          /**
           * Gets the current formatter. Formatters are used to translate between text
           * and value properties of the field.
           *
           * @returns {Formatter}
           */

          value: function formatter() {
            if (!this._formatter) {
              this._formatter = new $$formatter$$default();
              var maximumLengthString = this.element.getAttribute("maxlength");
              if (maximumLengthString !== undefined && maximumLengthString !== null) {
                this._formatter.maximumLength = parseInt(maximumLengthString, 10);
              }
            }

            return this._formatter;
          }
        },
        setFormatter: {

          /**
           * Sets the current formatter.
           *
           * @param {Formatter} formatter
           */

          value: function setFormatter(formatter) {
            var value = this.value();
            this._formatter = formatter;
            this.setValue(value);
          }
        },
        hasSelection: {

          /**
           * Determines whether this field has any selection.
           *
           * @returns {boolean} true if there is at least one character selected
           */

          value: function hasSelection() {
            return this.selectedRange().length !== 0;
          }
        },
        insertBackTab: {

          /**
           * Handles the back tab key.
           *
           */

          value: function insertBackTab() {}
        },
        insertTab: {

          /**
           * Handles the tab key.
           *
           */

          value: function insertTab() {}
        },
        insertText: {

          /**
           * Handles a key event that is trying to insert a character.
           *
           * @param {string} text
           */

          value: function insertText(text) {
            var range;
            if (this.hasSelection()) {
              this.clearSelection();
            }

            this.replaceSelection(text);
            range = this.selectedRange();
            range.start += range.length;
            range.length = 0;
            this.setSelectedRange(range);
          }
        },
        insertNewline: {

          /**
           * Handles a key event could be trying to end editing.
           *
           */

          value: function insertNewline() {
            this._textFieldDidEndEditing();
            this._didEndEditingButKeptFocus = true;
          }
        },
        inspect: {

          /**
           * Debug support
           *
           * @returns {string}
           */

          value: function inspect() {
            return "#<TextField text=\"" + this.text() + "\">";
          }
        },
        moveUp: {

          /**
           * Moves the cursor up, which because this is a single-line text field, means
           * moving to the beginning of the value.
           *
           * @example
           *     // Hey guys|
           *     moveUp(event);
           *     // |Hey guys
           *
           *     // Hey |guys|
           *     moveUp(event);
           *     // |Hey guys
           *
           * @param {Event} event
           */

          value: function moveUp(event) {
            event.preventDefault();
            this.setSelectedRange({
              start: 0,
              length: 0
            });
          }
        },
        moveToBeginningOfParagraph: {

          /**
           * Moves the cursor up to the beginning of the current paragraph, which because
           * this is a single-line text field, means moving to the beginning of the
           * value.
           *
           * @example
           *     // Hey guys|
           *     moveToBeginningOfParagraph(event)
           *     // |Hey guys
           *
           *     // Hey |guys|
           *     moveToBeginningOfParagraph(event)
           *     // |Hey guys
           *
           * @param {Event} event
           */

          value: function moveToBeginningOfParagraph(event) {
            this.moveUp(event);
          }
        },
        moveUpAndModifySelection: {

          /**
           * Moves the cursor up, keeping the current anchor point and extending the
           * selection to the beginning as moveUp would.
           *
           * @example
           *     // rightward selections are shrunk
           *     // Hey guys, |where> are you?
           *     moveUpAndModifySelection(event);
           *     // <Hey guys, |where are you?
           *
           *     // leftward selections are extended
           *     // Hey guys, <where| are you?
           *     moveUpAndModifySelection(event);
           *     // <Hey guys, where| are you?
           *
           *     // neutral selections are extended
           *     // Hey guys, |where| are you?
           *     moveUpAndModifySelection(event);
           *     // <Hey guys, where| are you?
           *
           * @param {Event} event
           */

          value: function moveUpAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            switch (this.selectionAffinity) {
              case $$text_field$$Affinity.UPSTREAM:
              case $$text_field$$Affinity.NONE:
                // 12<34 56|78  =>  <1234 56|78
                range.length += range.start;
                range.start = 0;
                break;
              case $$text_field$$Affinity.DOWNSTREAM:
                // 12|34 56>78   =>   <12|34 5678
                range.length = range.start;
                range.start = 0;
                break;
            }
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.UPSTREAM);
          }
        },
        moveParagraphBackwardAndModifySelection: {

          /**
           * Moves the free end of the selection to the beginning of the paragraph, or
           * since this is a single-line text field to the beginning of the line.
           *
           * @param {Event} event
           */

          value: function moveParagraphBackwardAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            switch (this.selectionAffinity) {
              case $$text_field$$Affinity.UPSTREAM:
              case $$text_field$$Affinity.NONE:
                // 12<34 56|78  =>  <1234 56|78
                range.length += range.start;
                range.start = 0;
                break;
              case $$text_field$$Affinity.DOWNSTREAM:
                // 12|34 56>78  =>  12|34 5678
                range.length = 0;
                break;
            }
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.UPSTREAM);
          }
        },
        moveToBeginningOfDocument: {

          /**
           * Moves the cursor to the beginning of the document.
           *
           * @param {Event} event
           */

          value: function moveToBeginningOfDocument(event) {
            // Since we only support a single line this is just an alias.
            this.moveToBeginningOfLine(event);
          }
        },
        moveToBeginningOfDocumentAndModifySelection: {

          /**
           * Moves the selection start to the beginning of the document.
           * @param {Event} event
           */

          value: function moveToBeginningOfDocumentAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            range.length += range.start;
            range.start = 0;
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.UPSTREAM);
          }
        },
        moveDown: {

          /**
           * Moves the cursor down, which because this is a single-line text field, means
           * moving to the end of the value.
           *
           * @example
           *     // Hey |guys
           *     moveDown(event)
           *     // Hey guys|
           *
           *     // |Hey| guys
           *     moveDown(event)
           *     // Hey guys|
           *
           * @param {Event} event
           */

          value: function moveDown(event) {
            event.preventDefault();
            // 12|34 56|78  =>  1234 5678|
            var range = {
              start: this.text().length,
              length: 0
            };
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.NONE);
          }
        },
        moveToEndOfParagraph: {

          /**
           * Moves the cursor up to the end of the current paragraph, which because this
           * is a single-line text field, means moving to the end of the value.
           *
           * @example
           *     // |Hey guys
           *     moveToEndOfParagraph(event)
           *     // Hey guys|
           *
           *     // Hey |guys|
           *     moveToEndOfParagraph(event)
           *     // Hey guys|
           *
           * @param {Event} event
           */

          value: function moveToEndOfParagraph(event) {
            this.moveDown(event);
          }
        },
        moveDownAndModifySelection: {

          /**
           * Moves the cursor down, keeping the current anchor point and extending the
           * selection to the end as moveDown would.
           *
           * @example
           *     // leftward selections are shrunk
           *     // Hey guys, <where| are you?
           *     moveDownAndModifySelection(event)
           *     // Hey guys, |where are you?>
           *
           *     // rightward selections are extended
           *     // Hey guys, |where> are you?
           *     moveDownAndModifySelection(event)
           *     // Hey guys, where| are you?>
           *
           *     // neutral selections are extended
           *     // Hey guys, |where| are you?
           *     moveDownAndModifySelection(event)
           *     // Hey guys, |where are you?>
           *
           * @param {Event} event
           */

          value: function moveDownAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            var end = this.text().length;
            if (this.selectionAffinity === $$text_field$$Affinity.UPSTREAM) {
              range.start += range.length;
            }
            range.length = end - range.start;
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.DOWNSTREAM);
          }
        },
        moveParagraphForwardAndModifySelection: {

          /**
           * Moves the free end of the selection to the end of the paragraph, or since
           * this is a single-line text field to the end of the line.
           *
           * @param {Event} event
           */

          value: function moveParagraphForwardAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            switch (this.selectionAffinity) {
              case $$text_field$$Affinity.DOWNSTREAM:
              case $$text_field$$Affinity.NONE:
                // 12|34 56>78  =>  12|34 5678>
                range.length = this.text().length - range.start;
                break;
              case $$text_field$$Affinity.UPSTREAM:
                // 12<34 56|78  =>  12|34 5678
                range.start += range.length;
                range.length = 0;
                break;
            }
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.DOWNSTREAM);
          }
        },
        moveToEndOfDocument: {

          /**
           * Moves the cursor to the end of the document.
           *
           * @param {Event} event
           */

          value: function moveToEndOfDocument(event) {
            // Since we only support a single line this is just an alias.
            this.moveToEndOfLine(event);
          }
        },
        moveToEndOfDocumentAndModifySelection: {

          /**
           * Moves the selection end to the end of the document.
           * @param {Event} event
           */

          value: function moveToEndOfDocumentAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            range.length = this.text().length - range.start;
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.DOWNSTREAM);
          }
        },
        moveLeft: {

          /**
           * Moves the cursor to the left, counting selections as a thing to move past.
           *
           * @example
           *     // no selection just moves the cursor left
           *     // Hey guys|
           *     moveLeft(event)
           *     // Hey guy|s
           *
           *     // selections are removed
           *     // Hey |guys|
           *     moveLeft(event)
           *     // Hey |guys
           *
           * @param {Event} event
           */

          value: function moveLeft(event) {
            event.preventDefault();
            var range = this.selectedRange();
            if (range.length !== 0) {
              range.length = 0;
            } else {
              range.start--;
            }
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.NONE);
          }
        },
        moveLeftAndModifySelection: {

          /**
           * Moves the free end of the selection one to the left.
           *
           * @example
           *     // no selection just selects to the left
           *     // Hey guys|
           *     moveLeftAndModifySelection(event)
           *     // Hey guy<s|
           *
           *     // left selections are extended
           *     // Hey <guys|
           *     moveLeftAndModifySelection(event)
           *     // Hey< guys|
           *
           *     // right selections are shrunk
           *     // Hey |guys>
           *     moveLeftAndModifySelection(event)
           *     // Hey |guy>s
           *
           *     // neutral selections are extended
           *     // Hey |guys|
           *     moveLeftAndModifySelection(event)
           *     //Hey< guys|
           *
           * @param {Event} event
           */

          value: function moveLeftAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            switch (this.selectionAffinity) {
              case $$text_field$$Affinity.UPSTREAM:
              case $$text_field$$Affinity.NONE:
                this.selectionAffinity = $$text_field$$Affinity.UPSTREAM;
                range.start--;
                range.length++;
                break;
              case $$text_field$$Affinity.DOWNSTREAM:
                range.length--;
                break;
            }
            this.setSelectedRange(range);
          }
        },
        moveWordLeft: {

          /**
           * Moves the cursor left until the start of a word is found.
           *
           * @example
           *     // no selection just moves the cursor left
           *     // Hey guys|
           *     moveWordLeft(event)
           *     // Hey |guys
           *
           *     // selections are removed
           *     // Hey |guys|
           *     moveWordLeft(event)
           *     // |Hey guys
           *
           * @param {Event} event
           */

          value: function moveWordLeft(event) {
            event.preventDefault();
            var index = this._lastWordBreakBeforeIndex(this.selectedRange().start - 1);
            this.setSelectedRange({ start: index, length: 0 });
          }
        },
        moveWordLeftAndModifySelection: {

          /**
           * Moves the free end of the current selection to the beginning of the previous
           * word.
           *
           * @example
           *     // no selection just selects to the left
           *     // Hey guys|
           *     moveWordLeftAndModifySelection(event)
           *     // Hey |guys|
           *
           *     // left selections are extended
           *     // Hey <guys|
           *     moveWordLeftAndModifySelection(event)
           *     // <Hey guys|
           *
           *     // right selections are shrunk
           *     // |Hey guys>
           *     moveWordLeftAndModifySelection(event)
           *     // |Hey >guys
           *
           *     // neutral selections are extended
           *     // Hey |guys|
           *     moveWordLeftAndModifySelection(event)
           *     // <Hey guys|
           *
           * @param {Event} event
           */

          value: function moveWordLeftAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            switch (this.selectionAffinity) {
              case $$text_field$$Affinity.UPSTREAM:
              case $$text_field$$Affinity.NONE:
                this.selectionAffinity = $$text_field$$Affinity.UPSTREAM;
                var start = this._lastWordBreakBeforeIndex(range.start - 1);
                range.length += range.start - start;
                range.start = start;
                break;
              case $$text_field$$Affinity.DOWNSTREAM:
                var end = this._lastWordBreakBeforeIndex(range.start + range.length);
                if (end < range.start) {
                  end = range.start;
                }
                range.length -= range.start + range.length - end;
                break;
            }
            this.setSelectedRange(range);
          }
        },
        moveToBeginningOfLine: {

          /**
           * Moves the cursor to the beginning of the current line.
           *
           * @example
           *     // Hey guys, where| are ya?
           *     moveToBeginningOfLine(event)
           *     // |Hey guys, where are ya?
           *
           * @param {Event} event
           */

          value: function moveToBeginningOfLine(event) {
            event.preventDefault();
            this.setSelectedRange({ start: 0, length: 0 });
          }
        },
        moveToBeginningOfLineAndModifySelection: {

          /**
           * Select from the free end of the selection to the beginning of line.
           *
           * @example
           *     // Hey guys, where| are ya?
           *     moveToBeginningOfLineAndModifySelection(event)
           *     // <Hey guys, where| are ya?
           *
           *     // Hey guys, where| are> ya?
           *     moveToBeginningOfLineAndModifySelection(event)
           *     // <Hey guys, where are| ya?
           *
           * @param {Event} event
           */

          value: function moveToBeginningOfLineAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            range.length += range.start;
            range.start = 0;
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.UPSTREAM);
          }
        },
        moveRight: {

          /**
           * Moves the cursor to the right, counting selections as a thing to move past.
           *
           * @example
           *     // no selection just moves the cursor right
           *     // Hey guy|s
           *     moveRight(event)
           *     // Hey guys|
           *
           *     // selections are removed
           *     // Hey |guys|
           *     moveRight(event)
           *     // Hey guys|
           *
           * @param {Event} event
           */

          value: function moveRight(event) {
            event.preventDefault();
            var range = this.selectedRange();
            if (range.length !== 0) {
              range.start += range.length;
              range.length = 0;
            } else {
              range.start++;
            }
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.NONE);
          }
        },
        moveRightAndModifySelection: {

          /**
           * Moves the free end of the selection one to the right.
           *
           * @example
           *     // no selection just selects to the right
           *     // Hey |guys
           *     moveRightAndModifySelection(event)
           *     // Hey |g>uys
           *
           *     // right selections are extended
           *     // Hey |gu>ys
           *     moveRightAndModifySelection(event)
           *     // Hey |guy>s
           *
           *     // left selections are shrunk
           *     // <Hey |guys
           *     moveRightAndModifySelection(event)
           *     // H<ey |guys
           *
           *     // neutral selections are extended
           *     // |Hey| guys
           *     moveRightAndModifySelection(event)
           *     // |Hey >guys
           *
           * @param {Event} event
           */

          value: function moveRightAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            switch (this.selectionAffinity) {
              case $$text_field$$Affinity.UPSTREAM:
                range.start++;
                range.length--;
                break;
              case $$text_field$$Affinity.DOWNSTREAM:
              case $$text_field$$Affinity.NONE:
                this.selectionAffinity = $$text_field$$Affinity.DOWNSTREAM;
                range.length++;
                break;
            }
            this.setSelectedRange(range);
          }
        },
        moveWordRight: {

          /**
           * Moves the cursor right until the end of a word is found.
           *
           * @example
           *     // no selection just moves the cursor right
           *     // Hey| guys
           *     moveWordRight(event)
           *     // Hey guys|
           *
           *     // selections are removed
           *     // |Hey| guys
           *     moveWordRight(event)
           *     // Hey guys|
           *
           * @param {Event} event
           */

          value: function moveWordRight(event) {
            event.preventDefault();
            var range = this.selectedRange();
            var index = this._nextWordBreakAfterIndex(range.start + range.length);
            this.setSelectedRange({ start: index, length: 0 });
          }
        },
        moveWordRightAndModifySelection: {

          /**
           * Moves the free end of the current selection to the next end of word.
           *
           * @example
           *     // no selection just selects to the right
           *     // Hey |guys
           *     moveWordRightAndModifySelection(event)
           *     // Hey |guys|
           *
           *     // right selections are extended
           *     // Hey |g>uys
           *     moveWordRightAndModifySelection(event)
           *     // Hey |guys>
           *
           *     // left selections are shrunk
           *     // He<y |guys
           *     moveWordRightAndModifySelection(event)
           *     // Hey< |guys
           *
           *     // neutral selections are extended
           *     // He|y |guys
           *     moveWordRightAndModifySelection(event)
           *     // He|y guys>
           *
           * @param {Event} event
           */

          value: function moveWordRightAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            var start = range.start;
            var end = range.start + range.length;
            switch (this.selectionAffinity) {
              case $$text_field$$Affinity.UPSTREAM:
                start = Math.min(this._nextWordBreakAfterIndex(start), end);
                break;
              case $$text_field$$Affinity.DOWNSTREAM:
              case $$text_field$$Affinity.NONE:
                this.selectionAffinity = $$text_field$$Affinity.DOWNSTREAM;
                end = this._nextWordBreakAfterIndex(range.start + range.length);
                break;
            }
            this.setSelectedRange({ start: start, length: end - start });
          }
        },
        moveToEndOfLine: {

          /**
           * Moves the cursor to the end of the current line.
           *
           * @example
           *     // Hey guys, where| are ya?
           *     moveToEndOfLine(event)
           *     // |Hey guys, where are ya?
           *
           * @param {Event} event
           */

          value: function moveToEndOfLine(event) {
            event.preventDefault();
            this.setSelectedRange({ start: this.text().length, length: 0 });
          }
        },
        moveToEndOfLineAndModifySelection: {

          /**
           * Moves the free end of the selection to the end of the current line.
           *
           * @example
           *     // Hey guys, where| are ya?
           *     moveToEndOfLineAndModifySelection(event)
           *     // Hey guys, where| are ya?>
           *
           *     // Hey guys, <where| are ya?
           *     moveToEndOfLineAndModifySelection(event)
           *     // Hey guys, |where are ya?>
           *
           * @param {Event} event
           */

          value: function moveToEndOfLineAndModifySelection(event) {
            event.preventDefault();
            var range = this.selectedRange();
            range.length = this.text().length - range.start;
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.DOWNSTREAM);
          }
        },
        readSelectionFromPasteboard: {

          /**
           * Replaces the current selection with text from the given pasteboard.
           *
           * @param {DataTransfer} pasteboard
           */

          value: function readSelectionFromPasteboard(pasteboard) {
            var range, text;
            text = pasteboard.getData("Text");
            this.replaceSelection(text);
            range = this.selectedRange();
            range.start += range.length;
            range.length = 0;
            this.setSelectedRange(range);
          }
        },
        replaceSelection: {

          /**
           * Replaces the characters within the selection with given text.
           *
           * @example
           *     // 12|34567|8
           *     replaceSelection('00')
           *     // 12|00|8
           *
           * @param {string} replacement
           */

          value: function replaceSelection(replacement) {
            var range = this.selectedRange();
            var end = range.start + range.length;
            var text = this.text();
            text = text.substring(0, range.start) + replacement + text.substring(end);
            range.length = replacement.length;
            this.setText(text);
            this.setSelectedRangeWithAffinity(range, $$text_field$$Affinity.NONE);
          }
        },
        rightWordBreakIndexes: {

          /**
           * Find ends of 'words' for navigational purposes.
           *
           * @example
           *     // given value of '123456789' and text of '123-45-6789'
           *     rightWordBreakIndexes()
           *     //=> [3, 5, 9]
           *
           * @returns {number[]}
           */

          value: function rightWordBreakIndexes() {
            var result = [];
            var text = this.text();
            for (var i = 0, l = text.length; i <= l; i++) {
              if ($$text_field$$hasRightWordBreakAtIndex(text, i)) {
                result.push(i + 1);
              }
            }
            return result;
          }
        },
        rollbackInvalidChanges: {

          /**
           * Checks changes after invoking the passed function for validity and rolls
           * them back if the changes turned out to be invalid.
           *
           * @returns {Object} whatever object `callback` returns
           */

          value: function rollbackInvalidChanges(callback) {
            var result = null;
            var errorType = null;
            var change = $$text_field$$TextFieldStateChange.build(this, function () {
              result = callback();
            });
            var error = function error(type) {
              errorType = type;
            };
            if (change.hasChanges()) {
              var formatter = this.formatter();
              if (formatter && typeof formatter.isChangeValid === "function") {
                if (!this._isDirty) {
                  this._valueOnFocus = change.current.text || "";
                  this._isDirty = true;
                }
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
        },
        selectAll: {

          /**
           * Expands the selection to contain all the characters in the content.
           *
           * @example
           *     // 123|45678
           *     selectAll(event)
           *     // |12345678|
           *
           * @param {Event} event
           */

          value: function selectAll(event) {
            event.preventDefault();
            this.setSelectedRangeWithAffinity({
              start: 0,
              length: this.text().length
            }, $$text_field$$Affinity.NONE);
          }
        },
        text: {

          /**
           * Gets the formatted text value. This is the same as the value of the
           * underlying input element.
           *
           * @returns {string}
           */

          value: function text() {
            return this.element.value;
          }
        },
        setText: {

          /**
           * Sets the formatted text value. This generally should not be used. Instead,
           * use the value setter.
           *
           * @param {string} text
           */

          value: function setText(text) {
            this.element.value = text;
          }
        },
        value: {

          /**
           * Gets the object value. This is the value that should be considered the
           * 'real' value of the field.
           *
           * @returns {Object}
           */

          value: function value() {
            var _this = this;

            var text = this.text();
            var delegate = this.delegate();
            var formatter = this.formatter();
            if (!formatter) {
              return text;
            }

            return formatter.parse(text, function (errorType) {
              if (delegate) {
                if (typeof delegate.textFieldDidFailToParseString === "function") {
                  delegate.textFieldDidFailToParseString(_this, text, errorType);
                }
              }
            });
          }
        },
        setValue: {

          /**
           * Sets the object value of the field.
           *
           * @param {string} value
           */

          value: function setValue(value) {
            if (this._formatter) {
              value = this._formatter.format(value);
            }
            this.setText("" + value);
          }
        },
        selectedRange: {

          /**
           * Gets the range of the current selection.
           *
           * @returns {Object} {start: number, length: number}
           */

          value: function selectedRange() {
            var caret = this._needsManualCaret ? this._manualCaret : $$caret$$default.get(this.element);

            return {
              start: caret.start,
              length: caret.end - caret.start
            };
          }
        },
        setSelectedRange: {

          /**
           * Sets the range of the current selection without changing the affinity.
           * @param {Object} range ({start: 0, length: 0})
           */

          value: function setSelectedRange(range) {
            this.setSelectedRangeWithAffinity(range, this.selectionAffinity);
          }
        },
        setSelectedRangeWithAffinity: {

          /**
           * Sets the range of the current selection and the selection affinity.
           *
           * @param {Object} range {start: number, length: number}
           * @param {Affinity} affinity
           */

          value: function setSelectedRangeWithAffinity(range, affinity) {
            var min = 0;
            var max = this.text().length;
            var caret = {
              start: Math.max(min, Math.min(max, range.start)),
              end: Math.max(min, Math.min(max, range.start + range.length))
            };
            this._manualCaret = caret;
            $$caret$$default.set(this.element, caret.start, caret.end);
            this.selectionAffinity = range.length === 0 ? $$text_field$$Affinity.NONE : affinity;
          }
        },
        selectionAnchor: {

          /**
           * Gets the position of the current selection's anchor point, i.e. the point
           * that the selection extends from, if any.
           *
           * @returns {number}
           */

          value: function selectionAnchor() {
            var range = this.selectedRange();
            switch (this.selectionAffinity) {
              case $$text_field$$Affinity.UPSTREAM:
                return range.start + range.length;
              case $$text_field$$Affinity.DOWNSTREAM:
                return range.start;
              default:
                return $$text_field$$Affinity.NONE;
            }
          }
        },
        allowsUndo: {

          /**
           * **** Undo Support ****
           */

          /**
           * Gets whether this text field records undo actions with its undo manager.
           *
           * @returns {boolean}
           */

          value: function allowsUndo() {
            return this._allowsUndo;
          }
        },
        setAllowsUndo: {

          /**
           * Sets whether this text field records undo actions with its undo manager.
           *
           * @param {boolean} allowsUndo
           */

          value: function setAllowsUndo(allowsUndo) {
            this._allowsUndo = allowsUndo;
          }
        },
        redo: {

          /**
           * Triggers a redo in the underlying UndoManager, if applicable.
           *
           * @param {Event} event
           */

          value: function redo(event) {
            if (this.undoManager().canRedo()) {
              this.undoManager().redo();
            }
            event.preventDefault();
          }
        },
        undo: {

          /**
           * Triggers an undo in the underlying UndoManager, if applicable.
           *
           * @param {Event} event
           */

          value: function undo(event) {
            if (this.undoManager().canUndo()) {
              this.undoManager().undo();
            }
            event.preventDefault();
          }
        },
        undoManager: {

          /**
           * Gets the UndoManager for this text field.
           *
           * @returns {UndoManager}
           */

          value: function undoManager() {
            return this._undoManager || (this._undoManager = new $$undo_manager$$default());
          }
        },
        becomeFirstResponder: {

          /**
           * **** Enabled/disabled support *****
           */

          /**
           * Removes focus from this field if it has focus.
           */

          value: function becomeFirstResponder() {
            var _this = this;

            this.element.focus();
            this.rollbackInvalidChanges(function () {
              _this.element.select();
              _this._syncPlaceholder();
            });
          }
        },
        hasFocus: {

          /**
           * Determines whether this field has focus.
           *
           * @returns {boolean} true if this field has focus
           */

          value: function hasFocus() {
            return this.element.ownerDocument.activeElement === this.element;
          }
        },
        isEnabled: {

          /**
           * Determines whether this field is enabled or disabled.
           *
           * @returns {boolean} true if this field is enabled
           */

          value: function isEnabled() {
            return this._enabled;
          }
        },
        setEnabled: {

          /**
           * Sets whether this text field is enabled
           * and syncs the placeholder to match
           *
           * @param {boolean} enabled
           */

          value: function setEnabled(enabled) {
            this._enabled = enabled;
            this._syncPlaceholder();
          }
        },
        resignFirstResponder: {

          /**
           * Removes focus from this field if it has focus.
           *
           * @param {Event} event
           */

          value: function resignFirstResponder(event) {
            if (event !== undefined && event !== null) {
              event.preventDefault();
            }
            this.element.blur();
            this._syncPlaceholder();
          }
        },
        disabledPlaceholder: {

          /*
           * **** Placeholder support ****
           */

          /**
           * Gets the disabled placeholder if one
           * has been set.
           *
           * @returns {string}
           */

          value: function disabledPlaceholder() {
            return this._disabledPlaceholder;
          }
        },
        setDisabledPlaceholder: {

          /**
           * Sets the disabled placeholder.
           *
           * @param {string} disabledPlaceholder
           */

          value: function setDisabledPlaceholder(disabledPlaceholder) {
            this._disabledPlaceholder = disabledPlaceholder;
            this._syncPlaceholder();
          }
        },
        focusedPlaceholder: {

          /**
           * Gets the focused placeholder if one
           * has been set.
           *
           * @returns {string}
           */

          value: function focusedPlaceholder() {
            return this._focusedPlaceholder;
          }
        },
        setFocusedPlaceholder: {

          /**
           * Sets the focused placeholder.
           *
           * @param {string} focusedPlaceholder
           */

          value: function setFocusedPlaceholder(focusedPlaceholder) {
            this._focusedPlaceholder = focusedPlaceholder;
            this._syncPlaceholder();
          }
        },
        placeholder: {

          /**
           * Gets the placeholder if one has
           * been set.
           *
           * @TODO Does this do anything?
           *
           * @returns {string}
           */

          value: function placeholder() {
            return this._placeholder;
          }
        },
        setPlaceholder: {

          /**
           * Sets the placeholder.
           *
           * @param {string} placeholder
           */

          value: function setPlaceholder(placeholder) {
            this._placeholder = placeholder;
            this.element.setAttribute("placeholder", this._placeholder);
          }
        },
        unfocusedPlaceholder: {

          /**
           * Gets the unfocused placeholder if one
           * has been set.
           *
           * @returns {string}
           */

          value: function unfocusedPlaceholder() {
            return this._unfocusedPlaceholder;
          }
        },
        setUnfocusedPlaceholder: {

          /**
           * Sets the unfocused placeholder.
           *
           * @param {string} unfocusedPlaceholder
           */

          value: function setUnfocusedPlaceholder(unfocusedPlaceholder) {
            this._unfocusedPlaceholder = unfocusedPlaceholder;
            this._syncPlaceholder();
          }
        },
        _applyChangeFromUndoManager: {

          /**
           * **** Private Methods ****
           */

          /**
           * Applies the given change as an undo/redo.
           *
           * @param {Object} change object with current and proposed properties
           * @private
           */

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
        },
        _buildKeybindings: {

          /**
           * Builds the key bindings for platform
           *
           * @private
           */

          value: function _buildKeybindings() {
            var doc = this.element.ownerDocument;
            var win = doc.defaultView || doc.parentWindow;
            var userAgent = win.navigator.userAgent;
            var osx = /^Mozilla\/[\d\.]+ \(Macintosh/.test(userAgent);
            this._bindings = $$keybindings$$keyBindingsForPlatform(osx ? "OSX" : "Default");
          }
        },
        _click: {

          /**
           * Handles clicks by resetting the selection affinity.
           *
           * @private
           */

          value: function _click() {
            if (this._needsManualCaret) {
              this._manualCaret = $$caret$$default.get(this.element);
            }
            this.selectionAffinity = $$text_field$$Affinity.NONE;
          }
        },
        _fireEvent: {

          /**
           * Fires event on the element
           *
           * @param {string} eventType
           * @private
           */

          value: function _fireEvent(eventType) {
            var document = this.element.ownerDocument;
            var window = document.defaultView;
            if (typeof window.CustomEvent === "function") {
              this.element.dispatchEvent(new window.CustomEvent(eventType, {}));
            } else {
              var event = document.createEvent("Event");
              event.initEvent(eventType, false, false);
              this.element.dispatchEvent(event);
            }
          }
        },
        _focus: {

          /**
           * Handles gaining focus. This method delegates to other methods, and syncs
           * the placeholder appropriately.
           *
           * @private
           */

          value: function _focus() {
            this._textFieldDidBeginEditing();
            this._syncPlaceholder();
          }
        },
        _blur: {

          /**
           * Handles losing focus. This method delegates to other methods, and syncs the
           * placeholder appropriately.
           *
           * @private
           */

          value: function _blur() {
            this._textFieldDidEndEditing();
            this._syncPlaceholder();
          }
        },
        _keyDown: {

          /**
           * Handles keyDown events. This method essentially just delegates to other,
           * more semantic, methods based on the modifier keys and the pressed key of the
           * event.
           *
           * @param {Event} event
           * @private
           */

          value: function _keyDown(event) {
            var _this = this;

            if (this._didEndEditingButKeptFocus) {
              this._textFieldDidBeginEditing();
              this._didEndEditingButKeptFocus = false;
            }

            var action = this._bindings.actionForEvent(event);
            if (action) {
              switch (action) {
                case "undo":
                case "redo":
                  this[action](event);
                  break;

                default:
                  this.rollbackInvalidChanges(function () {
                    return _this[action](event);
                  });
                  break;
              }
            }
          }
        },
        _keyPress: {

          /**
           * Handles inserting characters based on the typed key.
           *
           * @param {Event} event
           * @private
           */

          value: function _keyPress(event) {
            var _this = this;

            var keyCode = event.keyCode;
            if (!event.metaKey && !event.ctrlKey && keyCode !== $$keybindings$$KEYS.ENTER && keyCode !== $$keybindings$$KEYS.TAB && keyCode !== $$keybindings$$KEYS.BACKSPACE) {
              event.preventDefault();
              if (event.charCode !== 0) {
                var charCode = event.charCode || event.keyCode;
                this.rollbackInvalidChanges(function () {
                  return _this.insertText(String.fromCharCode(charCode));
                });
              }
            }
          }
        },
        _keyUp: {

          /**
           * Handles keyup events.
           *
           * @param {Event} event
           * @private
           */

          value: function _keyUp(event) {
            var _this = this;

            this.rollbackInvalidChanges(function () {
              if (event.keyCode === $$keybindings$$KEYS.TAB) {
                _this.selectAll(event);
              }
            });
          }
        },
        _lastWordBreakBeforeIndex: {

          /**
           * Finds the start of the 'word' before index.
           *
           * @param {number} index position at which to start looking
           * @returns {number} index in value less than or equal to the given index
           * @private
           */

          value: function _lastWordBreakBeforeIndex(index) {
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
          }
        },
        _leftWordBreakIndexes: {

          /**
           * Find starts of 'words' for navigational purposes.
           *
           * @example
           *     // given value of '123456789' and text of '123-45-6789'
           *     leftWordBreakIndexes()
           *     // => [0, 3, 5]
           *
           * @returns {number[]} indexes in value of word starts.
           * @private
           */

          value: function _leftWordBreakIndexes() {
            var result = [];
            var text = this.text();
            for (var i = 0, l = text.length; i < l; i++) {
              if ($$text_field$$hasLeftWordBreakAtIndex(text, i)) {
                result.push(i);
              }
            }
            return result;
          }
        },
        _nextWordBreakAfterIndex: {

          /**
           * Finds the end of the 'word' after index.
           *
           * @param {number} index position in value at which to start looking.
           * @returns {number}
           * @private
           */

          value: function _nextWordBreakAfterIndex(index) {
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
        },
        _paste: {

          /**
           * Handles paste events.
           *
           * @param {Event} event
           * @private
           */

          value: function _paste(event) {
            var _this = this;

            event.preventDefault();
            this.rollbackInvalidChanges(function () {
              _this.readSelectionFromPasteboard(event.clipboardData);
            });
          }
        },
        _syncPlaceholder: {

          /**
           * @private
           */

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
        }
      });

      return TextField;
    })();

    /**
     * Helps calculate the changes after an event on a FieldKit.TextField.
     *
     * @private
     */

    var $$text_field$$TextFieldStateChange = (function () {
      /**
       * @param {TextField} field
       */

      function TextFieldStateChange(field) {
        $$text_field$$_classCallCheck(this, TextFieldStateChange);

        this.field = field;
      }

      $$text_field$$_createClass(TextFieldStateChange, {
        hasChanges: {

          /**
           * Determines whether this field has changes.
           *
           * @returns {boolean} true if either the current text doesn't match the proposed text
           *    or the current selection range doesn't match the proposed selection range
           */

          value: function hasChanges() {
            this.recomputeDiff();
            return this.current.text !== this.proposed.text || this.current.selectedRange.start !== this.proposed.selectedRange.start || this.current.selectedRange.length !== this.proposed.selectedRange.length;
          }
        },
        recomputeDiff: {

          /**
           * Updates {TextFieldStateChange} inserted and {TextFieldStateChange} deleted
           * based on proposed and current
           */

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
                text: ""
              };
              this.deleted = {
                start: this.current.selectedRange.start,
                end: this.current.selectedRange.start + this.current.selectedRange.length,
                text: ""
              };
            }
          }
        }
      });

      return TextFieldStateChange;
    })();

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
    $$text_field$$TextFieldStateChange.build = function (field, callback) {
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
    var $$card_text_field$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$card_text_field$$_get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var $$card_text_field$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$card_text_field$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * Enum for card mask strategies.
     *
     * @readonly
     * @enum {number}
     * @private
     */
    var $$card_text_field$$CardMaskStrategy = {
      None: "None",
      DoneEditing: "DoneEditing"
    };

    /**
     * CardTextField add some functionality for credit card inputs
     *
     * @extends TextField
     */

    var $$card_text_field$$CardTextField = (function (_TextField) {
      /**
       * @param {HTMLElement} element
       */

      function CardTextField(element) {
        $$card_text_field$$_classCallCheck(this, CardTextField);

        $$card_text_field$$_get(Object.getPrototypeOf(CardTextField.prototype), "constructor", this).call(this, element, new $$adaptive_card_formatter$$default());
        this.setCardMaskStrategy($$card_text_field$$CardMaskStrategy.None);

        /**
         * Whether we are currently masking the displayed text.
         *
         * @private
         */
        this._masked = false;

        /**
         * Whether we are currently editing.
         *
         * @private
         */
        this._editing = false;
      }

      $$card_text_field$$_inherits(CardTextField, _TextField);

      $$card_text_field$$_createClass(CardTextField, {
        cardType: {

          /**
           * Gets the card type for the current value.
           *
           * @returns {string} Returns one of 'visa', 'mastercard', 'amex' and 'discover'.
           */

          value: function cardType() {
            return $$card_utils$$determineCardType(this.value());
          }
        },
        cardMaskStrategy: {

          /**
           * Gets the type of masking this field uses.
           *
           * @returns {CardMaskStrategy}
           */

          value: function cardMaskStrategy() {
            return this._cardMaskStrategy;
          }
        },
        setCardMaskStrategy: {

          /**
           * Sets the type of masking this field uses.
           *
           * @param {CardMaskStrategy} cardMaskStrategy One of CardMaskStrategy.
           */

          value: function setCardMaskStrategy(cardMaskStrategy) {
            if (cardMaskStrategy !== this._cardMaskStrategy) {
              this._cardMaskStrategy = cardMaskStrategy;
              this._syncMask();
            }
          }
        },
        cardMask: {

          /**
           * Returns a masked version of the current formatted PAN. Example:
           *
           * @example
           *     field.setText('4111 1111 1111 1111');
           *     field.cardMask(); // "•••• •••• •••• 1111"
           *
           * @returns {string} Returns a masked card string.
           */

          value: function cardMask() {
            var text = this.text();
            var toMask = text.slice(0, -4);
            var last4 = text.slice(-4);

            return toMask.replace(/\d/g, "•") + last4;
          }
        },
        text: {

          /**
           * Gets the formatted PAN for this field.
           *
           * @returns {string}
           */

          value: function text() {
            if (this._masked) {
              return this._unmaskedText;
            } else {
              return $$card_text_field$$_get(Object.getPrototypeOf(CardTextField.prototype), "text", this).call(this);
            }
          }
        },
        setText: {

          /**
           * Sets the formatted PAN for this field.
           *
           * @param {string} text A formatted PAN.
           */

          value: function setText(text) {
            if (this._masked) {
              this._unmaskedText = text;
              text = this.cardMask();
            }
            $$card_text_field$$_get(Object.getPrototypeOf(CardTextField.prototype), "setText", this).call(this, text);
          }
        },
        textFieldDidEndEditing: {

          /**
           * Called by our superclass, used to implement card masking.
           *
           * @private
           */

          value: function textFieldDidEndEditing() {
            this._editing = false;
            this._syncMask();
          }
        },
        textFieldDidBeginEditing: {

          /**
           * Called by our superclass, used to implement card masking.
           *
           * @private
           */

          value: function textFieldDidBeginEditing() {
            this._editing = true;
            this._syncMask();
          }
        },
        _enableMasking: {

          /**
           * Enables masking if it is not already enabled.
           *
           * @private
           */

          value: function _enableMasking() {
            if (!this._masked) {
              this._unmaskedText = this.text();
              this._masked = true;
              this.setText(this._unmaskedText);
            }
          }
        },
        _disableMasking: {

          /**
           * Disables masking if it is currently enabled.
           *
           * @private
           */

          value: function _disableMasking() {
            if (this._masked) {
              this._masked = false;
              this.setText(this._unmaskedText);
              this._unmaskedText = null;
            }
          }
        },
        _syncMask: {

          /**
           * Enables or disables masking based on the mask settings.
           *
           * @private
           */

          value: function _syncMask() {
            if (this.cardMaskStrategy() === $$card_text_field$$CardMaskStrategy.DoneEditing) {
              if (this._editing) {
                this._disableMasking();
              } else {
                this._enableMasking();
              }
            }
          }
        }
      }, {
        CardMaskStrategy: {

          /**
           * Enum for card mask strategies.
           *
           * @readonly
           * @enum {number}
           */

          get: function () {
            return $$card_text_field$$CardMaskStrategy;
          }
        }
      });

      return CardTextField;
    })($$text_field$$default);

    var $$card_text_field$$default = $$card_text_field$$CardTextField;
    var $$expiry_date_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$expiry_date_formatter$$_get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var $$expiry_date_formatter$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$expiry_date_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * Give this function a 2 digit year it'll return with 4.
     *
     * @example
     *     interpretTwoDigitYear(15);
     *     // => 2015
     *     interpretTwoDigitYear(97);
     *     // => 1997
     * @param {number} year
     * @returns {number}
     * @private
     */
    function $$expiry_date_formatter$$interpretTwoDigitYear(year) {
      var thisYear = new Date().getFullYear();
      var thisCentury = thisYear - thisYear % 100;
      var centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort(function (a, b) {
        return Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b));
      });
      return year + centuries[0];
    }

    /**
     * @extends DelimitedTextFormatter
     */

    var $$expiry_date_formatter$$ExpiryDateFormatter = (function (_DelimitedTextFormatter) {
      function ExpiryDateFormatter() {
        $$expiry_date_formatter$$_classCallCheck(this, ExpiryDateFormatter);

        $$expiry_date_formatter$$_get(Object.getPrototypeOf(ExpiryDateFormatter.prototype), "constructor", this).call(this, "/");
        this.maximumLength = 5;
      }

      $$expiry_date_formatter$$_inherits(ExpiryDateFormatter, _DelimitedTextFormatter);

      $$expiry_date_formatter$$_createClass(ExpiryDateFormatter, {
        hasDelimiterAtIndex: {

          /**
           * @param {number} index
           * @returns {boolean}
           */

          value: function hasDelimiterAtIndex(index) {
            return index === 2;
          }
        },
        format: {

          /**
           * Formats the given value by adding delimiters where needed.
           *
           * @param {?string} value
           * @returns {string}
           */

          value: function format(value) {
            if (!value) {
              return "";
            }

            var month = value.month;
            var year = value.year;
            year = year % 100;

            return $$expiry_date_formatter$$_get(Object.getPrototypeOf(ExpiryDateFormatter.prototype), "format", this).call(this, $$utils$$zpad2(month) + $$utils$$zpad2(year));
          }
        },
        parse: {

          /**
           * Parses the given text
           *
           * @param {string} text
           * @param {Function(string)} error
           * @returns {?Object} { month: month, year: year }
           */

          value: function parse(text, error) {
            var monthAndYear = text.split(this.delimiter);
            var month = monthAndYear[0];
            var year = monthAndYear[1];
            if (month && month.match(/^(0?[1-9]|1\d)$/) && year && year.match(/^\d\d?$/)) {
              month = Number(month);
              year = $$expiry_date_formatter$$interpretTwoDigitYear(Number(year));
              return { month: month, year: year };
            } else {
              if (typeof error === "function") {
                error("expiry-date-formatter.invalid-date");
              }
              return null;
            }
          }
        },
        isChangeValid: {

          /**
           * Determines whether the given change should be allowed and, if so, whether
           * it should be altered.
           *
           * @param {TextFieldStateChange} change
           * @param {function(string)} error
           * @returns {boolean}
           */

          value: function isChangeValid(change, error) {
            if (!error) {
              error = function () {};
            }

            var isBackspace = change.proposed.text.length < change.current.text.length;
            var newText = change.proposed.text;

            if (isBackspace) {
              if (change.deleted.text === this.delimiter) {
                newText = newText[0];
              }
              if (newText === "0") {
                newText = "";
              }
            } else if (change.inserted.text === this.delimiter && change.current.text === "1") {
              newText = "01" + this.delimiter;
            } else if (change.inserted.text.length > 0 && !/^\d$/.test(change.inserted.text)) {
              error("expiry-date-formatter.only-digits-allowed");
              return false;
            } else {
              // 4| -> 04|
              if (/^[2-9]$/.test(newText)) {
                newText = "0" + newText;
              }

              // 15| -> 1|
              if (/^1[3-9]$/.test(newText)) {
                error("expiry-date-formatter.invalid-month");
                return false;
              }

              // Don't allow 00
              if (newText === "00") {
                error("expiry-date-formatter.invalid-month");
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
          }
        }
      });

      return ExpiryDateFormatter;
    })($$delimited_text_formatter$$default);

    var $$expiry_date_formatter$$default = $$expiry_date_formatter$$ExpiryDateFormatter;
    var $$expiry_date_field$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$expiry_date_field$$_get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var $$expiry_date_field$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$expiry_date_field$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * Adds a default formatter for expiration dates.
     *
     * @extends TextField
     */

    var $$expiry_date_field$$ExpiryDateField = (function (_TextField) {
      /**
       * @param {HTMLElement} element
       */

      function ExpiryDateField(element) {
        $$expiry_date_field$$_classCallCheck(this, ExpiryDateField);

        $$expiry_date_field$$_get(Object.getPrototypeOf(ExpiryDateField.prototype), "constructor", this).call(this, element, new $$expiry_date_formatter$$default());
      }

      $$expiry_date_field$$_inherits(ExpiryDateField, _TextField);

      $$expiry_date_field$$_createClass(ExpiryDateField, {
        textFieldDidEndEditing: {

          /**
           * Called by our superclass, used to post-process the text.
           *
           * @private
           */

          value: function textFieldDidEndEditing() {
            var value = this.value();
            if (value) {
              this.setText(this.formatter().format(value));
            }
          }
        }
      });

      return ExpiryDateField;
    })($$text_field$$default);

    var $$expiry_date_field$$default = $$expiry_date_field$$ExpiryDateField;
    var $$number_formatter_settings_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$number_formatter_settings_formatter$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$number_formatter_settings_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var $$number_formatter_settings_formatter$$NumberFormatterSettings = function NumberFormatterSettings() {
      $$number_formatter_settings_formatter$$_classCallCheck(this, NumberFormatterSettings);

      /** @type boolean */
      this.alwaysShowsDecimalSeparator = false;

      /** @type number */
      this.groupingSize = 0;

      /** @type number */
      this.maximumFractionDigits = 0;

      /** @type number */
      this.minimumFractionDigits = 0;

      /** @type number */
      this.minimumIntegerDigits = 0;

      /** @type string */
      this.prefix = "";

      /** @type string */
      this.suffix = "";

      /** @type boolean */
      this.usesGroupingSeparator = false;
    };

    /**
     * Returns a string composed of the given character repeated `length` times.
     *
     * @param {string} character
     * @param {number} length
     * @returns {string}
     * @private
     */
    function $$number_formatter_settings_formatter$$chars(character, length) {
      return new Array(length + 1).join(character);
    }

    /**
     * @const
     * @private
     */
    var $$number_formatter_settings_formatter$$DIGIT = "#";

    /**
     * @const
     * @private
     */
    var $$number_formatter_settings_formatter$$PADDING = "0";

    /**
     * @const
     * @private
     */
    var $$number_formatter_settings_formatter$$DECIMAL_SEPARATOR = ".";

    /**
     * @const
     * @private
     */
    var $$number_formatter_settings_formatter$$GROUPING_SEPARATOR = ",";

    var $$number_formatter_settings_formatter$$NumberFormatterSettingsFormatter = (function (_Formatter) {
      function NumberFormatterSettingsFormatter() {
        $$number_formatter_settings_formatter$$_classCallCheck(this, NumberFormatterSettingsFormatter);

        if (_Formatter != null) {
          _Formatter.apply(this, arguments);
        }
      }

      $$number_formatter_settings_formatter$$_inherits(NumberFormatterSettingsFormatter, _Formatter);

      $$number_formatter_settings_formatter$$_createClass(NumberFormatterSettingsFormatter, {
        format: {
          /**
           * @param {NumberFormatterSettings} settings
           * @returns {string}
           */

          value: function format(settings) {
            var result = "";

            var minimumIntegerDigits = settings.minimumIntegerDigits;
            if (minimumIntegerDigits !== 0) {
              result += $$number_formatter_settings_formatter$$chars($$number_formatter_settings_formatter$$PADDING, minimumIntegerDigits);
            }

            result = $$number_formatter_settings_formatter$$DIGIT + result;

            if (settings.usesGroupingSeparator) {
              while (result.length <= settings.groupingSize) {
                result = $$number_formatter_settings_formatter$$DIGIT + result;
              }

              result = result.slice(0, -settings.groupingSize) + $$number_formatter_settings_formatter$$GROUPING_SEPARATOR + result.slice(-settings.groupingSize);
            }

            var minimumFractionDigits = settings.minimumFractionDigits;
            var maximumFractionDigits = settings.maximumFractionDigits;
            var hasFractionalPart = settings.alwaysShowsDecimalSeparator || minimumFractionDigits > 0 || maximumFractionDigits > 0;

            if (hasFractionalPart) {
              result += $$number_formatter_settings_formatter$$DECIMAL_SEPARATOR;
              for (var i = 0, length = maximumFractionDigits; i < length; i++) {
                result += i < minimumFractionDigits ? $$number_formatter_settings_formatter$$PADDING : $$number_formatter_settings_formatter$$DIGIT;
              }
            }

            return settings.prefix + result + settings.suffix;
          }
        },
        parse: {

          /**
           * @param {string} string
           * @returns {?NumberFormatterSettings}
           */

          value: function parse(string) {
            var result = new $$number_formatter_settings_formatter$$NumberFormatterSettings();

            var hasPassedPrefix = false;
            var hasStartedSuffix = false;
            var decimalSeparatorIndex = null;
            var groupingSeparatorIndex = null;
            var lastIntegerDigitIndex = null;

            for (var i = 0, length = string.length; i < length; i++) {
              var c = string[i];

              switch (c) {
                case $$number_formatter_settings_formatter$$DIGIT:
                  if (hasStartedSuffix) {
                    return null;
                  }
                  hasPassedPrefix = true;
                  if (decimalSeparatorIndex !== null) {
                    result.maximumFractionDigits++;
                  }
                  break;

                case $$number_formatter_settings_formatter$$PADDING:
                  if (hasStartedSuffix) {
                    return null;
                  }
                  hasPassedPrefix = true;
                  if (decimalSeparatorIndex === null) {
                    result.minimumIntegerDigits++;
                  } else {
                    result.minimumFractionDigits++;
                    result.maximumFractionDigits++;
                  }
                  break;

                case $$number_formatter_settings_formatter$$DECIMAL_SEPARATOR:
                  if (hasStartedSuffix) {
                    return null;
                  }
                  hasPassedPrefix = true;
                  decimalSeparatorIndex = i;
                  lastIntegerDigitIndex = i - 1;
                  break;

                case $$number_formatter_settings_formatter$$GROUPING_SEPARATOR:
                  if (hasStartedSuffix) {
                    return null;
                  }
                  hasPassedPrefix = true;
                  groupingSeparatorIndex = i;
                  break;

                default:
                  if (hasPassedPrefix) {
                    hasStartedSuffix = true;
                    result.suffix += c;
                  } else {
                    result.prefix += c;
                  }
              }
            }

            if (decimalSeparatorIndex === null) {
              lastIntegerDigitIndex = length - 1;
            }

            if (decimalSeparatorIndex === length - 1) {
              result.alwaysShowsDecimalSeparator = true;
            }

            if (groupingSeparatorIndex !== null) {
              result.groupingSize = lastIntegerDigitIndex - groupingSeparatorIndex;
              result.usesGroupingSeparator = true;
            }

            return result;
          }
        }
      });

      return NumberFormatterSettingsFormatter;
    })($$formatter$$default);

    var $$number_formatter_settings_formatter$$default = $$number_formatter_settings_formatter$$NumberFormatterSettingsFormatter;
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
    var $$number_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$number_formatter$$_get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var $$number_formatter$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$number_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    // Style
    var $$number_formatter$$NONE = 0;
    var $$number_formatter$$CURRENCY = 1;
    var $$number_formatter$$PERCENT = 2;

    var $$number_formatter$$DEFAULT_LOCALE = "en-US";
    var $$number_formatter$$DEFAULT_COUNTRY = "US";

    /**
     * @param {string} locale
     * @returns {Object} {lang: lang, country: country}
     * @private
     */
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
     *
     * @private
     */
    function $$number_formatter$$get(object, key) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      if (object) {
        var value = object[key];
        if (typeof value === "function") {
          return value.apply(undefined, args);
        } else {
          return value;
        }
      }
    }

    /**
     * @param {string} string
     * @param {string} currencySymbol
     * @return {string}
     * @private
     */
    function $$number_formatter$$replaceCurrencySymbol(string, currencySymbol) {
      return string.replace(/¤/g, currencySymbol);
    }

    /**
     * @param {string} string
     * @param {string} plusSign
     * @returns {string}
     * @private
     */
    function $$number_formatter$$replacePlusSign(string, plusSign) {
      return string.replace(/\+/g, plusSign);
    }
    /**
     * @param {string} string
     * @param {string} minusSign
     * @returns {string}
     * @private
     */
    function $$number_formatter$$replaceMinusSign(string, minusSign) {
      return string.replace(/-/g, minusSign);
    }

    /**
     * Formats and parses numbers. There are many configuration options for how to
     * format numbers as strings, but for many users simply adjusting the
     * {@link NumberFormatter#numberStyle}, {@link NumberFormatter#locale},
     * {@link NumberFormatter#currencyCode}, and {@link NumberFormatter#countryCode}
     * values will be sufficient. NumberFormatter natively understands how to
     * format numbers, currencies, and percentages for a variety of locales.
     *
     * @example
     *
     *   // Configure a NumberFormatter to display currencies.
     *   var f = new FieldKit.NumberFormatter();
     *   f.setNumberStyle(FieldKit.NumberFormatter.Style.CURRENCY);
     *
     *   // Configure the current locale info.
     *   f.setLocale('en-US');
     *   f.setCountryCode('US');
     *   f.setCurrencyCode('USD');
     *
     *   // Showing USD in US uses abbreviated currency.
     *   f.format(6.17);  // '$6.17'
     *
     *   // Showing CAD in US uses fully-qualified currency.
     *   f.setCurrencyCode('CAD');
     *   f.format(6.17);  // 'CA$6.17'
     *
     *   // Showing CAD in CA again uses abbreviated currency.
     *   f.setLocale('en-CA');
     *   f.setCountryCode('CA');
     *   f.format(6.17);  // '$6.17'
     *
     *   // Showing CAD in CA to a French speaker uses correct formatting.
     *   f.setLocale('fr-CA');
     *   f.format(6.17);  // '6,17 $'
     *
     *   // You may customize the behavior of NumberFormatter to achieve whatever
     *   // number formatting you need using the setter methods for the various
     *   // settings, or you can use the {@link NumberFormatter#positiveFormat} and
     *   // {@link NumberFormatter#negativeFormat} shorthand templates.
     *
     *   var f = new FieldKit.NumberFormatter();
     *
     *   // Using this template string…
     *   f.setPositiveFormat('¤#0.00');
     *
     *   // …is equivalent to this:
     *   f.setPositivePrefix('¤');
     *   f.setPositiveSuffix('');
     *   f.setMinimumIntegerDigits(1);
     *   f.setMinimumFractionDigits(2);
     *   f.setMaximumFractionDigits(2);
     *
     *   // And you can determine what the template string is for however you've
     *   // configured the NumberFormatter:
     *   f.setUsesGroupingSeparator(true);
     *   f.setGroupingSize(2);
     *   f.positiveFormat(); // '¤#,#0.00'
     *
     * @extends Formatter
     */

    var $$number_formatter$$NumberFormatter = (function (_Formatter) {
      function NumberFormatter() {
        $$number_formatter$$_classCallCheck(this, NumberFormatter);

        $$number_formatter$$_get(Object.getPrototypeOf(NumberFormatter.prototype), "constructor", this).call(this);
        this.setNumberStyle($$number_formatter$$NONE);
      }

      $$number_formatter$$_inherits(NumberFormatter, _Formatter);

      $$number_formatter$$_createClass(NumberFormatter, {
        allowsFloats: {

          /**
           * Gets whether this formatter will parse float number values. This value does
           * not apply to formatting. To prevent formatting floats, set
           * maximumFractionDigits to 0.
           *
           * @returns {boolean}
           */

          value: function allowsFloats() {
            return this._get("allowsFloats");
          }
        },
        setAllowsFloats: {

          /**
           * Sets whether this formatter will parse float number values.
           *
           * @param {boolean} allowsFloats
           * @returns {NumberFormatter}
           */

          value: function setAllowsFloats(allowsFloats) {
            this._allowsFloats = allowsFloats;
            return this;
          }
        },
        alwaysShowsDecimalSeparator: {

          /**
           * Gets whether this formatter should show the decimal separator.
           *
           * @returns {boolean}
           */

          value: function alwaysShowsDecimalSeparator() {
            return this._get("alwaysShowsDecimalSeparator");
          }
        },
        setAlwaysShowsDecimalSeparator: {

          /**
           * Sets whether this formatter will show the decimal separator.
           *
           * @param {boolean} alwaysShowsDecimalSeparator
           * @returns {NumberFormatter}
           */

          value: function setAlwaysShowsDecimalSeparator(alwaysShowsDecimalSeparator) {
            this._alwaysShowsDecimalSeparator = alwaysShowsDecimalSeparator;
            return this;
          }
        },
        countryCode: {

          /**
           * Gets the country code for formatter.
           *
           * @returns {string}
           */

          value: function countryCode() {
            return this._countryCode || $$number_formatter$$DEFAULT_COUNTRY;
          }
        },
        setCountryCode: {

          /**
           * Sets the country code for formatter.
           *
           * @param {string} countryCode
           * @returns {NumberFormatter}
           */

          value: function setCountryCode(countryCode) {
            this._countryCode = countryCode;
            return this;
          }
        },
        currencyCode: {

          /**
           * Gets the currency code for formatter.
           *
           * @returns {string}
           */

          value: function currencyCode() {
            return this._get("currencyCode");
          }
        },
        setCurrencyCode: {

          /**
           * Sets the currency code for formatter.
           *
           * @param {string} currencyCode
           * @returns {NumberFormatter}
           */

          value: function setCurrencyCode(currencyCode) {
            this._currencyCode = currencyCode;
            return this;
          }
        },
        currencySymbol: {

          /**
           * Gets the currency symbol for formatter.
           *
           * @returns {string}
           */

          value: function currencySymbol() {
            if (this._shouldShowNativeCurrencySymbol()) {
              return this._get("currencySymbol");
            } else {
              return this._get("internationalCurrencySymbol");
            }
          }
        },
        setCurrencySymbol: {

          /**
           * Sets the currency symbol for formatter.
           *
           * @param {string} currencySymbol
           * @returns {NumberFormatter}
           */

          value: function setCurrencySymbol(currencySymbol) {
            this._currencySymbol = currencySymbol;
            return this;
          }
        },
        _shouldShowNativeCurrencySymbol: {

          /**
           * @returns {boolean}
           * @private
           */

          value: function _shouldShowNativeCurrencySymbol() {
            var regionDefaultCurrencyCode = this._regionDefaults().currencyCode;
            if (typeof regionDefaultCurrencyCode === "function") {
              regionDefaultCurrencyCode = regionDefaultCurrencyCode();
            }
            return this.currencyCode() === regionDefaultCurrencyCode;
          }
        },
        decimalSeparator: {

          /**
           * Gets the decimal separator for formatter.
           *
           * @returns {string}
           */

          value: function decimalSeparator() {
            return this._get("decimalSeparator");
          }
        },
        setDecimalSeparator: {

          /**
           * Sets the decimal separator for formatter.
           *
           * @param {string} decimalSeparator
           * @returns {NumberFormatter}
           */

          value: function setDecimalSeparator(decimalSeparator) {
            this._decimalSeparator = decimalSeparator;
            return this;
          }
        },
        exponent: {

          /**
           * Gets the number of decimal places to shift numbers before formatting.
           *
           * @returns {string}
           */

          value: function exponent() {
            return this._get("exponent");
          }
        },
        setExponent: {

          /**
           * Sets the number of decimal places to shift numbers before formatting.
           *
           * @param exponent
           * @returns {NumberFormatter}
           */

          value: function setExponent(exponent) {
            this._exponent = exponent;
            return this;
          }
        },
        groupingSeparator: {
          value: function groupingSeparator() {
            return this._get("groupingSeparator");
          }
        },
        setGroupingSeparator: {

          /**
           * @param {string} groupingSeparator
           * @returns {NumberFormatter}
           */

          value: function setGroupingSeparator(groupingSeparator) {
            this._groupingSeparator = groupingSeparator;
            return this;
          }
        },
        groupingSize: {

          /**
           * Gets the grouping size for formatter.
           *
           * @returns {number}
           */

          value: function groupingSize() {
            return this._get("groupingSize");
          }
        },
        setGroupingSize: {

          /**
           * @param {number} groupingSize
           * @returns {NumberFormatter}
           */

          value: function setGroupingSize(groupingSize) {
            this._groupingSize = groupingSize;
            return this;
          }
        },
        internationalCurrencySymbol: {

          /**
           * @returns {string}
           */

          value: function internationalCurrencySymbol() {
            return this._get("internationalCurrencySymbol");
          }
        },
        setInternationalCurrencySymbol: {

          /**
           * @param {string} internationalCurrencySymbol
           * @returns {NumberFormatter}
           */

          value: function setInternationalCurrencySymbol(internationalCurrencySymbol) {
            this._internationalCurrencySymbol = internationalCurrencySymbol;
            return this;
          }
        },
        isLenient: {

          /**
           * @returns {boolean}
           */

          value: function isLenient() {
            return this._lenient;
          }
        },
        setLenient: {

          /**
           * @param {boolean} lenient
           * @returns {NumberFormatter}
           */

          value: function setLenient(lenient) {
            this._lenient = lenient;
            return this;
          }
        },
        locale: {

          /**
           * Gets the locale identifier for which this formatter is currently
           * configured to format strings. This setting controls default settings such
           * as the grouping separator character, decimal separator character, placement
           * of currency and percent symbols, etc.
           *
           * @returns {string}
           */

          value: function locale() {
            return this._locale || $$number_formatter$$DEFAULT_LOCALE;
          }
        },
        setLocale: {

          /**
           * Sets the locale identifier used for default settings values.
           *
           * @see {@link NumberFormatter#locale}
           * @param {string} locale
           * @returns {NumberFormatter}
           */

          value: function setLocale(locale) {
            this._locale = locale;
            return this;
          }
        },
        maximum: {

          /**
           * @returns {number}
           */

          value: function maximum() {
            return this._maximum;
          }
        },
        setMaximum: {

          /**
           * @param {number} max
           * @returns {NumberFormatter}
           */

          value: function setMaximum(max) {
            this._maximum = max;
            return this;
          }
        },
        minimum: {

          /**
           * @returns {number}
           */

          value: function minimum() {
            return this._minimum;
          }
        },
        setMinimum: {

          /**
           * @param {number} min
           * @returns {NumberFormatter}
           */

          value: function setMinimum(min) {
            this._minimum = min;
            return this;
          }
        },
        maximumFractionDigits: {

          /**
           * @returns {number}
           */

          value: function maximumFractionDigits() {
            var result = this._get("maximumFractionDigits");
            var minimumFractionDigits = this._minimumFractionDigits;
            if (result !== null && result !== undefined && minimumFractionDigits !== null && minimumFractionDigits !== undefined && minimumFractionDigits > result) {
              result = minimumFractionDigits;
            }
            return result;
          }
        },
        setMaximumFractionDigits: {

          /**
           * @param {number} maximumFractionDigits
           * @returns {NumberFormatter}
           */

          value: function setMaximumFractionDigits(maximumFractionDigits) {
            this._maximumFractionDigits = maximumFractionDigits;
            return this;
          }
        },
        minimumFractionDigits: {

          /**
           * @returns {number}
           */

          value: function minimumFractionDigits() {
            var result = this._get("minimumFractionDigits");
            var maximumFractionDigits = this._maximumFractionDigits;
            if (result !== null && result !== undefined && maximumFractionDigits !== null && maximumFractionDigits !== undefined && maximumFractionDigits < result) {
              result = maximumFractionDigits;
            }
            return result;
          }
        },
        setMinimumFractionDigits: {

          /**
           * @param {number} minimumFractionDigits
           * @returns {NumberFormatter}
           */

          value: function setMinimumFractionDigits(minimumFractionDigits) {
            this._minimumFractionDigits = minimumFractionDigits;
            return this;
          }
        },
        maximumIntegerDigits: {

          /**
           * @returns {number}
           */

          value: function maximumIntegerDigits() {
            var result = this._get("maximumIntegerDigits");
            var minimumIntegerDigits = this._minimumIntegerDigits;
            if (result !== null && result !== undefined && minimumIntegerDigits !== null && minimumIntegerDigits !== undefined && minimumIntegerDigits > result) {
              result = minimumIntegerDigits;
            }
            return result;
          }
        },
        setMaximumIntegerDigits: {

          /**
           * @param {number} maximumIntegerDigits
           * @returns {NumberFormatter}
           */

          value: function setMaximumIntegerDigits(maximumIntegerDigits) {
            this._maximumIntegerDigits = maximumIntegerDigits;
            return this;
          }
        },
        minimumIntegerDigits: {

          /**
           * @returns {number}
           */

          value: function minimumIntegerDigits() {
            var result = this._get("minimumIntegerDigits");
            var maximumIntegerDigits = this._maximumIntegerDigits;
            if (result !== null && result !== undefined && maximumIntegerDigits !== null && maximumIntegerDigits !== undefined && maximumIntegerDigits < result) {
              result = maximumIntegerDigits;
            }
            return result;
          }
        },
        setMinimumIntegerDigits: {

          /**
           * @param {number} minimumIntegerDigits
           * @returns {NumberFormatter}
           */

          value: function setMinimumIntegerDigits(minimumIntegerDigits) {
            this._minimumIntegerDigits = minimumIntegerDigits;
            return this;
          }
        },
        minusSign: {

          /**
           * Gets the minus sign used for negative numbers in some locales.
           *
           * @returns {?string}
           */

          value: function minusSign() {
            return this._get("minusSign");
          }
        },
        setMinusSign: {

          /**
           * Sets the minus sign used for negative numbers in some locales.
           *
           * @param {?string} minusSign
           * @returns {NumberFormatter}
           */

          value: function setMinusSign(minusSign) {
            this._minusSign = minusSign;
            return this;
          }
        },
        negativeFormat: {

          /**
           * Gets the negative number format string for the current settings. For
           * example, changing `minimumFractionDigits` from 0 to 3 would change this
           * value from "-#" to "-#.000".
           *
           * @return {string}
           */

          value: function negativeFormat() {
            return this.numberFormatFormatter().format({
              alwaysShowsDecimalSeparator: this.alwaysShowsDecimalSeparator(),
              groupingSize: this.groupingSize(),
              maximumFractionDigits: this.maximumFractionDigits(),
              minimumFractionDigits: this.minimumFractionDigits(),
              minimumIntegerDigits: this.minimumIntegerDigits(),
              prefix: this._get("negativePrefix"),
              suffix: this._get("negativeSuffix"),
              usesGroupingSeparator: this.usesGroupingSeparator()
            });
          }
        },
        setNegativeFormat: {

          /**
           * Configures this number formatter according to the given format string.
           * For most usages you should simply use
           * {@link NumberFormatter#setPositiveFormat} and configure the negative
           * prefix and suffix separately.
           *
           * @param negativeFormat
           */

          value: function setNegativeFormat(negativeFormat) {
            var settings = this.numberFormatFormatter().parse(negativeFormat);
            this.setNegativePrefix(settings.prefix);
            this.setNegativeSuffix(settings.suffix);
            this.setGroupingSize(settings.groupingSize);
            this.setMaximumFractionDigits(settings.maximumFractionDigits);
            this.setMinimumFractionDigits(settings.minimumFractionDigits);
            this.setMinimumIntegerDigits(settings.minimumIntegerDigits);
            this.setUsesGroupingSeparator(settings.usesGroupingSeparator);
          }
        },
        negativeInfinitySymbol: {

          /**
           * @returns {string}
           */

          value: function negativeInfinitySymbol() {
            return this._get("negativeInfinitySymbol");
          }
        },
        setNegativeInfinitySymbol: {

          /**
           * @param {string} negativeInfinitySymbol
           * @returns {NumberFormatter}
           */

          value: function setNegativeInfinitySymbol(negativeInfinitySymbol) {
            this._negativeInfinitySymbol = negativeInfinitySymbol;
            return this;
          }
        },
        negativePrefix: {

          /**
           * @returns {string}
           */

          value: function negativePrefix() {
            return $$number_formatter$$replaceCurrencySymbol($$number_formatter$$replaceMinusSign(this._get("negativePrefix"), this._get("minusSign")), this.currencySymbol());
          }
        },
        setNegativePrefix: {

          /**
           * @param {string} prefix
           * @returns {NumberFormatter}
           */

          value: function setNegativePrefix(prefix) {
            this._negativePrefix = prefix;
            return this;
          }
        },
        negativeSuffix: {

          /**
           * @returns {string}
           */

          value: function negativeSuffix() {
            return $$number_formatter$$replaceCurrencySymbol($$number_formatter$$replaceMinusSign(this._get("negativeSuffix"), this._get("minusSign")), this.currencySymbol());
          }
        },
        setNegativeSuffix: {

          /**
           * @param {string} prefix
           * @returns {NumberFormatter}
           */

          value: function setNegativeSuffix(prefix) {
            this._negativeSuffix = prefix;
            return this;
          }
        },
        notANumberSymbol: {

          /**
           * @returns {string}
           */

          value: function notANumberSymbol() {
            return this._get("notANumberSymbol");
          }
        },
        setNotANumberSymbol: {

          /**
           * @param {string} notANumberSymbol
           * @returns {NumberFormatter}
           */

          value: function setNotANumberSymbol(notANumberSymbol) {
            this._notANumberSymbol = notANumberSymbol;
            return this;
          }
        },
        nullSymbol: {

          /**
           * @returns {string}
           */

          value: function nullSymbol() {
            return this._get("nullSymbol");
          }
        },
        setNullSymbol: {

          /**
           * @param {string} nullSymbol
           * @returns {NumberFormatter}
           */

          value: function setNullSymbol(nullSymbol) {
            this._nullSymbol = nullSymbol;
            return this;
          }
        },
        numberFormatFormatter: {

          /**
           * @return {NumberFormatterSettingsFormatter}
           * @private
           */

          value: function numberFormatFormatter() {
            if (!this._numberFormatFormatter) {
              this._numberFormatFormatter = new $$number_formatter_settings_formatter$$default();
            }
            return this._numberFormatFormatter;
          }
        },
        numberStyle: {

          /**
           * Gets the number style used to configure various default setting values.
           *
           * @returns {NumberFormatter.Style}
           */

          value: function numberStyle() {
            return this._numberStyle;
          }
        },
        setNumberStyle: {

          /**
           * Sets the number style used to configure various default setting values.
           *
           * @param {string} numberStyle
           * @returns {NumberFormatter}
           */

          value: function setNumberStyle(numberStyle) {
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
          }
        },
        percentSymbol: {

          /**
           * @returns {string}
           */

          value: function percentSymbol() {
            return this._get("percentSymbol");
          }
        },
        setPercentSymbol: {

          /**
           * @param {string} percentSymbol
           * @returns {NumberFormatter}
           */

          value: function setPercentSymbol(percentSymbol) {
            this._percentSymbol = percentSymbol;
            return this;
          }
        },
        plusSign: {

          /**
           * Gets the plus sign used in positive numbers in some locales.
           *
           * @returns {string}
           */

          value: function plusSign() {
            return this._get("plusSign");
          }
        },
        setPlusSign: {

          /**
           * Sets the plus sign used in positive numbers in some locales.
           *
           * @param {?string} plusSign
           * @returns {NumberFormatter}
           */

          value: function setPlusSign(plusSign) {
            this._plusSign = plusSign;
            return this;
          }
        },
        positiveFormat: {

          /**
           * Gets the positive number format string for the current settings. For
           * example, changing `minimumFractionDigits` from 0 to 3 would change this
           * value from "#" to "#.000".
           *
           * @return {string}
           */

          value: function positiveFormat() {
            return this.numberFormatFormatter().format({
              alwaysShowsDecimalSeparator: this.alwaysShowsDecimalSeparator(),
              groupingSize: this.groupingSize(),
              maximumFractionDigits: this.maximumFractionDigits(),
              minimumFractionDigits: this.minimumFractionDigits(),
              minimumIntegerDigits: this.minimumIntegerDigits(),
              prefix: this._get("positivePrefix"),
              suffix: this._get("positiveSuffix"),
              usesGroupingSeparator: this.usesGroupingSeparator()
            });
          }
        },
        setPositiveFormat: {

          /**
           * Configures this number formatter according to the given format string.
           *
           * @example
           *
           *   // Use '0' for padding, '.' for decimal separator.
           *   formatter.setPositiveFormat('00.000');
           *   formatter.format(2);     // '02.000'
           *   formatter.format(-5.03); // '-05.030'
           *   formatter.setLocale('fr-FR');
           *   formatter.format(2);     // '02,000'
           *
           *   // Use '#' for maximum fraction digits.
           *   formatter.setPositiveFormat('#.##');
           *   formatter.format(3.456); // '3.46'
           *
           *   // Use '¤' as the currency placeholder.
           *   formatter.setPositiveFormat('¤#0.00');
           *   formatter.format(1.23); // '$1.23'
           *   formatter.setCurrencyCode('JPY');
           *   formatter.format(81);   // 'JP¥81.00'
           *   formatter.setLocale('jp-JP');
           *   formatter.format(7);   // '¥7.00'
           *
           *   // Use ',' for grouping separator placement.
           *   formatter.setPositiveFormat('#,##');
           *   formatter.format(123); // '1,23'
           *
           * @param positiveFormat
           */

          value: function setPositiveFormat(positiveFormat) {
            var settings = this.numberFormatFormatter().parse(positiveFormat);
            this.setPositivePrefix(settings.prefix);
            this.setPositiveSuffix(settings.suffix);
            this.setGroupingSize(settings.groupingSize);
            this.setMaximumFractionDigits(settings.maximumFractionDigits);
            this.setMinimumFractionDigits(settings.minimumFractionDigits);
            this.setMinimumIntegerDigits(settings.minimumIntegerDigits);
            this.setUsesGroupingSeparator(settings.usesGroupingSeparator);
          }
        },
        positiveInfinitySymbol: {

          /**
           * @returns {string}
           */

          value: function positiveInfinitySymbol() {
            return this._get("positiveInfinitySymbol");
          }
        },
        setPositiveInfinitySymbol: {

          /**
           * @param {string} positiveInfinitySymbol
           * @returns {NumberFormatter}
           */

          value: function setPositiveInfinitySymbol(positiveInfinitySymbol) {
            this._positiveInfinitySymbol = positiveInfinitySymbol;
            return this;
          }
        },
        positivePrefix: {

          /**
           * @returns {string}
           */

          value: function positivePrefix() {
            return $$number_formatter$$replaceCurrencySymbol($$number_formatter$$replacePlusSign(this._get("positivePrefix"), this._get("plusSign")), this.currencySymbol());
          }
        },
        setPositivePrefix: {

          /**
           * @param {string} prefix
           * @returns {NumberFormatter}
           */

          value: function setPositivePrefix(prefix) {
            this._positivePrefix = prefix;
            return this;
          }
        },
        positiveSuffix: {

          /**
           * @returns {string}
           */

          value: function positiveSuffix() {
            return $$number_formatter$$replaceCurrencySymbol($$number_formatter$$replacePlusSign(this._get("positiveSuffix"), this._get("plusSign")), this.currencySymbol());
          }
        },
        setPositiveSuffix: {

          /**
           * @param {string} prefix
           * @returns {NumberFormatter}
           */

          value: function setPositiveSuffix(prefix) {
            this._positiveSuffix = prefix;
            return this;
          }
        },
        roundingMode: {

          /**
           * @returns {Function}
           */

          value: function roundingMode() {
            return this._get("roundingMode");
          }
        },
        setRoundingMode: {

          /**
           * @param {Function} roundingMode
           * @returns {NumberFormatter}
           */

          value: function setRoundingMode(roundingMode) {
            this._roundingMode = roundingMode;
            return this;
          }
        },
        usesGroupingSeparator: {

          /**
           * @returns {boolean}
           */

          value: function usesGroupingSeparator() {
            return this._get("usesGroupingSeparator");
          }
        },
        setUsesGroupingSeparator: {

          /**
           * @param {boolean} usesGroupingSeparator
           * @returns {NumberFormatter}
           */

          value: function setUsesGroupingSeparator(usesGroupingSeparator) {
            this._usesGroupingSeparator = usesGroupingSeparator;
            return this;
          }
        },
        zeroSymbol: {

          /**
           * @returns {string}
           */

          value: function zeroSymbol() {
            return this._get("zeroSymbol");
          }
        },
        setZeroSymbol: {

          /**
           * @param {string} zeroSymbol
           * @returns {NumberFormatter}
           */

          value: function setZeroSymbol(zeroSymbol) {
            this._zeroSymbol = zeroSymbol;
            return this;
          }
        },
        _get: {

          /**
           * @param {string} attr
           * @returns {*}
           * @private
           */

          value: function _get(attr) {
            var value = this["_" + attr];
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
          }
        },
        format: {

          /**
           * Formats the given number as a string according to the settings applied to
           * this formatter. This may cause the number to be truncated, rounded, or
           * otherwise differ from what you might expect.
           *
           * @example
           *
           *   // By default no fraction digits are shown.
           *   var f = new FieldKit.NumberFormatter();
           *   f.format(Math.PI);  // '3'
           *
           *   // Let's format as a currency.
           *   f.setNumberStyle(FieldKit.NumberFormatter.Style.CURRENCY);
           *   f.format(Math.PI);  // '$3.14'
           *
           *   // Or as a percentage, which illustrates usage of {@link NumberFormatter#exponent}.
           *   f.setNumberStyle(FieldKit.NumberFormatter.Style.PERCENT);
           *   f.format(Math.PI);  // '314%'
           *
           *   // For the rest of the examples we'll go back to normal.
           *   f.setNumberStyle(FieldKit.NumberFormatter.Style.NONE);
           *
           *   // The default rounding mode is {@link NumberFormatter.Rounding.HALF_EVEN}.
           *   f.setMaximumFractionDigits(4);
           *   f.format(Math.PI);  // '3.1416'
           *
           *   // And we can change the rounding mode if we like.
           *   f.setRoundingMode(FieldKit.NumberFormatter.Rounding.FLOOR);
           *   f.format(Math.PI);  // '3.1415'
           *
           * @param {number} number
           * @returns {string}
           */

          value: function format(number) {
            if (number === "") {
              return "";
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

            var parts = ("" + Math.abs(number)).split(".");
            var integerPart = parts[0];
            var fractionPart = parts[1] || "";

            var exponent = this.exponent();
            if (exponent !== undefined && exponent !== null) {
              var shifted = stround$$shiftParts([negative, integerPart, fractionPart], exponent);
              negative = shifted[0];
              integerPart = shifted[1];
              fractionPart = shifted[2];
              while (integerPart[0] === "0") {
                integerPart = integerPart.slice(1);
              }
            }

            // round fraction part to the maximum length
            var maximumFractionDigits = this.maximumFractionDigits();
            if (fractionPart.length > maximumFractionDigits) {
              var unrounded = "" + integerPart + "." + fractionPart;
              var rounded = this._round(negative ? "-" + unrounded : unrounded);
              if (rounded[0] === "-") {
                rounded = rounded.slice(1);
              }
              parts = rounded.split(".");
              integerPart = parts[0];
              fractionPart = parts[1] || "";
            }

            // right-pad fraction zeros up to the minimum length
            var minimumFractionDigits = this.minimumFractionDigits();
            while (fractionPart.length < minimumFractionDigits) {
              fractionPart += "0";
            }

            // left-pad integer zeros up to the minimum length
            var minimumIntegerDigits = this.minimumIntegerDigits();
            while (integerPart.length < minimumIntegerDigits) {
              integerPart = "0" + integerPart;
            }

            // eat any unneeded trailing zeros
            while (fractionPart.length > minimumFractionDigits && fractionPart.slice(-1) === "0") {
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
              var integerPartWithGroupingSeparators = "";
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
          }
        },
        _round: {

          /**
           * @param {number} number
           * @returns {number}
           * @private
           */

          value: function _round(number) {
            return stround$$round(number, this.maximumFractionDigits(), this.roundingMode());
          }
        },
        parse: {

          /**
           * Parses the given string according to the current formatting settings.
           * When parsing values with a guaranteed regular format you can simply
           * configure the formatter correctly and call this method. However, when
           * dealing with human input it is often useful to configure
           * {@link NumberFormatter#isLenient} to be true, allowing more leeway in what
           * may be parsed as a valid number.
           *
           * @example
           *
           *   var f = new FieldKit.NumberFormatter();
           *   f.parse('89'); // 89
           *
           * @param {string} string
           * @param {function(string)} error
           * @returns {?number}
           */

          value: function parse(string, error) {
            var result;
            var positivePrefix = this.positivePrefix();
            var negativePrefix = this.negativePrefix();
            var positiveSuffix = this.positiveSuffix();
            var negativeSuffix = this.negativeSuffix();

            if (this.isLenient()) {
              string = string.replace(/\s/g, "");
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
                if (this.isLenient() || hasPositivePrefix && hasPositiveSuffix) {
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
                    error("number-formatter.invalid-format");
                  }
                  return null;
                }
              }
            }

            if (result !== undefined && result !== null) {
              var minimum = this.minimum();
              if (minimum !== undefined && minimum !== null && result < minimum) {
                if (typeof error === "function") {
                  error("number-formatter.out-of-bounds.below-minimum");
                }
                return null;
              }

              var maximum = this.maximum();
              if (maximum !== undefined && maximum !== null && result > maximum) {
                if (typeof error === "function") {
                  error("number-formatter.out-of-bounds.above-maximum");
                }
                return null;
              }
            }

            return result;
          }
        },
        _parseAbsoluteValue: {

          /**
           * @param {string} string
           * @param {function(string)} error
           * @returns {?number} returns value with delimiters removed
           * @private
           */

          value: function _parseAbsoluteValue(string, error) {
            var number;
            if (string.length === 0) {
              if (typeof error === "function") {
                error("number-formatter.invalid-format");
              }
              return null;
            }

            var parts = string.split(this.decimalSeparator());
            if (parts.length > 2) {
              if (typeof error === "function") {
                error("number-formatter.invalid-format");
              }
              return null;
            }

            var integerPart = parts[0];
            var fractionPart = parts[1] || "";

            if (this.usesGroupingSeparator()) {
              var groupingSize = this.groupingSize();
              var groupParts = integerPart.split(this.groupingSeparator());

              if (!this.isLenient()) {
                if (groupParts.length > 1) {
                  // disallow 1000,000
                  if (groupParts[0].length > groupingSize) {
                    if (typeof error === "function") {
                      error("number-formatter.invalid-format.grouping-size");
                    }
                    return null;
                  }

                  // disallow 1,00
                  var groupPartsTail = groupParts.slice(1);
                  for (var i = 0, l = groupPartsTail.length; i < l; i++) {
                    if (groupPartsTail[i].length !== groupingSize) {
                      if (typeof error === "function") {
                        error("number-formatter.invalid-format.grouping-size");
                      }
                      return null;
                    }
                  }
                }
              }

              // remove grouping separators
              integerPart = groupParts.join("");
            }

            if (!$$utils$$isDigits(integerPart) || !$$utils$$isDigits(fractionPart)) {
              if (typeof error === "function") {
                error("number-formatter.invalid-format");
              }
              return null;
            }

            var exponent = this.exponent();
            if (exponent !== undefined && exponent !== null) {
              var shifted = stround$$shiftParts([false, integerPart, fractionPart], -exponent);
              integerPart = shifted[1];
              fractionPart = shifted[2];
            }

            number = Number(integerPart) + Number("." + (fractionPart || "0"));

            if (!this.allowsFloats() && number !== ~ ~number) {
              if (typeof error === "function") {
                error("number-formatter.floats-not-allowed");
              }
              return null;
            }

            return number;
          }
        },
        _currencyDefaults: {

          /**
           * Gets defaults.
           *
           * @returns {Array}
           * @private
           */

          value: function _currencyDefaults() {
            var result = {};

            $$utils$$forEach($$number_formatter$$CurrencyDefaults["default"], function (value, key) {
              result[key] = value;
            });

            $$utils$$forEach($$number_formatter$$CurrencyDefaults[this.currencyCode()], function (value, key) {
              result[key] = value;
            });

            return result;
          }
        },
        _regionDefaults: {

          /**
           * Gets defaults.
           *
           * @returns {Array}
           * @private
           */

          value: function _regionDefaults() {
            var result = {};

            $$utils$$forEach($$number_formatter$$RegionDefaults["default"], function (value, key) {
              result[key] = value;
            });

            $$utils$$forEach($$number_formatter$$RegionDefaults[this.countryCode()], function (value, key) {
              result[key] = value;
            });

            return result;
          }
        },
        _localeDefaults: {

          /**
           * Gets defaults.
           *
           * @returns {Array}
           * @private
           */

          value: function _localeDefaults() {
            var locale = this.locale();
            var countryCode = this.countryCode();
            var lang = $$number_formatter$$splitLocaleComponents(locale).lang;
            var result = {};

            var defaultFallbacks = [$$number_formatter$$RegionDefaults["default"], $$number_formatter$$LocaleDefaults["default"], $$number_formatter$$RegionDefaults[countryCode], // CA
            $$number_formatter$$LocaleDefaults[lang], // fr
            $$number_formatter$$LocaleDefaults[locale] // fr-CA
            ];

            $$utils$$forEach(defaultFallbacks, function (defaults) {
              $$utils$$forEach(defaults, function (value, key) {
                result[key] = value;
              });
            });

            return result;
          }
        }
      });

      return NumberFormatter;
    })($$formatter$$default);

    /**
     * Defaults
     */

    /** @private */
    $$number_formatter$$NumberFormatter.prototype._allowsFloats = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._alwaysShowsDecimalSeparator = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._countryCode = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._currencyCode = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._exponent = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._groupingSeparator = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._groupingSize = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._lenient = false;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._locale = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._internationalCurrencySymbol = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._maximumFractionDigits = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._minimumFractionDigits = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._maximumIntegerDigits = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._minimumIntegerDigits = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._maximum = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._minimum = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._notANumberSymbol = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._nullSymbol = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._numberStyle = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._roundingMode = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._usesGroupingSeparator = null;
    /** @private */
    $$number_formatter$$NumberFormatter.prototype._zeroSymbol = null;

    /**
     * Aliases
     */

    $$number_formatter$$NumberFormatter.prototype.stringFromNumber = $$number_formatter$$NumberFormatter.prototype.format;
    $$number_formatter$$NumberFormatter.prototype.numberFromString = $$number_formatter$$NumberFormatter.prototype.parse;

    $$number_formatter$$NumberFormatter.Rounding = stround$$modes;

    /**
     * @enum {number}
     * @readonly
     */
    $$number_formatter$$NumberFormatter.Style = {
      NONE: $$number_formatter$$NONE,
      CURRENCY: $$number_formatter$$CURRENCY,
      PERCENT: $$number_formatter$$PERCENT
    };

    /**
     * @namespace StyleDefaults
     */
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
        positiveSuffix: function (formatter) {
          return formatter.percentSymbol();
        },
        negativeSuffix: function (formatter) {
          return formatter.percentSymbol();
        }
      },
      CURRENCY: {
        positivePrefix: function positivePrefix(formatter, locale) {
          return $$number_formatter$$get(locale, "positiveCurrencyPrefix", formatter, this);
        },
        positiveSuffix: function positiveSuffix(formatter, locale) {
          return $$number_formatter$$get(locale, "positiveCurrencySuffix", formatter, this);
        },
        negativePrefix: function negativePrefix(formatter, locale) {
          return $$number_formatter$$get(locale, "negativeCurrencyPrefix", formatter, this);
        },
        negativeSuffix: function negativeSuffix(formatter, locale) {
          return $$number_formatter$$get(locale, "negativeCurrencySuffix", formatter, this);
        }
      }
    };

    /**
     * Contains the default values for various number formatter settings, including
     * per-locale overrides. Some of these characters will not be used as-is and
     * instead serve as placeholders:
     *
     *   "¤"  placeholder for `currencySymbol()`.
     *   "-"  placeholder for `minusSign()`.
     *   "+"  placeholder for `plusSign()`.
     *
     * @namespace LocaleDefaults
     */
    var $$number_formatter$$LocaleDefaults = {
      "default": {
        allowsFloats: true,
        alwaysShowsDecimalSeparator: false,
        decimalSeparator: ".",
        groupingSeparator: ",",
        groupingSize: 3,
        minusSign: "-",
        negativeInfinitySymbol: "-∞",
        negativePrefix: "-",
        negativeSuffix: "",
        notANumberSymbol: "NaN",
        nullSymbol: "",
        percentSymbol: "%",
        positiveInfinitySymbol: "+∞",
        positivePrefix: "",
        positiveSuffix: "",
        plusSign: "+",
        roundingMode: $$number_formatter$$NumberFormatter.Rounding.HALF_EVEN,
        positiveCurrencyPrefix: "¤",
        positiveCurrencySuffix: "",
        negativeCurrencyPrefix: "(¤",
        negativeCurrencySuffix: ")"
      },
      fr: {
        decimalSeparator: ",",
        groupingSeparator: " ",
        percentSymbol: " %",
        positiveCurrencyPrefix: "",
        positiveCurrencySuffix: " ¤",
        negativeCurrencyPrefix: "(",
        negativeCurrencySuffix: " ¤)"
      },
      ja: {
        negativeCurrencyPrefix: "-¤",
        negativeCurrencySuffix: ""
      },
      "en-GB": {
        negativeCurrencyPrefix: "-¤",
        negativeCurrencySuffix: ""
      }
    };

    /**
     * @namespace RegionDefaults
     */
    var $$number_formatter$$RegionDefaults = {
      AE: {
        currencyCode: "AED"
      },
      AG: {
        currencyCode: "XCD"
      },
      AI: {
        currencyCode: "XCD"
      },
      AL: {
        currencyCode: "ALL"
      },
      AM: {
        currencyCode: "AMD"
      },
      AO: {
        currencyCode: "AOA"
      },
      AR: {
        currencyCode: "ARS"
      },
      AT: {
        currencyCode: "EUR"
      },
      AU: {
        currencyCode: "AUD"
      },
      AW: {
        currencyCode: "AWG"
      },
      AZ: {
        currencyCode: "AZN"
      },
      BA: {
        currencyCode: "BAM"
      },
      BB: {
        currencyCode: "BBD"
      },
      BD: {
        currencyCode: "BDT"
      },
      BE: {
        currencyCode: "EUR"
      },
      BF: {
        currencyCode: "XOF"
      },
      BG: {
        currencyCode: "BGN"
      },
      BH: {
        currencyCode: "BHD"
      },
      BJ: {
        currencyCode: "XOF"
      },
      BM: {
        currencyCode: "BMD"
      },
      BN: {
        currencyCode: "BND"
      },
      BO: {
        currencyCode: "BOB"
      },
      BR: {
        currencyCode: "BRL"
      },
      BS: {
        currencyCode: "BSD"
      },
      BT: {
        currencyCode: "BTN"
      },
      BW: {
        currencyCode: "BWP"
      },
      BY: {
        currencyCode: "BYR"
      },
      BZ: {
        currencyCode: "BZD"
      },
      CA: {
        currencyCode: "CAD"
      },
      CG: {
        currencyCode: "CDF"
      },
      CH: {
        currencyCode: "CHF"
      },
      CI: {
        currencyCode: "XOF"
      },
      CL: {
        currencyCode: "CLP"
      },
      CM: {
        currencyCode: "XAF"
      },
      CN: {
        currencyCode: "CNY"
      },
      CO: {
        currencyCode: "COP"
      },
      CR: {
        currencyCode: "CRC"
      },
      CV: {
        currencyCode: "CVE"
      },
      CY: {
        currencyCode: "EUR"
      },
      CZ: {
        currencyCode: "CZK"
      },
      DE: {
        currencyCode: "EUR"
      },
      DK: {
        currencyCode: "DKK"
      },
      DM: {
        currencyCode: "XCD"
      },
      DO: {
        currencyCode: "DOP"
      },
      DZ: {
        currencyCode: "DZD"
      },
      EC: {
        currencyCode: "USD"
      },
      EE: {
        currencyCode: "EUR"
      },
      EG: {
        currencyCode: "EGP"
      },
      ES: {
        currencyCode: "EUR"
      },
      ET: {
        currencyCode: "ETB"
      },
      FI: {
        currencyCode: "EUR"
      },
      FJ: {
        currencyCode: "FJD"
      },
      FM: {
        currencyCode: "USD"
      },
      FR: {
        currencyCode: "EUR"
      },
      GA: {
        currencyCode: "XAF"
      },
      GB: {
        currencyCode: "GBP"
      },
      GD: {
        currencyCode: "XCD"
      },
      GE: {
        currencyCode: "GEL"
      },
      GH: {
        currencyCode: "GHS"
      },
      GI: {
        currencyCode: "GIP"
      },
      GM: {
        currencyCode: "GMD"
      },
      GR: {
        currencyCode: "EUR"
      },
      GT: {
        currencyCode: "GTQ"
      },
      GU: {
        currencyCode: "USD"
      },
      GW: {
        currencyCode: "XOF"
      },
      GY: {
        currencyCode: "GYD"
      },
      HK: {
        currencyCode: "HKD"
      },
      HN: {
        currencyCode: "HNL"
      },
      HR: {
        currencyCode: "HRK"
      },
      HT: {
        currencyCode: "HTG"
      },
      HU: {
        currencyCode: "HUF"
      },
      ID: {
        currencyCode: "IDR"
      },
      IE: {
        currencyCode: "EUR"
      },
      IL: {
        currencyCode: "ILS"
      },
      IN: {
        currencyCode: "INR"
      },
      IS: {
        currencyCode: "ISK"
      },
      IT: {
        currencyCode: "EUR"
      },
      JM: {
        currencyCode: "JMD"
      },
      JO: {
        currencyCode: "JOD"
      },
      JP: {
        currencyCode: "JPY"
      },
      KE: {
        currencyCode: "KES"
      },
      KG: {
        currencyCode: "KGS"
      },
      KH: {
        currencyCode: "KHR"
      },
      KN: {
        currencyCode: "XCD"
      },
      KR: {
        currencyCode: "KRW"
      },
      KW: {
        currencyCode: "KWD"
      },
      KY: {
        currencyCode: "KYD"
      },
      KZ: {
        currencyCode: "KZT"
      },
      LA: {
        currencyCode: "LAK"
      },
      LB: {
        currencyCode: "LBP"
      },
      LC: {
        currencyCode: "XCD"
      },
      LI: {
        currencyCode: "CHF"
      },
      LK: {
        currencyCode: "LKR"
      },
      LR: {
        currencyCode: "LRD"
      },
      LT: {
        currencyCode: "LTL"
      },
      LU: {
        currencyCode: "EUR"
      },
      LV: {
        currencyCode: "EUR"
      },
      MA: {
        currencyCode: "MAD"
      },
      MD: {
        currencyCode: "MDL"
      },
      MG: {
        currencyCode: "MGA"
      },
      MK: {
        currencyCode: "MKD"
      },
      ML: {
        currencyCode: "XOF"
      },
      MM: {
        currencyCode: "MMK"
      },
      MN: {
        currencyCode: "MNT"
      },
      MO: {
        currencyCode: "MOP"
      },
      MP: {
        currencyCode: "USD"
      },
      MR: {
        currencyCode: "MRO"
      },
      MS: {
        currencyCode: "XCD"
      },
      MT: {
        currencyCode: "EUR"
      },
      MU: {
        currencyCode: "MUR"
      },
      MW: {
        currencyCode: "MWK"
      },
      MX: {
        currencyCode: "MXN"
      },
      MY: {
        currencyCode: "MYR"
      },
      MZ: {
        currencyCode: "MZN"
      },
      NA: {
        currencyCode: "NAD"
      },
      NE: {
        currencyCode: "XOF"
      },
      NG: {
        currencyCode: "NGN"
      },
      NI: {
        currencyCode: "NIO"
      },
      NL: {
        currencyCode: "EUR"
      },
      NO: {
        currencyCode: "NOK"
      },
      NP: {
        currencyCode: "NPR"
      },
      NZ: {
        currencyCode: "NZD"
      },
      OM: {
        currencyCode: "OMR"
      },
      PA: {
        currencyCode: "PAB"
      },
      PE: {
        currencyCode: "PEN"
      },
      PG: {
        currencyCode: "PGK"
      },
      PH: {
        currencyCode: "PHP"
      },
      PK: {
        currencyCode: "PKR"
      },
      PL: {
        currencyCode: "PLN"
      },
      PR: {
        currencyCode: "USD"
      },
      PT: {
        currencyCode: "EUR"
      },
      PW: {
        currencyCode: "USD"
      },
      PY: {
        currencyCode: "PYG"
      },
      QA: {
        currencyCode: "QAR"
      },
      RO: {
        currencyCode: "RON"
      },
      RS: {
        currencyCode: "RSD"
      },
      RU: {
        currencyCode: "RUB"
      },
      RW: {
        currencyCode: "RWF"
      },
      SA: {
        currencyCode: "SAR"
      },
      SB: {
        currencyCode: "SBD"
      },
      SC: {
        currencyCode: "SCR"
      },
      SE: {
        currencyCode: "SEK"
      },
      SG: {
        currencyCode: "SGD"
      },
      SI: {
        currencyCode: "EUR"
      },
      SK: {
        currencyCode: "EUR"
      },
      SL: {
        currencyCode: "SLL"
      },
      SN: {
        currencyCode: "XOF"
      },
      SR: {
        currencyCode: "SRD"
      },
      ST: {
        currencyCode: "STD"
      },
      SV: {
        currencyCode: "SVC"
      },
      SZ: {
        currencyCode: "SZL"
      },
      TC: {
        currencyCode: "USD"
      },
      TD: {
        currencyCode: "XAF"
      },
      TG: {
        currencyCode: "XOF"
      },
      TH: {
        currencyCode: "THB"
      },
      TJ: {
        currencyCode: "TJS"
      },
      TM: {
        currencyCode: "TMT"
      },
      TN: {
        currencyCode: "TND"
      },
      TR: {
        currencyCode: "TRY"
      },
      TT: {
        currencyCode: "TTD"
      },
      TW: {
        currencyCode: "TWD"
      },
      TZ: {
        currencyCode: "TZS"
      },
      UA: {
        currencyCode: "UAH"
      },
      UG: {
        currencyCode: "UGX"
      },
      US: {
        currencyCode: "USD"
      },
      UY: {
        currencyCode: "UYU"
      },
      UZ: {
        currencyCode: "UZS"
      },
      VC: {
        currencyCode: "XCD"
      },
      VE: {
        currencyCode: "VEF"
      },
      VG: {
        currencyCode: "USD"
      },
      VI: {
        currencyCode: "USD"
      },
      VN: {
        currencyCode: "VND"
      },
      YE: {
        currencyCode: "YER"
      },
      ZA: {
        currencyCode: "ZAR"
      },
      ZM: {
        currencyCode: "ZMW"
      },
      ZW: {
        currencyCode: "USD"
      }
    };

    /**
     * @namespace CurrencyDefaults
     */
    var $$number_formatter$$CurrencyDefaults = {
      "default": {
        currencySymbol: function (formatter) {
          return formatter.currencyCode();
        },
        internationalCurrencySymbol: function (formatter) {
          return formatter.currencyCode();
        },
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        minimumIntegerDigits: 1,
        usesGroupingSeparator: true
      },
      AED: {
        currencySymbol: "د.إ",
        internationalCurrencySymbol: "د.إ"
      },
      ALL: {
        currencySymbol: "L",
        internationalCurrencySymbol: "L"
      },
      AMD: {
        currencySymbol: "դր.",
        internationalCurrencySymbol: "դր."
      },
      AOA: {
        currencySymbol: "Kz",
        internationalCurrencySymbol: "Kz"
      },
      ARS: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      AUD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      AWG: {
        currencySymbol: "ƒ",
        internationalCurrencySymbol: "ƒ"
      },
      AZN: {
        currencySymbol: "₼",
        internationalCurrencySymbol: "₼"
      },
      BAM: {
        currencySymbol: "КМ",
        internationalCurrencySymbol: "КМ"
      },
      BBD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      BDT: {
        currencySymbol: "৳",
        internationalCurrencySymbol: "৳"
      },
      BGN: {
        currencySymbol: "лв",
        internationalCurrencySymbol: "лв"
      },
      BHD: {
        currencySymbol: "ب.د",
        internationalCurrencySymbol: "ب.د",
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      },
      BMD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      BND: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      BOB: {
        currencySymbol: "Bs.",
        internationalCurrencySymbol: "Bs."
      },
      BRL: {
        currencySymbol: "R$",
        internationalCurrencySymbol: "R$"
      },
      BSD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      BTN: {
        currencySymbol: "Nu.",
        internationalCurrencySymbol: "Nu."
      },
      BWP: {
        currencySymbol: "P",
        internationalCurrencySymbol: "P"
      },
      BYR: {
        currencySymbol: "Br",
        internationalCurrencySymbol: "Br"
      },
      BZD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      CAD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      CDF: {
        currencySymbol: "Fr",
        internationalCurrencySymbol: "Fr"
      },
      CHF: {
        currencySymbol: "Fr",
        internationalCurrencySymbol: "Fr"
      },
      CLP: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      },
      CNY: {
        currencySymbol: "¥",
        internationalCurrencySymbol: "¥"
      },
      COP: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      CRC: {
        currencySymbol: "₡",
        internationalCurrencySymbol: "₡"
      },
      CVE: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      CZK: {
        currencySymbol: "Kč",
        internationalCurrencySymbol: "Kč"
      },
      DKK: {
        currencySymbol: "kr",
        internationalCurrencySymbol: "kr"
      },
      DOP: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      DZD: {
        currencySymbol: "د.ج",
        internationalCurrencySymbol: "د.ج"
      },
      EGP: {
        currencySymbol: "E£",
        internationalCurrencySymbol: "E£"
      },
      ETB: {
        currencySymbol: "ብር",
        internationalCurrencySymbol: "ብር"
      },
      EUR: {
        currencySymbol: "€",
        internationalCurrencySymbol: "€"
      },
      FJD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      GBP: {
        currencySymbol: "£",
        internationalCurrencySymbol: "£"
      },
      GEL: {
        currencySymbol: "ლ,",
        internationalCurrencySymbol: "ლ,"
      },
      GHS: {
        currencySymbol: "₵",
        internationalCurrencySymbol: "₵"
      },
      GIP: {
        currencySymbol: "£",
        internationalCurrencySymbol: "£"
      },
      GMD: {
        currencySymbol: "D",
        internationalCurrencySymbol: "D"
      },
      GTQ: {
        currencySymbol: "Q",
        internationalCurrencySymbol: "Q"
      },
      GYD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      HKD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      HNL: {
        currencySymbol: "L",
        internationalCurrencySymbol: "L"
      },
      HRK: {
        currencySymbol: "kn",
        internationalCurrencySymbol: "kn"
      },
      HTG: {
        currencySymbol: "G",
        internationalCurrencySymbol: "G"
      },
      HUF: {
        currencySymbol: "Ft",
        internationalCurrencySymbol: "Ft"
      },
      IDR: {
        currencySymbol: "Rp",
        internationalCurrencySymbol: "Rp"
      },
      ILS: {
        currencySymbol: "₪",
        internationalCurrencySymbol: "₪"
      },
      INR: {
        currencySymbol: "₹",
        internationalCurrencySymbol: "₹"
      },
      ISK: {
        currencySymbol: "kr",
        internationalCurrencySymbol: "kr"
      },
      JMD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      JOD: {
        currencySymbol: "د.ا",
        internationalCurrencySymbol: "د.ا",
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      },
      JPY: {
        currencySymbol: "¥",
        internationalCurrencySymbol: "¥",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      },
      KES: {
        currencySymbol: "KSh",
        internationalCurrencySymbol: "KSh"
      },
      KGS: {
        currencySymbol: "som",
        internationalCurrencySymbol: "som"
      },
      KHR: {
        currencySymbol: "៛",
        internationalCurrencySymbol: "៛"
      },
      KRW: {
        currencySymbol: "₩",
        internationalCurrencySymbol: "₩",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      },
      KWD: {
        currencySymbol: "د.ك",
        internationalCurrencySymbol: "د.ك",
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      },
      KYD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      KZT: {
        currencySymbol: "〒",
        internationalCurrencySymbol: "〒"
      },
      LAK: {
        currencySymbol: "₭",
        internationalCurrencySymbol: "₭"
      },
      LBP: {
        currencySymbol: "ل.ل",
        internationalCurrencySymbol: "ل.ل"
      },
      LKR: {
        currencySymbol: "₨",
        internationalCurrencySymbol: "₨"
      },
      LRD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      LTL: {
        currencySymbol: "Lt",
        internationalCurrencySymbol: "Lt"
      },
      MAD: {
        currencySymbol: "د.م.",
        internationalCurrencySymbol: "د.م."
      },
      MDL: {
        currencySymbol: "L",
        internationalCurrencySymbol: "L"
      },
      MGA: {
        currencySymbol: "Ar",
        internationalCurrencySymbol: "Ar",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      },
      MKD: {
        currencySymbol: "ден",
        internationalCurrencySymbol: "ден"
      },
      MMK: {
        currencySymbol: "K",
        internationalCurrencySymbol: "K"
      },
      MNT: {
        currencySymbol: "₮",
        internationalCurrencySymbol: "₮"
      },
      MOP: {
        currencySymbol: "P",
        internationalCurrencySymbol: "P"
      },
      MRO: {
        currencySymbol: "UM",
        internationalCurrencySymbol: "UM",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      },
      MUR: {
        currencySymbol: "₨",
        internationalCurrencySymbol: "₨"
      },
      MWK: {
        currencySymbol: "MK",
        internationalCurrencySymbol: "MK"
      },
      MXN: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      MYR: {
        currencySymbol: "RM",
        internationalCurrencySymbol: "RM"
      },
      MZN: {
        currencySymbol: "MTn",
        internationalCurrencySymbol: "MTn"
      },
      NAD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      NGN: {
        currencySymbol: "₦",
        internationalCurrencySymbol: "₦"
      },
      NIO: {
        currencySymbol: "C$",
        internationalCurrencySymbol: "C$"
      },
      NOK: {
        currencySymbol: "kr",
        internationalCurrencySymbol: "kr"
      },
      NPR: {
        currencySymbol: "₨",
        internationalCurrencySymbol: "₨"
      },
      NZD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      OMR: {
        currencySymbol: "ر.ع.",
        internationalCurrencySymbol: "ر.ع.",
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      },
      PAB: {
        currencySymbol: "B/.",
        internationalCurrencySymbol: "B/."
      },
      PEN: {
        currencySymbol: "S/.",
        internationalCurrencySymbol: "S/."
      },
      PGK: {
        currencySymbol: "K",
        internationalCurrencySymbol: "K"
      },
      PHP: {
        currencySymbol: "₱",
        internationalCurrencySymbol: "₱"
      },
      PKR: {
        currencySymbol: "₨",
        internationalCurrencySymbol: "₨"
      },
      PLN: {
        currencySymbol: "zł",
        internationalCurrencySymbol: "zł"
      },
      PYG: {
        currencySymbol: "₲",
        internationalCurrencySymbol: "₲"
      },
      QAR: {
        currencySymbol: "ر.ق",
        internationalCurrencySymbol: "ر.ق"
      },
      RON: {
        currencySymbol: "Lei",
        internationalCurrencySymbol: "Lei"
      },
      RSD: {
        currencySymbol: "РСД",
        internationalCurrencySymbol: "РСД"
      },
      RUB: {
        currencySymbol: "₽",
        internationalCurrencySymbol: "₽"
      },
      RWF: {
        currencySymbol: "FRw",
        internationalCurrencySymbol: "FRw"
      },
      SAR: {
        currencySymbol: "ر.س",
        internationalCurrencySymbol: "ر.س"
      },
      SBD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      SCR: {
        currencySymbol: "₨",
        internationalCurrencySymbol: "₨"
      },
      SEK: {
        currencySymbol: "kr",
        internationalCurrencySymbol: "kr"
      },
      SGD: {
        currencySymbol: "S$",
        internationalCurrencySymbol: "S$"
      },
      SLL: {
        currencySymbol: "Le",
        internationalCurrencySymbol: "Le"
      },
      SRD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      STD: {
        currencySymbol: "Db",
        internationalCurrencySymbol: "Db"
      },
      SVC: {
        currencySymbol: "₡",
        internationalCurrencySymbol: "₡"
      },
      SZL: {
        currencySymbol: "E",
        internationalCurrencySymbol: "E"
      },
      THB: {
        currencySymbol: "฿",
        internationalCurrencySymbol: "฿"
      },
      TJS: {
        currencySymbol: "ЅМ",
        internationalCurrencySymbol: "ЅМ"
      },
      TMT: {
        currencySymbol: "m",
        internationalCurrencySymbol: "m"
      },
      TND: {
        currencySymbol: "د.ت",
        internationalCurrencySymbol: "د.ت",
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      },
      TRY: {
        currencySymbol: "₺",
        internationalCurrencySymbol: "₺"
      },
      TTD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      TWD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      TZS: {
        currencySymbol: "Sh",
        internationalCurrencySymbol: "Sh"
      },
      UAH: {
        currencySymbol: "₴",
        internationalCurrencySymbol: "₴"
      },
      UGX: {
        currencySymbol: "USh",
        internationalCurrencySymbol: "USh"
      },
      USD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "US$"
      },
      UYU: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      UZS: {
        currencySymbol: "лв",
        internationalCurrencySymbol: "лв"
      },
      VEF: {
        currencySymbol: "Bs F",
        internationalCurrencySymbol: "Bs F"
      },
      VND: {
        currencySymbol: "₫",
        internationalCurrencySymbol: "₫",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      },
      XAF: {
        currencySymbol: "Fr",
        internationalCurrencySymbol: "Fr"
      },
      XCD: {
        currencySymbol: "$",
        internationalCurrencySymbol: "$"
      },
      XOF: {
        currencySymbol: "Fr",
        internationalCurrencySymbol: "Fr"
      },
      YER: {
        currencySymbol: "﷼",
        internationalCurrencySymbol: "﷼"
      },
      ZAR: {
        currencySymbol: "R",
        internationalCurrencySymbol: "R"
      },
      ZMW: {
        currencySymbol: "ZMK",
        internationalCurrencySymbol: "ZMK"
      }
    };

    var $$number_formatter$$default = $$number_formatter$$NumberFormatter;
    var $$phone_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$phone_formatter$$_get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var $$phone_formatter$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$phone_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * @const
     * @private
     */
    var $$phone_formatter$$NANPPhoneDelimiters = {
      0: "(",
      4: ")",
      5: " ",
      9: "-"
    };

    /**
     * @const
     * @private
     */
    var $$phone_formatter$$NANPPhoneDelimitersWithOne = {
      1: " ",
      2: "(",
      6: ")",
      7: " ",
      11: "-"
    };

    /**
     * @const
     * @private
     */
    var $$phone_formatter$$NANPPhoneDelimitersWithPlus = {
      2: " ",
      3: "(",
      7: ")",
      8: " ",
      12: "-"
    };

    /**
     * This should match any characters in the maps above.
     *
     * @const
     * @private
     */
    var $$phone_formatter$$DELIMITER_PATTERN = /[-\(\) ]/g;

    /**
     * @extends DelimitedTextFormatter
     */

    var $$phone_formatter$$PhoneFormatter = (function (_DelimitedTextFormatter) {
      /**
       * @throws {Error} if anything is passed in
       * @param {Array} args
       */

      function PhoneFormatter() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        $$phone_formatter$$_classCallCheck(this, PhoneFormatter);

        if (args.length !== 0) {
          throw new Error("were you trying to set a delimiter (" + args[0] + ")?");
        }
      }

      $$phone_formatter$$_inherits(PhoneFormatter, _DelimitedTextFormatter);

      $$phone_formatter$$_createClass(PhoneFormatter, {
        isDelimiter: {

          /**
           * @param {string} chr
           * @returns {boolean}
           */

          value: function isDelimiter(chr) {
            var map = this.delimiterMap;
            for (var index in map) {
              if (map.hasOwnProperty(index)) {
                if (map[index] === chr) {
                  return true;
                }
              }
            }
            return false;
          }
        },
        delimiterAt: {

          /**
           * @param {number} index
           * @returns {?string}
           */

          value: function delimiterAt(index) {
            return this.delimiterMap[index];
          }
        },
        hasDelimiterAtIndex: {

          /**
           * @param {number} index
           * @returns {boolean}
           */

          value: function hasDelimiterAtIndex(index) {
            var delimiter = this.delimiterAt(index);
            return delimiter !== undefined && delimiter !== null;
          }
        },
        parse: {

          /**
           * Will call parse on the formatter.
           *
           * @param {string} text
           * @param {function(string)} error
           * @returns {string} returns value with delimiters removed
           */

          value: function parse(text, error) {
            if (!error) {
              error = function () {};
            }
            var digits = this.digitsWithoutCountryCode(text);
            // Source: http://en.wikipedia.org/wiki/North_American_Numbering_Plan
            //
            // Area Code
            if (text.length < 10) {
              error("phone-formatter.number-too-short");
            }
            if (digits[0] === "0") {
              error("phone-formatter.area-code-zero");
            }
            if (digits[0] === "1") {
              error("phone-formatter.area-code-one");
            }
            if (digits[1] === "9") {
              error("phone-formatter.area-code-n9n");
            }
            // Central Office Code
            if (digits[3] === "1") {
              error("phone-formatter.central-office-one");
            }
            if (digits.slice(4, 6) === "11") {
              error("phone-formatter.central-office-n11");
            }
            return $$phone_formatter$$_get(Object.getPrototypeOf(PhoneFormatter.prototype), "parse", this).call(this, text, error);
          }
        },
        format: {

          /**
           * @param {string} value
           * @returns {string}
           */

          value: function format(value) {
            this.guessFormatFromText(value);
            return $$phone_formatter$$_get(Object.getPrototypeOf(PhoneFormatter.prototype), "format", this).call(this, this.removeDelimiterMapChars(value));
          }
        },
        isChangeValid: {

          /**
           * Determines whether the given change should be allowed and, if so, whether
           * it should be altered.
           *
           * @param {TextFieldStateChange} change
           * @param {function(string)} error
           * @returns {boolean}
           */

          value: function isChangeValid(change, error) {
            this.guessFormatFromText(change.proposed.text);

            if (change.inserted.text.length > 1) {
              // handle pastes
              var text = change.current.text;
              var selectedRange = change.current.selectedRange;
              var toInsert = change.inserted.text;

              // Replace the selection with the new text, remove non-digits, then format.
              var formatted = this.format((text.slice(0, selectedRange.start) + toInsert + text.slice(selectedRange.start + selectedRange.length)).replace(/[^\d]/g, ""));

              change.proposed = {
                text: formatted,
                selectedRange: {
                  start: formatted.length - (text.length - (selectedRange.start + selectedRange.length)),
                  length: 0
                }
              };

              return $$phone_formatter$$_get(Object.getPrototypeOf(PhoneFormatter.prototype), "isChangeValid", this).call(this, change, error);
            }

            if (/^\d*$/.test(change.inserted.text) || change.proposed.text.indexOf("+") === 0) {
              return $$phone_formatter$$_get(Object.getPrototypeOf(PhoneFormatter.prototype), "isChangeValid", this).call(this, change, error);
            } else {
              return false;
            }
          }
        },
        guessFormatFromText: {

          /**
           * Re-configures this formatter to use the delimiters appropriate
           * for the given text.
           *
           * @param {string} text A potentially formatted string containing a phone number.
           * @private
           */

          value: function guessFormatFromText(text) {
            if (text && text[0] === "+") {
              this.delimiterMap = $$phone_formatter$$NANPPhoneDelimitersWithPlus;
              this.maximumLength = 1 + 1 + 10 + 5;
            } else if (text && text[0] === "1") {
              this.delimiterMap = $$phone_formatter$$NANPPhoneDelimitersWithOne;
              this.maximumLength = 1 + 10 + 5;
            } else {
              this.delimiterMap = $$phone_formatter$$NANPPhoneDelimiters;
              this.maximumLength = 10 + 4;
            }
          }
        },
        digitsWithoutCountryCode: {

          /**
           * Gives back just the phone number digits as a string without the
           * country code. Future-proofing internationalization where the country code
           * isn't just +1.
           *
           * @param {string} text
           * @private
           */

          value: function digitsWithoutCountryCode(text) {
            var digits = (text || "").replace(/[^\d]/g, "");
            var extraDigits = digits.length - 10;
            if (extraDigits > 0) {
              digits = digits.substr(extraDigits);
            }
            return digits;
          }
        },
        removeDelimiterMapChars: {

          /**
           * Removes characters from the phone number that will be added
           * by the formatter.
           *
           * @param {string} text
           * @private
           */

          value: function removeDelimiterMapChars(text) {
            return (text || "").replace($$phone_formatter$$DELIMITER_PATTERN, "");
          }
        }
      });

      return PhoneFormatter;
    })($$delimited_text_formatter$$default);

    var $$phone_formatter$$default = $$phone_formatter$$PhoneFormatter;
    var $$social_security_number_formatter$$_createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var $$social_security_number_formatter$$_get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var $$social_security_number_formatter$$_inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var $$social_security_number_formatter$$_classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    /**
     * @const
     * @private
     */
    var $$social_security_number_formatter$$DIGITS_PATTERN = /^\d*$/;

    /**
     * @extends DelimitedTextFormatter
     */

    var $$social_security_number_formatter$$SocialSecurityNumberFormatter = (function (_DelimitedTextFormatter) {
      function SocialSecurityNumberFormatter() {
        $$social_security_number_formatter$$_classCallCheck(this, SocialSecurityNumberFormatter);

        $$social_security_number_formatter$$_get(Object.getPrototypeOf(SocialSecurityNumberFormatter.prototype), "constructor", this).call(this, "-");
        this.maximumLength = 9 + 2;
      }

      $$social_security_number_formatter$$_inherits(SocialSecurityNumberFormatter, _DelimitedTextFormatter);

      $$social_security_number_formatter$$_createClass(SocialSecurityNumberFormatter, {
        hasDelimiterAtIndex: {

          /**
           * @param {number} index
           * @returns {boolean}
           */

          value: function hasDelimiterAtIndex(index) {
            return index === 3 || index === 6;
          }
        },
        isChangeValid: {

          /**
           * Determines whether the given change should be allowed and, if so, whether
           * it should be altered.
           *
           * @param {TextFieldStateChange} change
           * @param {function(string)} error
           * @returns {boolean}
           */

          value: function isChangeValid(change, error) {
            if ($$social_security_number_formatter$$DIGITS_PATTERN.test(change.inserted.text)) {
              return $$social_security_number_formatter$$_get(Object.getPrototypeOf(SocialSecurityNumberFormatter.prototype), "isChangeValid", this).call(this, change, error);
            } else {
              return false;
            }
          }
        }
      });

      return SocialSecurityNumberFormatter;
    })($$delimited_text_formatter$$default);

    var $$social_security_number_formatter$$default = $$social_security_number_formatter$$SocialSecurityNumberFormatter;

    /**
     * @namespace FieldKit
     * @readonly
     */
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
      NumberFormatterSettingsFormatter: $$number_formatter_settings_formatter$$default,
      PhoneFormatter: $$phone_formatter$$default,
      SocialSecurityNumberFormatter: $$social_security_number_formatter$$default,
      TextField: $$text_field$$default,
      UndoManager: $$undo_manager$$default
    };

    if (typeof define === "function" && define.amd) {
      define(function () {
        return index$$FieldKit;
      });
    } else if (typeof module !== "undefined" && module.exports) {
      module.exports = index$$FieldKit;
    } else if (typeof window !== "undefined") {
      window.FieldKit = index$$FieldKit;
    } else {
      this.FieldKit = index$$FieldKit;
    }
}).call(this);

//# sourceMappingURL=field-kit.js.map