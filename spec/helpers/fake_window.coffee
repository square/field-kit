NAVIGATORS =
  'osx.chrome.latest':
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17"
    firesKeyPressWithoutCharCode: no
    firesKeyPressWhenKeydownPrevented: no
  'windows.chrome.latest':
    userAgent: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.60 Safari/537.17"
    firesKeyPressWithoutCharCode: no
    firesKeyPressWhenKeydownPrevented: no
  'android.chrome.latest':
    userAgent: "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"
    firesKeyPressWithoutCharCode: no
    firesKeyPressWhenKeydownPrevented: no
  'osx.firefox.v24':
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0"
    firesKeyPressWithoutCharCode: yes
    firesKeyPressWhenKeydownPrevented: yes

class FakeNavigator
  constructor: ->
    @userAgent = 'osx.chrome.latest'

  Object.defineProperty this::, 'userAgent',
    get: ->
      @_userAgent

    set: (userAgent) ->
      if userAgent.match(/^\w+(\.\w+)*$/)
        info = NAVIGATORS[userAgent]
        throw new Error("unable to find user agent alias #{userAgent}") unless info

        userAgent = info.userAgent
        for own key, value of info when key isnt 'userAgent'
          this["FK_#{key}"] = value

      @_userAgent = userAgent

class FakeWindow
  navigator: null

  constructor: (document) ->
    @document  = document
    @navigator = new FakeNavigator()

module.exports = FakeWindow
