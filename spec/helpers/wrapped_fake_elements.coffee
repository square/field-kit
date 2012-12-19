{EventEmitter} = require 'events'
Caret = require './caret'

class WrappedFakeElements extends EventEmitter
  _elements: null

  constructor: (elements) ->
    @_elements = elements.slice()
    @_data = {}

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

  trigger: (args...) ->
    @emit args...

  get: (index) ->
    @_elements[index]

module.exports = WrappedFakeElements
