TextField           = require './text_field'
ExpiryDateFormatter = require './expiry_date_formatter'

class ExpiryDateField extends TextField
  constructor: (element) ->
    super element, new ExpiryDateFormatter()

  # Internal: Called by our superclass, used to prefix single digit years with zero .ie '4' => '04.
  #
  # Returns nothing.
  textFieldDidEndEditing: ->
    newText = @formatter().format(@value())
    @setText newText
    @setSelectedRange start: newText.length, length: 0


module.exports = ExpiryDateField
