(function(exports, jQuery, document) {
  var getCaret, setCaret;

  if ('selectionStart' in document.createElement('input')) {
    getCaret = function(element) {
      return {
        start: element.selectionStart,
        end: element.selectionEnd
      };
    };
    setCaret = function(element, start, end) {
      element.selectionStart = start;
      element.selectionEnd = end;
    };
  } else if(document.selection) {
    getCaret = function(element) {
      var end, range, start, value;
      value = element.value;
      range = selection.createRange().duplicate();
      range.moveEnd('character', value.length);
      start = range.text === '' ? value.length : value.lastIndexOf(range.text);
      range = selection.createRange().duplicate();
      range.moveStart('character', -value.length);
      end = range.text.length;
      return {
        start: start,
        end: end
      };
    };
    setCaret = function(element, start, end) {
      var range;
      range = element.createTextRange();
      range.collapse(true);
      range.moveStart('character', start);
      range.moveEnd('character', end - start);
      range.select();
    };
  } else  {
    throw new Error('unknown input selection capabilities');
  }

  exports.Caret = { get: getCaret, set: setCaret };

  if (jQuery) {
    jQuery.fn.caret = function(start, end) {
      switch (arguments.length) {
        case 0:
          var result = getCaret(this[0]);
          result.text = this.val().substring(result.start, result.end);
          return result;

        case 1:
          if (typeof start === 'object') {
            // caret({ start: 3, end: 4 })
            end = start.end;
            start = start.start;
          } else {
            // caret(4)
            end = start;
          }
          break;
      }

      this.each(function() {
        setCaret(this, start, end);
      });
    };
  }
})(
  (typeof module !== 'undefined' && module.exports) ? module.exports : this,
  (typeof jQuery !== 'undefined') && jQuery,
  document
);
