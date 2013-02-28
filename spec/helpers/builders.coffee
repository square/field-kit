FakeDocument = require './fake_document'
FakeInput = require './fake_input'
TextField = require '../../lib/text_field'
PassthroughFormatter = require './passthrough_formatter'
WrappedFakeElements = require './wrapped_fake_elements'

buildField = (textFieldClass=TextField, options={}) ->
  if arguments.length is 1
    if typeof textFieldClass isnt 'function'
      options = textFieldClass
      textFieldClass = TextField

  wrapper = buildInput()

  if options.formatter
    # formatter is specified, so use it as part of the constructor
    field = new textFieldClass(wrapper, options.formatter)
  else
    # since a default formatter may be provided by the text field, use #setFormatter
    field = new textFieldClass(wrapper)
    field.setFormatter new PassthroughFormatter() unless field.formatter()?

  return field

buildInput = (document=new FakeDocument()) ->
  input = new FakeInput(document)
  document.body.appendChild(input)
  return new WrappedFakeElements([input])

module.exports = { buildField, buildInput }
