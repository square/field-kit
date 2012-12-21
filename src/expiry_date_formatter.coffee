zpad2 = (n) ->
  result = "#{n}"
  result = "0#{result}" while result.length < 2
  result

class ExpiryDateFormatter
  format: (value) ->
    return '' unless value

    { month, year } = value
    year = year % 10

    "#{zpad2 month}/#{zpad2 year}"

  parse: (text) ->
    if match = text.match /^(0?[1-9]|1\d)\/(\d\d)$/
      return month: Number(match[1]), year: Number(match[2])

  isChangeValid: (change) ->
    isBackspace = change.proposed.text.length < change.current.text.length
    newText = change.proposed.text

    if isBackspace
      if change.deleted.text is '/'
        newText = newText[0]
      if newText is '0'
        newText = ''
    else if change.inserted.text is '/' and change.current.text is '1'
      newText = '01/'
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
        newText += '/'

      if match = newText.match(/^(\d\d)\/(\d\d?).*$/)
        newText = match[1] + '/' + match[2]

    change.proposed.text = newText
    change.proposed.caret = start: newText.length, end: newText.length

    return true

if module?
  module.exports = ExpiryDateFormatter
else
  @ExpiryDateFormatter = ExpiryDateFormatter
