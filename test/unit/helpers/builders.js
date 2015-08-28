import PassthroughFormatter from './passthrough_formatter';
import FieldKit from '../../../src';
import { setCaret } from '../../../src/caret';

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

  // This is necessary because of a Chrome "feature" where it won't do any focusing
  // or blurring if the browser window not in focus itself. Otherwise running Karma
  // testing in the background is impossible.
  if (field) {
    let hasFocus = false;

    field.hasFocus = () => hasFocus;

    field.element.focus = function() {
      hasFocus = true;
      field.element.dispatchEvent(new UIEvent('focus'));
    };

    field.element.blur = function() {
      hasFocus = false;
      field.element.dispatchEvent(new UIEvent('blur'));
    };
  }

  return field;
}

export function buildInput(options) {
  var currentInputs = document.getElementsByTagName('input');
  if (!options) {
    options = {};
  }

  for (var i = 0; i < currentInputs.length; i++) {
    currentInputs[i].parentNode.removeChild(currentInputs[i]);
  }
  var input = document.createElement('input');
  input.type = 'text';

  var value = options.value;
  if (value) {
    input.value = value;
    // Many tests assume that when creating a new input and setting the value
    // that the caret will be placed after the text. This is not the case in
    // Firefox, so we set it that way here to normalize the behavior.
    setCaret(input, value.length, value.length);
  }

  if (options.autocapitalize) {
    input.setAttribute('autocapitalize', 'on');
  }

  document.body.appendChild(input);
  return document.getElementsByTagName('input')[0];
}
