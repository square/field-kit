TextField           = require './text_field'
ExpiryDateFormatter = require './expiry_date_formatter'

class ExpiryDateField extends TextField
  constructor: (element) ->
    super element, new ExpiryDateFormatter()

  # Internal: Called by our superclass, used to post-process the text.
  #
  # Returns nothing.
  textFieldDidEndEditing: ->
    value = @value()
    if value
      @setText @formatter().format(value)

module.exports = ExpiryDateField
