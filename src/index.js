import AdaptiveCardFormatter from './adaptive_card_formatter';
import AmexCardFormatter from './amex_card_formatter';
import CardTextField from './card_text_field';
import { AMEX, DISCOVER, VISA, MASTERCARD, determineCardType, luhnCheck, validCardLength } from './card_utils';
import DefaultCardFormatter from './default_card_formatter';
import DelimitedTextFormatter from './delimited_text_formatter';
import EmployerIdentificationNumberFormatter from './employer_identification_number_formatter';
import ExpiryDateField from './expiry_date_field';
import ExpiryDateFormatter from './expiry_date_formatter';
import Formatter from './formatter';
import NumberFormatter from './number_formatter';
import NumberFormatterSettingsFormatter from './number_formatter_settings_formatter';
import PhoneFormatter from './phone_formatter';
import SocialSecurityNumberFormatter from './social_security_number_formatter';
import TextField from './text_field';
import UndoManager from './undo_manager';

/**
 * @namespace FieldKit
 * @readonly
 */
module.exports = {
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
  EmployerIdentificationNumberFormatter: EmployerIdentificationNumberFormatter,
  ExpiryDateField: ExpiryDateField,
  ExpiryDateFormatter: ExpiryDateFormatter,
  Formatter: Formatter,
  NumberFormatter: NumberFormatter,
  NumberFormatterSettingsFormatter: NumberFormatterSettingsFormatter,
  PhoneFormatter: PhoneFormatter,
  SocialSecurityNumberFormatter: SocialSecurityNumberFormatter,
  TextField: TextField,
  UndoManager: UndoManager
};
