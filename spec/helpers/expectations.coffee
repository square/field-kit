FakeEvent = require './fake_event'
Caret = require './caret'
{buildField} = require './builders'

class ExpectThatTyping
  constructor: (keys...) ->
    @keys = keys

  into: (@field) ->
    this

  withFormatter: (formatter) ->
    @field.formatter = formatter
    this

  willChange: (@currentDescription) ->
    this

  willNotChange: (@currentDescription) ->
    @to @currentDescription

  to: (@expectedDescription) ->
    @applyDescription()
    @typeKeys()
    @assert()

  applyDescription: ->
    { caret, direction, value } = Caret.parseDescription @currentDescription
    @field.element.val value
    @field.element.caret caret
    @field.selectionDirection = direction

  typeKeys: ->
    for key in @keys
      event = FakeEvent.withKey(key)
      event.type = 'keydown'
      @field.keyDown event
      if not event.isDefaultPrevented()
        event.type = 'keypress'
        if event.charCode
          @field.keyPress event
        event.type = 'keyup'
        @field.keyUp event

  assert: ->
    actual = Caret.printDescription
               caret: @field.element.caret()
               direction: @field.selectionDirection
               value: @field.element.val()

    expect(actual).toEqual(@expectedDescription)

  @::__defineGetter__ 'field', ->
    @_field ||= buildField()

  @::__defineSetter__ 'field', (field) ->
    @_field = field

expectThatTyping = (keys...) ->
  new ExpectThatTyping(keys...)

module.exports = { expectThatTyping }
