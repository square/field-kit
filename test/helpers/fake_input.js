var FakeElement = require('./fake_element');

function attr(constructor, name) {
  Object.defineProperty(constructor.prototype, name, {
    get: function() {
      return this.getAttribute(name);
    },

    set: function(value) {
      this.setAttribute(name, value);
    }
  });
}

function FakeInput(ownerDocument, type) {
  FakeElement.call(this, ownerDocument, 'input');
  this.type = type || 'text';
  this.value = '';
}

FakeInput.prototype = Object.create(FakeElement.prototype);

FakeInput.prototype.selfClosing = true;

attr(FakeInput, 'value');
attr(FakeInput, 'type');

Object.defineProperties(FakeInput.prototype, {
  selectionStart: {
    get: function() {
      return this._selectionStart;
    },

    set: function(selectionStart) {
      if (selectionStart < 0) {
        selectionStart = 0;
      }
      if (selectionStart > this.value.length) {
        selectionStart = this.value.length;
      }
      this._selectionStart = selectionStart;
    }
  },

  selectionEnd: {
    get: function() {
      return this._selectionEnd;
    },

    set: function(selectionEnd) {
      if (selectionEnd < 0) {
        selectionEnd = 0;
      }
      if (selectionEnd > this.value.length) {
        selectionEnd = this.value.length;
      }
      this._selectionEnd = selectionEnd;
    }
  }
});

module.exports = FakeInput;
