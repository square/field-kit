/* jshint esnext:true, unused:true, undef:true */

var NAVIGATORS = {
  'osx.chrome.latest': {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17',
    firesKeyPressWithoutCharCode: false,
    firesKeyPressWhenKeydownPrevented: false
  },
  'windows.chrome.latest': {
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.60 Safari/537.17',
    firesKeyPressWithoutCharCode: false,
    firesKeyPressWhenKeydownPrevented: false
  },
  'android.chrome.latest': {
    userAgent: 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
    firesKeyPressWithoutCharCode: false,
    firesKeyPressWhenKeydownPrevented: false
  },
  'osx.firefox.v24': {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
    firesKeyPressWithoutCharCode: true,
    firesKeyPressWhenKeydownPrevented: true
  }
};

class FakeNavigator {
  constructor() {
    this.userAgent = 'osx.chrome.latest';
  }

  get userAgent() {
    return this._userAgent;
  }

  set userAgent(userAgent) {
    if (userAgent.match(/^\w+(\.\w+)*$/)) {
      var info = NAVIGATORS[userAgent];
      if (!info) {
        throw new Error('unable to find user agent alias '+userAgent);
      }

      userAgent = info.userAgent;
      for (var key in info) {
        if (info.hasOwnProperty(key) && key !== 'userAgent') {
          this['FK_'+key] = info[key];
        }
      }
    }

    this._userAgent = userAgent;
  }
}

class FakeWindow {
  constructor(document) {
    this.document = document;
    this.navigator = new FakeNavigator();
  }
}

export default FakeWindow;
