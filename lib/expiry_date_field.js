var TextField           = require('./text_field');
var ExpiryDateFormatter = require('./expiry_date_formatter');

function ExpiryDateField(element) {
  TextField.call(this, element, new ExpiryDateFormatter());
}

ExpiryDateField.prototype = Object.create(TextField.prototype);

/**
 * Called by our superclass, used to post-process the text.
 *
 * @private
 */
ExpiryDateField.prototype.textFieldDidEndEditing = function() {
  var value = this.value();
  if (value) {
    return this.setText(this.formatter().format(value));
  }
};

module.exports = ExpiryDateField;
