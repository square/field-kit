var Caret  = require('./caret');
var events = require('./events');

function WrappedFakeElements(elements) {
  this._elements = elements.slice();
  this._data = {};
  this._events = {};
}

WrappedFakeElements.prototype._elements = null;
WrappedFakeElements.prototype._data = null;
WrappedFakeElements.prototype._events = null;

WrappedFakeElements.prototype.caret = function(caret) {
  if (!this._caret) {
    this._caret = new Caret(this._elements[0]);
  }

  if (arguments.length === 1) {
    if (typeof caret.start !== 'number' || typeof caret.end !== 'number') {
      throw new Error(
        'expected caret start and end to be numbers, got start='+caret.start+
        ' ('+typeof caret.start+'), end='+caret.end+' ('+typeof caret.end+')'
      );
    }

    this._caret.start = Math.max(caret.start, 0);
    this._caret.end = Math.min(caret.end, this.val().length);
  } else {
    return this._caret;
  }
};

WrappedFakeElements.prototype.data = function(key, value) {
  if (arguments.length === 1) {
    return this._data[key];
  } else {
    this._data[key] = value;
    return this;
  }
};

WrappedFakeElements.prototype.val = function(value) {
  if (arguments.length === 1) {
    this._elements[0].setAttribute('value', value);
    return this;
  } else {
    return this._elements[0].getAttribute('value');
  }
};

WrappedFakeElements.prototype.each = function(iterator) {
  for (var i = 0, l = this._elements.length; i < l; i++) {
    iterator.call(this._elements[i], i, this._elements[i]);
  }
  return this;
};

WrappedFakeElements.prototype.trigger = function(type, event) {
  if (typeof event === 'undefined' || event === null) {
    event = {};
  }
  event.type = type;
  return this.each(function(_, element) {
    element.dispatchEvent(event);
  });
};

WrappedFakeElements.prototype.on = function(type, callback) {
  return this.each(function(_, element) {
    events.add(element, type, callback);
  });
};

WrappedFakeElements.prototype.off = function(type, callback) {
  return this.each(function(_, element) {
    events.remove(element, type, callback);
  });
};

WrappedFakeElements.prototype.get = function(index) {
  return this._elements[index];
};

WrappedFakeElements.prototype.attr = function(attr, value) {
  if (arguments.length === 1) {
    return this._elements[0] && this._elements[0].getAttribute(attr);
  } else {
    return this.each(function(_, element) {
      element.setAttribute(attr, value);
    });
  }
};

WrappedFakeElements.prototype.blur = function() {
  return this._elements[0] && this._elements[0].blur();
};

WrappedFakeElements.prototype.focus = function() {
  return this._elements[0] && this._elements[0].focus();
};

WrappedFakeElements.prototype.select = function() {
  this._caret.start = 0;
  this._caret.end = this.val().length;
};

module.exports = WrappedFakeElements;
