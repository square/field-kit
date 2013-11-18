isDigits = (string) ->
  /^\d*$/.test string

startsWith = (prefix, string) ->
  string[0...prefix.length] is prefix

endsWith = (suffix, string) ->
  string[(string.length - suffix.length)..] is suffix

if ''.trim
  trim = (string) ->
    string.trim()
else
  trim = (string) ->
    string.replace(/(^\s+|\s+$)/, '')

zpad = (length, n) ->
  result = "#{n}"
  result = "0#{result}" while result.length < length
  result

zpad2 = (n) ->
  zpad 2, n

module.exports = {
  isDigits
  startsWith
  endsWith
  trim
  zpad
  zpad2
}
