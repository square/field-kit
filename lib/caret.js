'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var getCaret = undefined;
var setCaret = undefined;

if (!document) {
  throw new Error('Caret does not have access to document');
} else if ('selectionStart' in document.createElement('input')) {
  exports.getCaret = getCaret = function (element) {
    return {
      start: element.selectionStart,
      end: element.selectionEnd
    };
  };
  exports.setCaret = setCaret = function (element, start, end) {
    element.selectionStart = start;
    element.selectionEnd = end;
  };
} else if (document.selection) {
  exports.getCaret = getCaret = function (element) {
    var value = element.value;
    var range = selection.createRange().duplicate();

    range.moveEnd('character', value.length);

    var start = range.text === '' ? value.length : value.lastIndexOf(range.text);
    range = selection.createRange().duplicate();

    range.moveStart('character', -value.length);

    var end = range.text.length;
    return { start: start, end: end };
  };
  exports.setCaret = setCaret = function (element, start, end) {
    var range = element.createTextRange();
    range.collapse(true);
    range.moveStart('character', start);
    range.moveEnd('character', end - start);
    range.select();
  };
} else {
  throw new Error('Caret unknown input selection capabilities');
}

exports.getCaret = getCaret;
exports.setCaret = setCaret;