FakeDocument = require './fake_document'
FakeInput = require './fake_input'
TextField = require '../../lib/text_field'
PassthroughFormatter = require './passthrough_formatter'
WrappedFakeElements = require './wrapped_fake_elements'

buildField = (textFieldClass=TextField) ->
  document = new FakeDocument()
  input = new FakeInput(document)
  document.body.appendChild(input)
  wrapper = new WrappedFakeElements([input])
  field = new textFieldClass(wrapper)
  field.setFormatter new PassthroughFormatter() unless field.formatter()?
  return field

module.exports = { buildField }
