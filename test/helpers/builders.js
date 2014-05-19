/* jshint esnext:true, unused:true, undef:true */
/* global FieldKit */

import FakeDocument from './fake_document';
import FakeInput from './fake_input';
import PassthroughFormatter from './passthrough_formatter';
import WrappedFakeElements from './wrapped_fake_elements';

export function buildField(textFieldClass, options) {
  if (!textFieldClass) {
    textFieldClass = FieldKit.TextField;
  }
  if (!options) {
    options = {};
  }

  if (arguments.length === 1) {
    if (typeof textFieldClass !== 'function') {
      options = textFieldClass;
      textFieldClass = FieldKit.TextField;
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

export function buildInput(document) {
  if (!document) {
    document = new FakeDocument();
  }
  var input = new FakeInput(document);
  document.body.appendChild(input);
  return new WrappedFakeElements([input]);
}
