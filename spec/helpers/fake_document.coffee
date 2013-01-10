FakeElement = require './fake_element'
FakeInput = require './fake_input'

class FakeDocument
  activeElement: null
  documentElement: null
  body: null

  constructor: ->
    html = @createElement 'html'
    html.appendChild @createElement('head')
    html.appendChild @body = @createElement('body')
    @documentElement = html

  createElement: (tagName) ->
    switch tagName
      when 'input'
        new FakeInput(this)
      else
        new FakeElement(this, tagName)

  toString: ->
    @documentElement.toString()

module.exports = FakeDocument
