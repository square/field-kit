(function() {
  var ExpiryDateField, ExpiryDateFormatter, TextField,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  TextField = require('./text_field');

  ExpiryDateFormatter = require('./expiry_date_formatter');

  ExpiryDateField = (function(_super) {
    __extends(ExpiryDateField, _super);

    function ExpiryDateField(element) {
      ExpiryDateField.__super__.constructor.call(this, element, new ExpiryDateFormatter());
    }

    ExpiryDateField.prototype.textFieldDidEndEditing = function() {
      var value;
      value = this.value();
      if (value) {
        return this.setText(this.formatter().format(value));
      }
    };

    return ExpiryDateField;

  })(TextField);

  module.exports = ExpiryDateField;

}).call(this);
