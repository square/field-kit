/* jshint esnext:true */

var Formatter = require('./formatter');

class DelimitedTextFormatter {
  constructor(delimiter) {
    if (!delimiter) { delimiter = this.delimiter; }
    if (delimiter === null || delimiter === undefined || delimiter.length !== 1) {
      throw new Error('delimiter must have just one character');
    }
    this.delimiter = delimiter;
  }

  delimiterAt(index) {
    if (!this.hasDelimiterAtIndex(index)) {
      return null;
    }
    return this.delimiter;
  }

  isDelimiter(chr) {
    return chr === this.delimiter;
  }

  format(value) {
    return this._textFromValue(value);
  }

  _textFromValue(value) {
    if (!value) { return ''; }

    var result = '';
    var delimiter;

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
  }

  parse(text, error) {
    return this._valueFromText(text);
  }

  _valueFromText(text) {
    if (!text) { return ''; }
    var result = '';
    for (var i = 0, l = text.length; i < l; i++) {
      if (!this.isDelimiter(text[i])) {
        result += text[i];
      }
    }
    return result;
  }

  isChangeValid(change, error) {
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

    var result = true;

    var value = this._valueFromText(newText, function() {
      result = false;
      error.apply(null, arguments);
    });

    if (result) {
      change.proposed.text = this._textFromValue(value);
    }

    return result;
  }
}

module.exports = DelimitedTextFormatter;
