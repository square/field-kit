class Caret
  start: null
  end: null

  constructor: (@input) ->

  this::__defineGetter__ 'text', ->
    @input.value.substring(@start, @end)

  replace: (string) ->
    originalValue = @input.value
    originalValue.substring(0, @start) + string + originalValue.substring(@end)

  @parseDescription: (description) ->
    value = ''
    caret = new this()
    affinity = null
    valueIndex = 0
    parseIndex = 0

    parseError = (chr, msg) ->
      throw new Error("unexpected '#{chr}' in '#{description}' at character #{parseIndex}: #{msg}")

    for chr in description
      if chr in ['|', '<', '>']
        # all of these caret markers are invalid if we already have an end
        if caret.end?
          parseError chr, "the selection has already ended"

        if caret.start?
          if chr is '<'
            parseError chr, "'#{chr}' cannot be the end of a selection"

          if affinity isnt null and chr is '>'
            parseError chr, "'#{chr}' cannot be the end of an already-leftward selection"

          caret.end = valueIndex
          affinity = 1 if chr is '>'

        else
          if chr is '>'
            parseError chr, "'#{chr}' cannot be the start of a selection"

          caret.start = valueIndex
          affinity = 0 if chr is '<'
      else
        value += chr
        valueIndex++

      parseIndex++

    if not caret.start?
      parseError 'EOF', "no caret found in description"

    if affinity isnt null and not caret.end?
      parseError 'EOF', "expected '|' to end the selection"

    caret.end ?= caret.start

    return { caret, affinity, value }

  @printDescription: ({caret, affinity, value}) ->
    if caret.start is caret.end
      if affinity?
        throw new Error("cannot have directional selection without a selection: caret=#{caret.start}..#{caret.end}, direction=#{if affinity is 0 then 'upstream' else 'downstream'}, value=#{value}")

      return value.substring(0, caret.start) + '|' + value.substring(caret.end)
    else
      result = value.substring(0, caret.start)
      result += if affinity is 0 then '<' else '|'
      result += value.substring(caret.start, caret.end)
      result += if affinity is 1 then '>' else '|'
      result += value.substring(caret.end)
      return result

module.exports = Caret
