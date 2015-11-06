import DelimitedTextFormatter from './delimited_text_formatter';
import { zpad2 } from './utils';

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
function interpretTwoDigitYear(year) {
  const thisYear = new Date().getFullYear();
  const thisCentury = thisYear - (thisYear % 100);
  const centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort(function(a, b) {
    return Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b));
  });
  return year + centuries[0];
}

/**
 * @extends DelimitedTextFormatter
 */
class ExpiryDateFormatter extends DelimitedTextFormatter {
  constructor() {
    super('/');
    this.maximumLength = 5;
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */
  hasDelimiterAtIndex(index) {
    return index === 2;
  }

  /**
   * Formats the given value by adding delimiters where needed.
   *
   * @param {?string} value
   * @returns {string}
   */
  format(value) {
    if (!value) { return ''; }

    let {month, year} = value;
    year = year % 100;

    return super.format(zpad2(month) + zpad2(year));
  }

  /**
   * Parses the given text
   *
   * @param {string} text
   * @param {Function(string)} error
   * @returns {?Object} { month: month, year: year }
   */
  parse(text, error) {
    const monthAndYear = text.split(this.delimiter);
    let month = monthAndYear[0];
    let year = monthAndYear[1];
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
    if (!error) { error = function(){}; }

    const isBackspace = change.proposed.text.length < change.current.text.length;
    let newText = change.proposed.text;

    if (change.inserted.text === this.delimiter && change.current.text === '1') {
      newText = '01' + this.delimiter;
    } else if (change.inserted.text.length > 0 && !/^\d$/.test(change.inserted.text)) {
      error('expiry-date-formatter.only-digits-allowed');
      return false;
    } else {
      if (isBackspace) {
        if (change.deleted.text === this.delimiter) {
          newText = newText[0];
        }
        if (newText === '0') {
          newText = '';
        }
        if (change.inserted.text.length > 0 && !/^\d$/.test(change.inserted.text)) {
          error('expiry-date-formatter.only-digits-allowed');
          return false;
        }
      }

      // 4| -> 04|
      if (/^[2-9]$/.test(newText)) {
        newText = '0' + newText;
      }

      // 1|1|/5 -> 11|/5
      if (/^1[3-9].+$/.test(newText)) {
        error('expiry-date-formatter.invalid-month');
        return false;
      }

      // 15| -> 01/5|
      if (/^1[3-9]$/.test(newText)) {
        newText = '01' + this.delimiter + newText.slice(-1);
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

      const match = newText.match(/^(\d\d)(.)(\d\d?).*$/);
      if (match && match[2] === this.delimiter) {
        newText = match[1] + this.delimiter + match[3];
      }
    }

    change.proposed.text = newText;
    change.proposed.selectedRange = { start: newText.length, length: 0 };

    return true;
  }
}

export default ExpiryDateFormatter;
