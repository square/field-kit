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
