USER_AGENTS =
  osx:
    chrome:
      latest: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17"
  windows:
    chrome:
      latest: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.60 Safari/537.17"
  android:
    chrome:
      latest: "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19"

class FakeNavigator
  constructor: ->
    @userAgent = USER_AGENTS.osx.chrome.latest

  Object.defineProperty @::, 'userAgent',
    get: ->
      @_userAgent

    set: (userAgent) ->
      if userAgent.match(/^\w+(\.\w+)*$/)
        lookup = USER_AGENTS
        for part in userAgent.split('.')
          lookup = lookup[part]
          throw new Error("unable to find user agent alias #{userAgent}") unless lookup
        userAgent = lookup
      @_userAgent = userAgent

class FakeWindow
  navigator: null

  constructor: (document) ->
    @document  = document
    @navigator = new FakeNavigator()

module.exports = FakeWindow
