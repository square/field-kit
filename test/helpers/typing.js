/* jshint undef:true, node:true */

var FakeEvent = require('./fake_event');
var WrappedFakeElements = require('./wrapped_fake_elements');
var bind = require('./function/').bind;

function Type(keys) {
  this.keys = keys;
}

Type.prototype.into = function(element) {
  if (element.element instanceof WrappedFakeElements) {
    element = element.element;
  }
  this.element = element;
  this.perform();
  return this;
};

Type.prototype.perform = function() {
  FakeEvent.eventsForKeys(this.keys).forEach(bind(function(event) {
    this.element.trigger('keydown', event);
    if (shouldFireKeypress(this.element, event)) {
      event.type = 'keypress';
      this.element.trigger('keypress', event);
    }
    this.element.trigger('keyup', event);
  }, this));
};

function shouldFireKeypress(element, keyDownEvent) {
  var document = element.get(0).ownerDocument;
  var window = document.defaultView;
  return !keyDownEvent.isDefaultPrevented() ||
    window.navigator.FK_firesKeyPressWhenKeydownPrevented;
}

function type() {
  return new Type([].slice.call(arguments));
}

module.exports = { type: type };
