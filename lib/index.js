/*! jshint esnext:true, undef:true, unused:true */
/* global define, module, window */

import AdaptiveCardFormatter from './adaptive_card_formatter';
import AmexCardFormatter from './amex_card_formatter';
import CardTextField from './card_text_field';
import { AMEX, DISCOVER, VISA, MASTERCARD, determineCardType, luhnCheck, validCardLength } from './card_utils';
import DefaultCardFormatter from './default_card_formatter';
import DelimitedTextFormatter from './delimited_text_formatter';
import ExpiryDateField from './expiry_date_field';
import ExpiryDateFormatter from './expiry_date_formatter';
import Formatter from './formatter';
import NumberFormatter from './number_formatter';
import PhoneFormatter from './phone_formatter';
import SocialSecurityNumberFormatter from './social_security_number_formatter';
import TextField from './text_field';
import UndoManager from './undo_manager';

/**
 * @namespace FieldKit
 * @readonly
 */
var FieldKit = {
  AdaptiveCardFormatter: AdaptiveCardFormatter,
  AmexCardFormatter: AmexCardFormatter,
  CardTextField: CardTextField,
  CardUtils: {
    AMEX: AMEX,
    DISCOVER: DISCOVER,
    VISA: VISA,
    MASTERCARD: MASTERCARD,
    determineCardType: determineCardType,
    luhnCheck: luhnCheck,
    validCardLength: validCardLength
  },
  DefaultCardFormatter: DefaultCardFormatter,
  DelimitedTextFormatter: DelimitedTextFormatter,
  ExpiryDateField: ExpiryDateField,
  ExpiryDateFormatter: ExpiryDateFormatter,
  Formatter: Formatter,
  NumberFormatter: NumberFormatter,
  PhoneFormatter: PhoneFormatter,
  SocialSecurityNumberFormatter: SocialSecurityNumberFormatter,
  TextField: TextField,
  UndoManager: UndoManager
};

if (typeof define === 'function' && define.amd) {
  define(function() { return FieldKit; });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = FieldKit;
} else if (typeof window !== 'undefined') {
  window.FieldKit = FieldKit;
} else {
  this.FieldKit = FieldKit;
}
