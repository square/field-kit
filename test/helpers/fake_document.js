var FakeElement = require('./fake_element');
var FakeInput   = require('./fake_input');
var FakeWindow  = require('./fake_window');

function FakeDocument() {
  var html = this.createElement('html');
  html.appendChild(this.createElement('head'));
  html.appendChild(this.body = this.createElement('body'));
  this.documentElement = html;
  this.defaultView = new FakeWindow(this);
}

FakeDocument.prototype.activeElement = null;
FakeDocument.prototype.documentElement = null;
FakeDocument.prototype.body = null;

FakeDocument.prototype.createElement = function(tagName) {
  if (tagName === 'input') {
    return new FakeInput(this);
  } else {
    return new FakeElement(this, tagName);
  }
};

FakeDocument.prototype.toString = function() {
  return this.documentElement.toString();
};

module.exports = FakeDocument;
