if require?
  DelimitedTextFormatter = require './delimited_text_formatter'
else
  {DelimitedTextFormatter} = @FieldKit

zpad2 = (n) ->
  result = "#{n}"
  result = "0#{result}" while result.length < 2
  result

class ExpiryDateFormatter extends DelimitedTextFormatter
  maximumLength: 5

  constructor: ->
    super '/'

  hasDelimiterAtIndex: (index) ->
    index is 2

  format: (value) ->
    return '' unless value

    { month, year } = value
    year = year % 10

    super zpad2(month) + zpad2(year)

  parse: (text) ->
    text = super text
    if match = text.match /^(0?[1-9]|1\d)(\d\d)$/
      return month: Number(match[1]), year: Number(match[2])

  isChangeValid: (change) ->
    isBackspace = change.proposed.text.length < change.current.text.length
    newText = change.proposed.text

    if isBackspace
      if change.deleted.text is @delimiter
        newText = newText[0]
      if newText is '0'
        newText = ''
    else if change.inserted.text is @delimiter and change.current.text is '1'
      newText = "01#{@delimiter}"
    else if !/^\d$/.test(change.inserted.text)
      return false
    else
      # 4| -> 04|
      if /^[2-9]$/.test(newText)
        newText = '0' + newText

      # 15| -> 1|
      if /^1[3-9]$/.test(newText)
        return false

      # 11| -> 11/
      if /^(0\d|1[0-2])$/.test(newText)
        newText += @delimiter

      if (match = newText.match(/^(\d\d)(.)(\d\d?).*$/)) and match[2] is @delimiter
        newText = match[1] + @delimiter + match[3]

    change.proposed.text = newText
    change.proposed.caret = start: newText.length, end: newText.length

    return true

if module?
  module.exports = ExpiryDateFormatter
else
  (@FieldKit ||= {}).ExpiryDateFormatter = ExpiryDateFormatter
