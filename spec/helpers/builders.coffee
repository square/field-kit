FakeDocument = require './fake_document'
FakeInput = require './fake_input'
FormattedTextField = require '../../lib/formatted_text_field'
PassthroughFormatter = require './passthrough_formatter'
WrappedFakeElements = require './wrapped_fake_elements'

buildField = ->
  document = new FakeDocument()
  input = new FakeInput(document)
  document.body.appendChild(input)
  wrapper = new WrappedFakeElements([input])
  field = new FormattedTextField(wrapper)
  field.formatter = new PassthroughFormatter()
  return field

module.exports = { buildField }
