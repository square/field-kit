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
    {caret, text} = change.proposed
    if @maximumLength? and text.length > @maximumLength
      available = @maximumLength - (text.length - change.inserted.text.length)
      newText = change.current.text.substring(0, change.current.caret.start)
      if available > 0
        newText += change.inserted.text.substring(0, available)
      newText += change.current.text.substring(change.current.caret.end)
      truncatedLength = text.length - newText.length
      change.proposed.text = newText
      caret.start -= truncatedLength
      caret.end -= truncatedLength
    return yes

module.exports = Formatter
