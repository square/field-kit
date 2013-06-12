Caret  = require './caret'
events = require './events'

class WrappedFakeElements
  _elements: null
  _data: null
  _events: null

  constructor: (elements) ->
    @_elements = elements.slice()
    @_data = {}
    @_events = {}

  caret: (caret) ->
    @_caret ||= new Caret(@_elements[0])

    if arguments.length is 1
      if typeof caret.start isnt 'number' or typeof caret.end isnt 'number'
        throw new Error("expected caret start and end to be numbers, got start=#{caret.start} (#{typeof caret.start}), end=#{caret.end} (#{typeof caret.end})")

      @_caret.start = Math.max(caret.start, 0)
      @_caret.end = Math.min(caret.end, @val().length)
    else
      @_caret

  data: (key, value) ->
    if arguments.length is 1
      @_data[key]
    else
      @_data[key] = value

  val: (value) ->
    if arguments.length is 1
      @_elements[0].setAttribute 'value', value
    else
      @_elements[0].getAttribute 'value'

  each: (iterator) ->
    for element, i in @_elements
      iterator.call element, i, element
    return this

  trigger: (args...) ->
    @each (_, element) ->
      element.emit args...

  on: (type, callback) ->
    @each (_, element) ->
      events.add element, type, callback

  off: (type, callback) ->
    @each (_, element) ->
      events.remove element, type, callback

  get: (index) ->
    @_elements[index]

  attr: (attr, value=null) ->
    if arguments.length is 1
      return @_elements[0]?.getAttribute attr
    else
      element.setAttribute attr, value for element in @_elements
      return this

  blur: ->
    @_elements[0]?.blur()

  focus: ->
    @_elements[0]?.focus()

  select: ->
    @_caret.start = 0
    @_caret.end = @val().length

module.exports = WrappedFakeElements
