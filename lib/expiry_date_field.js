'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _text_field = require('./text_field');

var _text_field2 = _interopRequireDefault(_text_field);

var _expiry_date_formatter = require('./expiry_date_formatter');

var _expiry_date_formatter2 = _interopRequireDefault(_expiry_date_formatter);

/**
 * Adds a default formatter for expiration dates.
 *
 * @extends TextField
 */

var ExpiryDateField = (function (_TextField) {
  _inherits(ExpiryDateField, _TextField);

  /**
   * @param {HTMLElement} element
   */

  function ExpiryDateField(element) {
    _classCallCheck(this, ExpiryDateField);

    _get(Object.getPrototypeOf(ExpiryDateField.prototype), 'constructor', this).call(this, element, new _expiry_date_formatter2['default']());
  }

  /**
   * Called by our superclass, used to post-process the text.
   *
   * @private
   */

  _createClass(ExpiryDateField, [{
    key: 'textFieldDidEndEditing',
    value: function textFieldDidEndEditing() {
      var value = this.value();
      if (value) {
        this.setText(this.formatter().format(value));
      }
    }
  }]);

  return ExpiryDateField;
})(_text_field2['default']);

exports['default'] = ExpiryDateField;
module.exports = exports['default'];