/* jshint esnext:true, unused:true, undef:true */

import FakeElement from './fake_element';
import FakeInput from './fake_input';
import FakeWindow from './fake_window';

class FakeDocument {
  constructor() {
    var html = this.createElement('html');
    html.appendChild(this.createElement('head'));
    html.appendChild(this.body = this.createElement('body'));
    this.documentElement = html;
    this.defaultView = new FakeWindow(this);
  }

  createElement(tagName) {
    if (tagName === 'input') {
      return new FakeInput(this);
    } else {
      return new FakeElement(this, tagName);
    }
  }

  toString() {
    return this.documentElement.toString();
  }
}

export default FakeDocument;
