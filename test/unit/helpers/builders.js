/* jshint esnext:true, unused:true, undef:true */
/* global document */

import PassthroughFormatter from './passthrough_formatter';
import FieldKit from '../../../src';

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

  var input = options.input || buildInput(options);
  if (options.userAgent) {
    navigator.__defineGetter__('userAgent', function(){
      return options.userAgent;
    });
  }

  var field;
  if (options.formatter) {
    // formatter is specified, so use it as part of the constructor
    field = new textFieldClass(input, options.formatter);
  } else {
    // since a default formatter may be provided by the text field, use #setFormatter
    field = new textFieldClass(input);
    if (!field.formatter()) {
      field.setFormatter(new PassthroughFormatter());
    }
  }

  return field;
}

export function buildInput(options) {
  var currentInputs = document.getElementsByTagName('input');
  if (!options) {
    options = {};
  }

  for(var i = 0; i < currentInputs.length; i++) {
    currentInputs[i].parentNode.removeChild(currentInputs[i]);
  }
  var input = document.createElement('input');
  input.type = 'text';

  if (options.autocapitalize) input.setAttribute('autocapitalize', 'on');

  document.body.appendChild(input);
  return document.getElementsByTagName('input')[0];
}
