import Formatter from './formatter';

/**
 * A generic delimited formatter.
 *
 * @extends Formatter
 */
class DelimitedTextFormatter extends Formatter {
  /**
   * @param {string=} delimiter
   * @param {boolean=} isLazy
   * @throws {Error} delimiter must have just one character
   */
  constructor(delimiter, isLazy=false) {
    super();

    if (arguments.length === 0) {
      return;
    }

    if (delimiter === null || delimiter === undefined || delimiter.length !== 1) {
      throw new Error('delimiter must have just one character');
    }
    this.delimiter = delimiter;

    // If the formatter is lazy, delimiter will not be added until input has gone
    // past the delimiter index. Useful for 'optional' extension, like zip codes.
    // 94103  ->  type '1'  ->  94103-1
    this.isLazy = isLazy;
  }

  /**
   * Determines the delimiter character at the given index.
   *
   * @param {number} index
   * @returns {?string}
   */
  delimiterAt(index) {
    if (!this.hasDelimiterAtIndex(index)) {
      return null;
    }
    return this.delimiter;
  }

  /**
   * Determines whether the given character is a delimiter.
   *
   * @param {string} chr
   * @returns {boolean}
   */
  isDelimiter(chr) {
    return chr === this.delimiter;
  }

  /**
   * Formats the given value by adding delimiters where needed.
   *
   * @param {?string} value
   * @returns {string}
   */
  format(value) {
    return this._textFromValue(value);
  }

  /**
   * Formats the given value by adding delimiters where needed.
   *
   * @param {?string} value
   * @returns {string}
   * @private
   */
  _textFromValue(value) {
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
  }

  /**
   * Parses the given text by removing delimiters.
   *
   * @param {?string} text
   * @returns {string}
   */
  parse(text) {
    return this._valueFromText(text);
  }

  /**
   * Parses the given text by removing delimiters.
   *
   * @param {?string} text
   * @returns {string}
   * @private
   */
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

  /**
   * Determines whether the given change should be allowed and, if so, whether
   * it should be altered.
   *
   * @param {TextFieldStateChange} change
   * @param {function(string)} error
   * @returns {boolean}
   */
  isChangeValid(change, error) {
    if (!super.isChangeValid(change, error)) {
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
      // move right over any delimiters found on the way, including any leading delimiters
      for (var i = change.current.selectedRange.start; i < range.start + range.length; i++) {
        if (this.delimiterAt(i)) {
          range.start++;
          if(range.length > 0) {
            range.length--;
          }
        }
      }

      while (this.delimiterAt(range.start)) {
        range.start++;
        range.length--;
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

    var value = this._valueFromText(newText, function(...args) {
      result = false;
      error(...args);
    });

    if (result) {
      change.proposed.text = this._textFromValue(value);
    }

    return result;
  }
}

export default DelimitedTextFormatter;
