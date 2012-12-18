{EventEmitter} = require 'events'
Caret = require './caret'

class FakeElement extends EventEmitter
  constructor: ->
    @_value = ''
    @_caret = new Caret(this)

  caret: (caret) ->
    if arguments.length is 1
      if typeof caret.start isnt 'number' or typeof caret.end isnt 'number'
        throw new Error("expected caret start and end to be numbers, got start=#{caret.start} (#{typeof caret.start}), end=#{caret.end} (#{typeof caret.end})")

      @_caret.start = Math.max(caret.start, 0)
      @_caret.end = Math.min(caret.end, @_value.length)
    else
      @_caret

  val: (value) ->
    if arguments.length is 1
      @_value = value
    else
      @_value

  trigger: (args...) ->
    @emit args...

module.exports = FakeElement
