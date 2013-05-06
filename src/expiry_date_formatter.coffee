DelimitedTextFormatter = require './delimited_text_formatter'

zpad2 = (n) ->
  result = "#{n}"
  result = "0#{result}" while result.length < 2
  result

interpretTwoDigitYear = (year) ->
  thisYear = new Date().getFullYear()
  thisCentury = thisYear - (thisYear % 100)
  centuries = [thisCentury, thisCentury - 100, thisCentury + 100].sort (a, b) ->
    Math.abs(thisYear - (year + a)) - Math.abs(thisYear - (year + b))
  year + centuries[0]

class ExpiryDateFormatter extends DelimitedTextFormatter
  delimiter: '/'
  maximumLength: 5

  hasDelimiterAtIndex: (index) ->
    index is 2

  format: (value) ->
    return '' unless value

    { month, year } = value
    year = year % 100

    super zpad2(month) + zpad2(year)

  parse: (text, error) ->
    text = super text
    if match = text.match /^(0?[1-9]|1\d)(\d\d)$/
      month = Number(match[1])
      year = interpretTwoDigitYear Number(match[2])
      return { month, year }
    else
      error 'expiry-date-formatter.invalid-date'
      return null

  isChangeValid: (change, error) ->
    isBackspace = change.proposed.text.length < change.current.text.length
    newText = change.proposed.text

    if isBackspace
      if change.deleted.text is @delimiter
        newText = newText[0]
      if newText is '0'
        newText = ''
    else if change.inserted.text is @delimiter and change.current.text is '1'
      newText = "01#{@delimiter}"
    else if change.inserted.text.length > 0 and !/^\d$/.test(change.inserted.text)
      error 'expiry-date-formatter.only-digits-allowed'
      return no
    else
      # 4| -> 04|
      if /^[2-9]$/.test(newText)
        newText = '0' + newText

      # 15| -> 1|
      if /^1[3-9]$/.test(newText)
        error 'expiry-date-formatter.invalid-month'
        return no

      # Don't allow 00
      if newText is '00'
        error 'expiry-date-formatter.invalid-month'
        return false

      # 11| -> 11/
      if /^(0[1-9]|1[0-2])$/.test(newText)
        newText += @delimiter

      if (match = newText.match(/^(\d\d)(.)(\d\d?).*$/)) and match[2] is @delimiter
        newText = match[1] + @delimiter + match[3]

    change.proposed.text = newText
    change.proposed.selectedRange = start: newText.length, length: 0

    return true

module.exports = ExpiryDateFormatter
