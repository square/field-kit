DEFAULT_SPACE_INDEXES = [3, 7, 11]
Object.freeze?(DEFAULT_SPACE_INDEXES)

class DefaultCardFormatter
  spaceIndexes: null

  constructor: ->
    @spaceIndexes = DEFAULT_SPACE_INDEXES

  format: (pan) ->
    return '' unless pan

    result = ''
    for char, i in pan.slice(0, 16)
      result += char
      result += ' ' if i in @spaceIndexes
    result

  parse: (text) ->
    return null unless text
    text.replace /[^\d]/g, ''

  isChangeValid: (change) ->
    newText = change.proposed.text

    if change.deleted.text is ' '
      newText = newText.substring(0, newText.length - 1)

    newText = @format @parse(newText)
    change.proposed.text = newText
    change.proposed.caret = start: newText.length, end: newText.length
    return yes

if module?
  module.exports = DefaultCardFormatter
else
  @DefaultCardFormatter = DefaultCardFormatter
