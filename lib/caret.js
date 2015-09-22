'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = installCaret;

function installCaret() {
  var _document = arguments.length <= 0 || arguments[0] === undefined ? document : arguments[0];

  var getCaret = undefined;
  var setCaret = undefined;

  if (!_document) {
    throw new Error('Caret does not have access to document');
  } else if ('selectionStart' in _document.createElement('input')) {
    getCaret = function (element) {
      return {
        start: element.selectionStart,
        end: element.selectionEnd
      };
    };
    setCaret = function (element, start, end) {
      element.selectionStart = start;
      element.selectionEnd = end;
    };
  } else if (_document.selection) {
    getCaret = function (element) {
      var selection = _document.selection;
      var value = element.value;
      var range = selection.createRange().duplicate();

      range.moveEnd('character', value.length);

      var start = range.text === '' ? value.length : value.lastIndexOf(range.text);
      range = selection.createRange().duplicate();

      range.moveStart('character', -value.length);

      var end = range.text.length;
      return { start: start, end: end };
    };
    setCaret = function (element, start, end) {
      var range = element.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    };
  } else {
    throw new Error('Caret unknown input selection capabilities');
  }

  return { getCaret: getCaret, setCaret: setCaret };
}

;
module.exports = exports['default'];