TEMPLATE = """
<div class="card-field">
  <div class="card-field-inner">
    <input class="card-field-pan" placeholder="1234 5678 9012 3456"/>
    <div class="card-field-extras">
      <input class="card-field-expiry" placeholder="MM/YY"/><!--
   --><input class="card-field-cvv" placeholder="CCV"/><!--
   --><input class="card-field-postal-code" placeholder="ZIP"/>
    </div>
  </div>
</div>
"""

KEYS =
  A:         65
  ZERO:      48
  NINE:      57
  LEFT:      37
  RIGHT:     39
  UP:        38
  DOWN:      40
  BACKSPACE:  8
  DELETE:    46

KEYS.isDigit = (keyCode) ->
  @ZERO <= keyCode <= @NINE

KEYS.isDirectional = (keyCode) ->
  keyCode in [@LEFT, @RIGHT, @UP, @DOWN]

GAP = ' '

no_ws = (string) ->
  string.replace(/\s+/g, '')

FormattedTextField = require './text_field'

class CardExtraField
  constructor: (@cardField, @element) ->
    @element.on 'keydown', @keyDown
    @element.on 'keyup', @keyUp

  keyDown: (event) =>
    return if event.metaKey or event.ctrlKey

    if KEYS.isDirectional(event.keyCode)
      return

    if KEYS.isDigit(event.keyCode) and not event.shiftKey and not event.altKey
      @alignCenter()

    else if event.keyCode is KEYS.DELETE
      caret = @element.caret()

      if caret.start is 0 and caret.end is @element.val().length
        @alignLeft()
      else if @element.val().length is 1 and caret.start is caret.end and caret.start is 0
        @alignLeft()

    else if event.keyCode is KEYS.BACKSPACE
      caret = @element.caret()

      if caret.start is 0 and caret.end is @element.val().length
        @alignLeft()
      else if @element.val().length is 1 and caret.start is caret.end and caret.start is 1
        @alignLeft()
    else
      event.preventDefault()

  keyUp: (event) =>

  alignCenter: ->
    @element.css 'text-align', 'center'

  alignLeft: ->
    @element.css 'text-align', 'left'

class CardFormatter
  @GAP_INDEXES: [3, 7, 11]
  length: 16

  format: (value) ->
    value = no_ws(value).substring(0, @length)

    result = ''
    for i in [0...value.length]
      result += value[i]
      result += GAP if i in @constructor.GAP_INDEXES

    return result

  parse: (text) ->
    no_ws text

class AmexFormatter extends CardFormatter
  @GAP_INDEXES: [3, 9]
  length: 15

class CardField
  getElement: ->
    @_element or @build()

  build: ->
    @_element = $(TEMPLATE)
    @_panField = new PanField(this, @_element.find('.card-field-pan'))
    @_panField.on 'change', @onPanChanged
    @_panField.formatter = new CardFormatter()
    @_expiryField = new CardExtraField(this, @_element.find('.card-field-expiry'))
    @_cvvField    = new CardExtraField(this, @_element.find('.card-field-cvv'))
    @_postalField = new CardExtraField(this, @_element.find('.card-field-postal-code'))

    return @_element

  onPanChanged: =>
    @cardType = Juno.determineCardType(@_panField.value)

  @::__defineGetter__ 'cardType', ->
    @_cardType

  @::__defineSetter__ 'cardType', (cardType) ->
    return if cardType is @_cardType

    @_element.removeClass("card-field-#{@_cardType}") if @_cardType
    @_element.addClass("card-field-#{cardType}") if cardType

    @_cardType = cardType

    if cardType is Juno.CardType.AMEX
      @_panField.formatter = new AmexFormatter()
    else
      @_panField.formatter = new CardFormatter()

if module?
  module.exports = CardField
else if window?
  window.CardField = CardField
