var FakeEvent = require('./fake_event');
var Caret = require('./caret');
var TextField = require('../../lib/text_field');
var buildInput = require('./builders').buildInput;
var type = require('./typing').type;

function FieldExpectationBase() {}

FieldExpectationBase.prototype.into = function(field) {
  this.field = field;
  return this;
};

FieldExpectationBase.prototype.withFormatter = function(formatter) {
  this.field.setFormatter(formatter);
  return this;
};

FieldExpectationBase.prototype.willChange = function(currentDescription) {
  this.currentDescription = currentDescription;
  return this;
};

FieldExpectationBase.prototype.willNotChange = function(currentDescription) {
  this.currentDescription = currentDescription;
  return this.to(currentDescription);
};

FieldExpectationBase.prototype.to = function(expectedDescription) {
  this.expectedDescription = expectedDescription;
  this.applyDescription();
  this.proxyDelegate();
  this.perform();
  this.assert();
  return this;
};

FieldExpectationBase.prototype.withError = function(errorType) {
  expect(this.actualErrorType).to.equal(errorType);
};

FieldExpectationBase.prototype.onOSX = function() {
  return this.withUserAgent('osx.chrome.latest');
};

FieldExpectationBase.prototype.onWindows = function() {
  return this.withUserAgent('windows.chrome.latest');
};

FieldExpectationBase.prototype.onAndroid = function() {
  return this.withUserAgent('android.chrome.latest');
};

FieldExpectationBase.prototype.withUserAgent = function(userAgent) {
  this.userAgent = userAgent;
  return this;
};

FieldExpectationBase.prototype.applyDescription = function() {
  var description = Caret.parseDescription(this.currentDescription);
  var caret = description.caret;
  var affinity = description.affinity;
  var value = description.value;
  this.field.element.val(value);
  this.field.element.caret(caret);
  this.field.selectionAffinity = affinity;
};

FieldExpectationBase.prototype.proxyDelegate = function() {
  var currentDelegate = this.field.delegate();
  this.field.setDelegate({
    textFieldDidFailToValidateChange: function(textField, change, errorType) {
      this.actualErrorType = errorType;
      if (currentDelegate && typeof currentDelegate.textFieldDidFailToValidateChange === 'function') {
        currentDelegate.textFieldDidFailToValidateChange(change, errorType);
      }
    }.bind(this),

    textFieldDidFailToParseString: function(textField, change, errorType) {
      this.actualErrorType = errorType;
      if (currentDelegate && typeof currentDelegate.textFieldDidFailToParseString === 'function') {
        currentDelegate.textFieldDidFailToParseString(change, errorType);
      }
    }.bind(this)
  });
};

FieldExpectationBase.prototype.assert = function() {
  var actual =
    Caret.printDescription({
      caret: this.field.element.caret(),
      affinity: this.field.selectionAffinity,
      value: this.field.element.val()
    });

  expect(actual).to.equal(this.expectedDescription);
};

Object.defineProperty(FieldExpectationBase.prototype, 'field', {
  get: function() {
    if (!this._field) {
      var input = buildInput();
      if (this.userAgent) {
        input.get(0).ownerDocument.defaultView.navigator.userAgent = this.userAgent;
      }
      this._field = new TextField(input);
    }
    return this._field;
  },

  set: function(field) {
    this._field = field;
  }
});


function ExpectThatTyping(keys) {
  FieldExpectationBase.call(this);
  this.keys = keys;
}

ExpectThatTyping.prototype = Object.create(FieldExpectationBase.prototype);

ExpectThatTyping.prototype.perform = function() {
  this.typeKeys();
};

ExpectThatTyping.prototype.typeKeys = function() {
  type.apply(null, this.keys).into(this.field);
};


function ExpectThatPasting(text) {
  FieldExpectationBase.call(this);
  this.text = text;
}

ExpectThatPasting.prototype = Object.create(FieldExpectationBase.prototype);

ExpectThatPasting.prototype.perform = function() {
  this.paste();
};

ExpectThatPasting.prototype.paste = function() {
  var event = FakeEvent.pasteEventWithData({Text: this.text});
  this.field.paste(event);
};


function ExpectThatLeaving(field) {
  FieldExpectationBase.call(this);
  this.field = field;
}

ExpectThatLeaving.prototype = Object.create(FieldExpectationBase.prototype);

ExpectThatLeaving.prototype.perform = function() {
  this.field.element.focus();
  this.field.element.blur();
};

function expectThatTyping() {
  return new ExpectThatTyping([].slice.call(arguments));
}

function expectThatPasting(text) {
  return new ExpectThatPasting(text);
}

function expectThatLeaving(field) {
  return new ExpectThatLeaving(field);
}

module.exports = {
  expectThatTyping: expectThatTyping,
  expectThatPasting: expectThatPasting,
  expectThatLeaving: expectThatLeaving
};
