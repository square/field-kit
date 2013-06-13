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
      event.type = 'keydown'
      @element.trigger event.type, event
      if not event.isDefaultPrevented()
        event.type = 'keypress'
        if event.charCode
          @element.trigger event.type, event
      event.type = 'keyup'
      @element.trigger event.type, event

type = (keys...) ->
  new Type(keys...)

module.exports = { type }
