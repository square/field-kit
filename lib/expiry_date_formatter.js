/*! jshint esnext:true, undef:true, unused:true */

import DelimitedTextFormatter from './delimited_text_formatter';
import { zpad2 } from './utils';

/**
 * @function interpretTwoDigitYear
 *
 * Give this function a 2 digit year it'll return with 4.
 *
 * ### Example
 *     interpretTwoDigitYear(15);
 *     // => 2015
 *     interpretTwoDigitYear(97);
 *     // => 1997
 * @param {Number} year
 * @return {Number}
 */
function interpretTwoDigitYear(year) {
  var thisYear = new Date().getFullYear();
  var thisCentury = thisYear - (thisYear % 100);
  var centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort(function(a, b) {
    return Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b));
  });
  return year + centuries[0];
}

/**
 * - extends [DelimitedTextFormatter](delimited_text_formatter.md)
 *
 * @class ExpiryDateFormatter
 * @extends DelimitedTextFormatter
 * @public
 */
class ExpiryDateFormatter extends DelimitedTextFormatter {
  /**
   * Sets delimiter to `'/'` and max length to 5.
   *
   * @constructor
   */
  constructor() {
    super('/');
    this.maximumLength = 5;
  }

  /**
   * @method hasDelimiterAtIndex
   *
   * @param {Number} index
   * @return {Boolean}
   * @public
   */
  hasDelimiterAtIndex(index) {
    return index === 2;
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
    if (!value) { return ''; }

    var month = value.month;
    var year = value.year;
    year = year % 100;

    return super(zpad2(month) + zpad2(year));
  }

  /**
   * @method parse
   *
   * Parses the given text
   *
   * @param {String} text
   * @param {Function(String)} error
   * @return {?Object} { month: month, year: year }
   * @public
   */
  parse(text, error) {
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
  }
}

export default ExpiryDateFormatter;
