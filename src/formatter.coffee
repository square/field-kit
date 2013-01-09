class Formatter
  maximumLength: null

  format: (text) ->
    text ?= ''
    text = text.substring(0, @maximumLength) if @maximumLength?
    text

  parse: (text, error) ->
    text ?= ''
    text = text.substring(0, @maximumLength) if @maximumLength?
    text

  isChangeValid: (change, error) ->
    {selectedRange, text} = change.proposed
    if @maximumLength? and text.length > @maximumLength
      available = @maximumLength - (text.length - change.inserted.text.length)
      newText = change.current.text.substring(0, change.current.selectedRange.start)
      if available > 0
        newText += change.inserted.text.substring(0, available)
      newText += change.current.text.substring(change.current.selectedRange.start + change.current.selectedRange.length)
      truncatedLength = text.length - newText.length
      change.proposed.text = newText
      selectedRange.start -= truncatedLength
    return yes

module.exports = Formatter
