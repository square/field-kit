/* jshint esnext:true, unused:true, undef:true */

var hasOwnProp = Object.prototype.hasOwnProperty;

class FakeElement {
  constructor(ownerDocument, tagName) {
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

    this.attributes = Object.create(null);
    this.childNodes = [];
    this.style = Object.create(null);

    this.parentNode = null;
    this.selfClosing = false;

    this._eventListeners = Object.create(null);
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  setAttribute(name, value) {
    this.attributes[name] = '' + value;
  }

  insertBefore(newChild, referenceChild) {
    this.reparent(newChild, () => {
      var referenceIndex = this.childNodes.indexOf(referenceChild);
      this.childNodes.splice(referenceIndex, 0, [newChild]);
    });
  }

  appendChild(child) {
    this.reparent(child, () => this.childNodes.push(child));
  }

  reparent(child, callback) {
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
  }

  get nextSibling() {
    var siblingsAndSelf = this.parentNode.childNodes;
    var myIndex = siblingsAndSelf.indexOf(this);
    return siblingsAndSelf[myIndex+1];
  }

  get previousSibling() {
    var siblingsAndSelf = this.parentNode.childNodes;
    var myIndex = siblingsAndSelf.indexOf(this);
    return siblingsAndSelf[myIndex-1];
  }

  blur() {
    if (this.ownerDocument.activeElement === this) {
      this.ownerDocument.activeElement = null;
      this.emit('blur');
      if (!this.ownerDocument.defaultView.navigator.FK_noSupportForFocusInOut) {
        this.emit('focusout');
      }
    }
  }

  focus() {
    this.ownerDocument.activeElement = this;
    this.emit('focus');
    if (!this.ownerDocument.defaultView.navigator.FK_noSupportForFocusInOut) {
      this.emit('focusin');
    }
  }

  dispatchEvent(event) {
    if (event.type === 'keypress') {
      var window = this.ownerDocument.defaultView;
      if (event.charCode === 0 && !window.navigator.FK_firesKeyPressWithoutCharCode) {
        return;
      }
    }
    this.emit(event.type, event);
  }

  emit(event, ...data) {
    this._listenersForEvent(event).forEach(function(listener) {
      listener(...data);
    });
  }

  addEventListener(type, callback/*, capture*/) {
    this._listenersForEvent(type).push(callback);
  }

  removeEventListener(type, callback/*, capture*/) {
    var listeners = this._listenersForEvent(type);
    var index = listeners.indexOf(callback);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }

  _listenersForEvent(type) {
    var listeners = this._eventListeners[type];
    if (!listeners) {
      listeners = this._eventListeners[type] = [];
    }
    return listeners;
  }

  toString() {
    var result = '<' + this.tagName;
    for (var name in this.attributes) {
      if (hasOwnProp.call(this.attributes, name)) {
        result += ' ' + name + '="' + this.attributes[name] + '"';
      }
    }

    if (this.selfClosing) {
      result += ' />';
    } else {
      result += '>';
      for (var i = 0, l = this.childNodes.length; i < l; i++) {
        result += this.childNodes[i].toString();
      }
      result += '</' + this.tagName + '>';
    }

    return result;
  }
}

export default FakeElement;
