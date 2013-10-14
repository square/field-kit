FakeEvent = require './fake_event'
TextField = require '../../lib/text_field'

class Type
  constructor: (keys...) ->
    @keys = keys

  into: (element) ->
    if element instanceof TextField
      element = element.element
    @element = element
    @perform()
    return this

  perform: ->
    for event in FakeEvent.eventsForKeys(@keys...)
      @element.trigger 'keydown', event
      if shouldFireKeypress(@element, event)
        event.type = 'keypress'
        @element.trigger 'keypress', event
      @element.trigger 'keyup', event

shouldFireKeypress = (element, keyDownEvent) ->
  document = element.get(0).ownerDocument
  window   = document.defaultView
  not keyDownEvent.isDefaultPrevented() or
    window.navigator.FK_firesKeyPressWhenKeydownPrevented

type = (keys...) ->
  new Type(keys...)

module.exports = { type }
