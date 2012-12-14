class Caret
  start: null
  end: null

  constructor: (@element) ->

  @::__defineGetter__ 'text', ->
    @element.val().substring(@start, @end)

  replace: (string) ->
    originalValue = @element.val()
    originalValue.substring(0, @start) + string + originalValue.substring(@end)

  @parseDescription: (description) ->
    value = ''
    caret = new @()
    direction = null
    valueIndex = 0
    parseIndex = 0

    parseError = (char, msg) ->
      throw new Error("unexpected '#{char}' in '#{description}' at character #{parseIndex}: #{msg}")

    for char in description
      if char in ['|', '<', '>']
        # all of these caret markers are invalid if we already have an end
        if caret.end?
          parseError char, "the selection has already ended"

        if caret.start?
          if char is '<'
            parseError char, "'#{char}' cannot be the end of a selection"

          if direction isnt null and char is '>'
            parseError char, "'#{char}' cannot be the end of an already-leftward selection"

          caret.end = valueIndex
          direction = 'right' if char is '>'

        else
          if char is '>'
            parseError char, "'#{char}' cannot be the start of a selection"

          caret.start = valueIndex
          direction = 'left' if char is '<'
      else
        value += char
        valueIndex++

      parseIndex++

    if not caret.start?
      parseError 'EOF', "no caret found in description"

    if direction isnt null and not caret.end?
      parseError 'EOF', "expected '|' to end the selection"

    caret.end ?= caret.start

    return { caret, direction, value }

  @printDescription: ({caret, direction, value}) ->
    if caret.start is caret.end
      if direction?
        throw new Error("cannot have directional selection without a selection: caret=#{caret.start}..#{caret.end}, direction=#{direction}, value=#{value}")

      return value.substring(0, caret.start) + '|' + value.substring(caret.end)
    else
      result = value.substring(0, caret.start)
      result += if direction is 'left' then '<' else '|'
      result += value.substring(caret.start, caret.end)
      result += if direction is 'right' then '>' else '|'
      result += value.substring(caret.end)
      return result

module.exports = Caret
