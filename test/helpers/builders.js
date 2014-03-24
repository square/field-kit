/* jshint undef:true, node:true */

var FakeDocument = require('./fake_document');
var FakeInput = require('./fake_input');
var TextField = require('../../lib/text_field');
var PassthroughFormatter = require('./passthrough_formatter');
var WrappedFakeElements = require('./wrapped_fake_elements');

function buildField(textFieldClass, options) {
  if (!textFieldClass) {
    textFieldClass = TextField;
  }
  if (!options) {
    options = {};
  }

  if (arguments.length === 1) {
    if (typeof textFieldClass !== 'function') {
      options = textFieldClass;
      textFieldClass = TextField;
    }
  }

  var wrapper = options.input || buildInput();

  var field;
  if (options.formatter) {
    // formatter is specified, so use it as part of the constructor
    field = new textFieldClass(wrapper, options.formatter);
  } else {
    // since a default formatter may be provided by the text field, use #setFormatter
    field = new textFieldClass(wrapper);
    if (!field.formatter()) {
      field.setFormatter(new PassthroughFormatter());
    }
  }

  return field;
}

function buildInput(document) {
  if (!document) {
    document = new FakeDocument();
  }
  var input = new FakeInput(document);
  document.body.appendChild(input);
  return new WrappedFakeElements([input]);
}

module.exports = {
  buildField: buildField,
  buildInput: buildInput
};
