FakeEvent = require './fake_event'
Caret = require './caret'
TextField = require '../../lib/text_field'
{buildInput} = require './builders'
{type} = require './typing'

class FieldExpectationBase
  into: (@field) ->
    this

  withFormatter: (formatter) ->
    @field.setFormatter formatter
    this

  willChange: (@currentDescription) ->
    this

  willNotChange: (@currentDescription) ->
    @to @currentDescription

  to: (@expectedDescription) ->
    @applyDescription()
    @proxyDelegate()
    @perform()
    @assert()
    this

  withError: (errorType) ->
    expect(@actualErrorType).toEqual(errorType)

  onOSX: ->
    @withUserAgent 'osx.chrome.latest'

  onWindows: ->
    @withUserAgent 'windows.chrome.latest'

  onAndroid: ->
    @withUserAgent 'android.chrome.latest'

  withUserAgent: (@userAgent) ->
    this

  applyDescription: ->
    { caret, affinity, value } = Caret.parseDescription @currentDescription
    @field.element.val value
    @field.element.caret caret
    @field.selectionAffinity = affinity

  proxyDelegate: ->
    currentDelegate = @field.delegate()
    @field.setDelegate
      textFieldDidFailToValidateChange: (textField, change, errorType) =>
        @actualErrorType = errorType
        currentDelegate?.textFieldDidFailToValidateChange?(change, errorType)
      textFieldDidFailToParseString: (textField, change, errorType) =>
        @actualErrorType = errorType
        currentDelegate?.textFieldDidFailToParseString?(change, errorType)

  assert: ->
    actual =
      Caret.printDescription
        caret: @field.element.caret()
        affinity: @field.selectionAffinity
        value: @field.element.val()

    expect(actual).toEqual(@expectedDescription)

  this::__defineGetter__ 'field', ->
    @_field ||= do =>
      input = buildInput()
      if @userAgent
        input.get(0).ownerDocument.defaultView.navigator.userAgent = @userAgent
      new TextField(input)

  this::__defineSetter__ 'field', (field) ->
    @_field = field

class ExpectThatTyping extends FieldExpectationBase
  constructor: (keys...) ->
    @keys = keys

  perform: ->
    @typeKeys()

  typeKeys: ->
    type(@keys...).into(@field)

class ExpectThatPasting extends FieldExpectationBase
  constructor: (text) ->
    @text = text

  perform: ->
    @paste()

  paste: ->
    event = FakeEvent.pasteEventWithData Text: @text
    @field.paste event

expectThatTyping = (keys...) ->
  new ExpectThatTyping(keys...)

expectThatPasting = (text) ->
  new ExpectThatPasting(text)

module.exports = { expectThatTyping, expectThatPasting }
