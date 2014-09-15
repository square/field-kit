/*! jshint esnext:true, undef:true, unused:true */

import Formatter from './formatter';

/**
 * - extends [Formatter](formatter.md)
 *
 * A generic delimited formatter.
 *
 * @class DelimitedTextFormatter
 * @extends Formatter
 * @public
 */
class DelimitedTextFormatter extends Formatter {
  /**
   * @constructor
   * @param {String} [this.delimiter] delimiter
   * @param {Boolean} [false] isLazy
   * @throws {Error} delimiter must have just one character
   */
  constructor(delimiter, isLazy=false) {
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

  /**
   * @method delimiterAt
   *
   * Determines the delimiter character at the given index.
   *
   * @param {Number} index
   * @return {?String}
   * @public
   */
  delimiterAt(index) {
    if (!this.hasDelimiterAtIndex(index)) {
      return null;
    }
    return this.delimiter;
  }

  /**
   * @method isDelimiter
   *
   * Determines whether the given character is a delimiter.
   *
   * @param {String} chr
   * @return {Boolean}
   * @public
   */
  isDelimiter(chr) {
    return chr === this.delimiter;
  }

  /**
   * @method format
   *
   * Formats the given value by adding delimiters where needed.
   *
   * @param {?String} value
   * @return {String}
   * @public
   */
  format(value) {
    return this._textFromValue(value);
  }

  /**
   * @method _textFromValue
   *
   * Formats the given value by adding delimiters where needed.
   *
   * @param {?String} value
   * @return {String}
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
   * @method parse
   *
   * Parses the given text by removing delimiters.
   *
   * @param {?String} text
   * @return {String}
   * @public
   */
  parse(text) {
    return this._valueFromText(text);
  }

  /**
   * @method _valueFromText
   *
   * Parses the given text by removing delimiters.
   *
   * @param {?String} text
   * @return {String}
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
   * @method isChangeValid
   *
   * Determines whether the given change should be allowed and, if so, whether
   * it should be altered.
   *
   * @param {TextFieldStateChange} change
   * @param {Function(String)} error
   * @return {Boolean}
   * @public
   */
  isChangeValid(change, error) {
    if (!super(change, error)) {
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
