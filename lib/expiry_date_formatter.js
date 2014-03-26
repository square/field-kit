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
