DEFAULT_SPACE_INDEXES = [4, 8, 12]
Object.freeze?(DEFAULT_SPACE_INDEXES)

class DefaultCardFormatter
  spaceIndexes: null
  cardLength: 16

  constructor: ->
    @spaceIndexes = DEFAULT_SPACE_INDEXES.slice()

  format: (pan) ->
    return '' unless pan

    result = ''
    for char, i in pan.slice(0, @cardLength)
      result += char
      result += ' ' if i+1 in @spaceIndexes
    result

  parse: (text) ->
    return null unless text
    text.replace /[^\d]/g, ''

  isChangeValid: (change) ->
    newText = change.proposed.text

    if change.deleted.text is ' '
      newText = newText.substring(0, newText.length - 1)

    caret = change.proposed.caret
    hasSelection = caret.start isnt caret.end
    startMovedLeft = caret.start < change.current.caret.start
    endMovedLeft = caret.end < change.current.caret.end

    for spaceIndex, i in @spaceIndexes
      if caret.start is spaceIndex + i
        if startMovedLeft
          caret.start--
        else
          caret.start++

    if hasSelection
      for spaceIndex, i in @spaceIndexes
        if caret.end is spaceIndex + i + 1
          if startMovedLeft or endMovedLeft
            caret.end--
          else
            caret.end++
    else
      caret.end = caret.start

    newText = @format @parse(newText)
    change.proposed.text = newText
    return yes

if module?
  module.exports = DefaultCardFormatter
else
  @DefaultCardFormatter = DefaultCardFormatter
