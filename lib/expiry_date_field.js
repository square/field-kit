/*! jshint esnext:true, undef:true, unused:true */

import TextField from './text_field';
import ExpiryDateFormatter from './expiry_date_formatter';

/**
 * - extends [TextField](text_field.md)
 *
 * Adds a default formatter for experation dates.
 *
 * @class ExpiryDateField
 * @extends TextField
 * @public
 */
class ExpiryDateField extends TextField {
  /**
   * Sets the formatter to ExpiryDateFormatter
   *
   * @param {DOMElement} element
   */
  constructor(element) {
    super(element, new ExpiryDateFormatter());
  }

  /**
   * @method textFieldDidEndEditing
   *
   * Called by our superclass, used to post-process the text.
   *
   * @private
   */
  textFieldDidEndEditing() {
    var value = this.value();
    if (value) {
      this.setText(this.formatter().format(value));
    }
  }
}

export default ExpiryDateField;
