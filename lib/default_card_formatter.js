/* jshint esnext:true, undef:true, unused:true */

import DelimitedTextFormatter from './delimited_text_formatter';
import { validCardLength, luhnCheck } from './card_utils';

class DefaultCardFormatter extends DelimitedTextFormatter {
  constructor() {
    super(' ');
  }

  hasDelimiterAtIndex(index) {
    return index === 4 || index === 9 || index === 14;
  }

  parse(text, error) {
    var value = this._valueFromText(text);
    if (typeof error === 'function') {
      if (!validCardLength(value)) {
        error('card-formatter.number-too-short');
      }
      if (!luhnCheck(value)) {
        error('card-formatter.invalid-number');
      }
    }
    return super(text, error);
  }

  _valueFromText(text) {
    return super((text || '').replace(/[^\d]/g, ''));
  }
}

DefaultCardFormatter.prototype.maximumLength = 16 + 3;

export default DefaultCardFormatter;
