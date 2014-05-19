/* jshint esnext:true, undef:true, unused:true */

import AmexCardFormatter from './amex_card_formatter';
import DefaultCardFormatter from './default_card_formatter';
import { determineCardType, AMEX } from './card_utils';

class AdaptiveCardFormatter {
  constructor() {
    this.amexCardFormatter = new AmexCardFormatter();
    this.defaultCardFormatter = new DefaultCardFormatter();
    this.formatter = this.defaultCardFormatter;
  }

  format(pan) {
    return this._formatterForPan(pan).format(pan);
  }

  parse(text, error) {
    return this.formatter.parse(text, error);
  }

  isChangeValid(change) {
    this.formatter = this._formatterForPan(change.proposed.text);
    return this.formatter.isChangeValid(change);
  }

  _formatterForPan(pan) {
    if (determineCardType(pan.replace(/[^\d]+/g, '')) === AMEX) {
      return this.amexCardFormatter;
    } else {
      return this.defaultCardFormatter;
    }
  }
}

export default AdaptiveCardFormatter;
