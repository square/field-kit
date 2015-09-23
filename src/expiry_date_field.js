import TextField from './text_field';
import ExpiryDateFormatter from './expiry_date_formatter';

/**
 * Adds a default formatter for expiration dates.
 *
 * @extends TextField
 */
class ExpiryDateField extends TextField {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    super(element, new ExpiryDateFormatter());
  }

  /**
   * Called by our superclass, used to post-process the text.
   *
   * @private
   */
  textFieldDidEndEditing() {
    const value = this.value();
    if (value) {
      this.setText(this.formatter().format(value));
    }
  }
}

export default ExpiryDateField;
