/* jshint esnext:true */

var TextField           = require('./text_field');
var ExpiryDateFormatter = require('./expiry_date_formatter');

class ExpiryDateField extends TextField {
  constructor(element) {
    super(element, new ExpiryDateFormatter());
  }

  /**
   * Called by our superclass, used to post-process the text.
   *
   * @private
   */
  textFieldDidEndEditing() {
    var value = this.value();
    if (value) {
      return this.setText(this.formatter().format(value));
    }
  }
}

module.exports = ExpiryDateField;
