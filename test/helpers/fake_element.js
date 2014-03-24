var EventEmitter = require('events').EventEmitter;

function FakeElement(ownerDocument, tagName) {
  EventEmitter.call(this);

  if (ownerDocument) {
    this.ownerDocument = ownerDocument;
  } else {
    throw new Error("cannot create elements without an owner document");
  }

  if (tagName) {
    this.tagName = tagName;
  } else {
    throw new Error("cannot create elements without a tag name");
  }

  this.attributes = {};
  this.childNodes = [];
  this.style = {};
}

FakeElement.prototype = Object.create(EventEmitter.prototype);

FakeElement.prototype.tagName = null;
FakeElement.prototype.attributes = null;
FakeElement.prototype.childNodes = null;
FakeElement.prototype.parentNode = null;
FakeElement.prototype.style = null;
FakeElement.prototype.selfClosing = false;

FakeElement.prototype.getAttribute = function(name) {
  return this.attributes[name];
};

FakeElement.prototype.setAttribute = function(name, value) {
  this.attributes[name] = ''+value;
};

FakeElement.prototype.insertBefore = function(newChild, referenceChild) {
  this.reparent(newChild, function() {
    var referenceIndex = this.childNodes.indexOf(referenceChild);
    this.childNodes.splice(referenceIndex, 0, [newChild]);
  }.bind(this));
};

FakeElement.prototype.appendChild = function(child) {
  this.reparent(child, function() {
    this.childNodes.push(child);
  }.bind(this));
};

FakeElement.prototype.reparent = function(child, callback) {
  if (child.ownerDocument !== this.ownerDocument) {
    throw new Error('cannot append child node from another document');
  }

  if (child.parentNode === this) {
    var index = this.childNodes.indexOf(child);
    this.childNodes.splice(index, 1);
  }

  if (child.parentNode) {
    child.parentNode.removeChild(child);
  }

  callback();

  child.parentNode = this;
};

Object.defineProperties(FakeElement.prototype, {
  nextSibling: {
    get: function() {
      var siblingsAndSelf = this.parentNode.childNodes;
      var myIndex = siblingsAndSelf.indexOf(this);
      return siblingsAndSelf[myIndex+1];
    }
  },

  previousSibling: {
    get: function() {
      var siblingsAndSelf = this.parentNode.childNodes;
      var myIndex = siblingsAndSelf.indexOf(this);
      return siblingsAndSelf[myIndex-1];
    }
  }
});

FakeElement.prototype.blur = function() {
  if (this.ownerDocument.activeElement === this) {
    this.ownerDocument.activeElement = null;
    this.emit('blur');
    this.emit('focusout');
  }
};

FakeElement.prototype.focus = function() {
  this.ownerDocument.activeElement = this;
  this.emit('focusin');
  this.emit('focus');
};

FakeElement.prototype.dispatchEvent = function(event) {
  if (event.type === 'keypress') {
    var window = this.ownerDocument.defaultView;
    if (event.charCode === 0 && !window.navigator.FK_firesKeyPressWithoutCharCode) {
      return;
    }
  }
  this.emit(event.type, event);
};

FakeElement.prototype.addEventListener = function(type, callback, capture) {
  this.addListener(type, callback);
};

FakeElement.prototype.removeEventListener = function(type, callback, capture) {
  this.removeListener(type, callback);
};

FakeElement.prototype.toString = function() {
  var result = '<'+this.tagName;
  for (var name in this.attributes) {
    if (this.attributes.hasOwnProperty(name)) {
      result += ' '+name+'="'+value+'"';
    }
  }

  if (this.selfClosing) {
    result += ' />';
  } else {
    result += '>';
    for (var i = 0, l = this.childNodes.length; i < l; i++) {
      result += this.childNodes[i].toString();
    }
    result += '</'+this.tagName+'>';
  }

  return result;
};

module.exports = FakeElement;
