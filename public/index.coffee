jQuery ($) ->
  exipryField = new FieldKit.TextField($('#expiry'))
  exipryField.formatter = new FieldKit.ExpiryDateFormatter()

  creditCardField = new FieldKit.TextField($('#card-number'))
  creditCardField.formatter = new FieldKit.AdaptiveCardFormatter()

  bToAField = new FieldKit.TextField($('#b-to-a'))
  bToAField.formatter =
    format: (value) -> value.replace(/b/g, 'a').replace(/B/g, 'A')
    parse: (value) -> value

    isChangeValid: (change) ->
      change.proposed.text = @format @parse(change.proposed.text)
      return true

  noSelectionField = new FieldKit.TextField($('#no-selection'))
  noSelectionField.formatter =
    format: (value) -> value
    parse: (value) -> value

    isChangeValid: (change) ->
      caret = change.proposed.caret
      if caret.start isnt caret.end
        if change.field.selectionAnchor is caret.end
          caret.end = caret.start
        else
          caret.start = caret.end

      return true
