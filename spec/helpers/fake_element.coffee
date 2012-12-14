{EventEmitter} = require 'events'
Caret = require './caret'

class FakeElement extends EventEmitter
  constructor: ->
    @_value = ''
    @_caret = new Caret(this)

  caret: (caret) ->
    if arguments.length is 1
      throw new Error("NOOOOO") if isNaN(caret.start)
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
