> [Wiki](Home) ▸ **Fields**

**FieldKit** builds all its more complex fields with `FieldKit.TextField` as the base class. Using TextField is very easy.

```html
<input type="text" id="text-field-example" />

<script>
  var field = new FieldKit.TextField(document.getElementById('sw-ship-registry'));
  field.setFocusedPlaceholder('YT-1300');
  field.setUnfocusedPlaceholder('Ship Name');
</script>
```

Fields that add additional functionality to a specific use case.

All FieldKit Fields enable you to listen on some basic events over the lifetime of an input.

### Note
FieldKit will disable `autocapitalization` unless you specifically turn it on
with an attribute on the `input`. We recommend that you use a formatter to handle
capitalizations for your fields instead of using `autocapitalization`.

**Caution on iOS this causes a bug that will cause the text to be all Caps unless
the user manually uncaps the text**

## Delegates (Events)

### Events
#### <a name="textDidChange" href="FieldKit-Fields#textDidChange">#</a> textDidChange
> Called when the user has changed the text of the field.

#### <a name="textFieldDidEndEditing" href="FieldKit-Fields#textFieldDidEndEditing">#</a> textFieldDidEndEditing
> Called when the user has in some way declared that they are done editing, such as leaving the field or perhaps pressing enter.

#### <a name="textFieldDidBeginEditing" href="FieldKit-Fields#textFieldDidBeginEditing">#</a> textFieldDidBeginEditing
> Called when the user has in some way started editing


### Usage
You can as many, or none of the event delegates you'd like.

```js
var field = new FieldKit.TextField(document.getElementById('spy-on-user'));
field.setDelegate({
  textFieldDidBeginEditing: function(field) {
    console.log(field.value());
  },
  textFieldDidEndEditing: function(field) {
    console.log(field.value());
  },
  textDidChange: function(field) {
    console.log(field.value());
  }
});
```

## Card Text Field

This Field automatically uses the Adaptive Card Formatter, exposes a [Luhn Check](https://en.wikipedia.org/wiki/Luhn_algorithm) method, and allows you to mask a card number to only show the last 4 digits on blur.

### Methods

#### <a name="setCardMaskStrategy" href="FieldKit-Fields#setCardMaskStrategy">#</a> field.setCardMaskStrategy([_CardMaskStrategy_])
> Sets the type of masking this field uses.

#### <a name="cardMaskStrategy" href="FieldKit-Fields#cardMaskStrategy">#</a> field.cardMaskStrategy()
> Gets the type of masking this field uses.

#### <a name="cardType" href="FieldKit-Fields#cardType">#</a> field.cardType()
> Gets the card type for the current value.

### Properties

#### <a name="DoneEditing" href="FieldKit-Fields#DoneEditing">#</a> CardTextField.CardMaskStrategy.DoneEditing
> Property can be passed into [setCardMaskStrategy](FieldKit-Fields#setCardMaskStrategy) to make the field mask on the [textFieldDidEndEditing](FieldKit-Fields#textFieldDidEndEditing) event.


#### <a name="None" href="FieldKit-Fields#None">#</a> CardTextField.CardMaskStrategy.None
> Property can be passed into [setCardMaskStrategy](FieldKit-Fields#setCardMaskStrategy) to make the field have no masking.

### Usage

```html
<input type="text" id="card-number" placeholder="1234 5678 9012 3456">
<div id="card-type">Card type: <span id="card-type-span">unknown</span></div>


<script>
  var field = new FieldKit.CardTextField(document.getElementById('card-number'));
  field.setCardMaskStrategy(FieldKit.CardTextField.CardMaskStrategy.DoneEditing);
  field.setDelegate({
    textDidChange: function() {
      document.getElementById('card-type-span').innerHTML = (field.cardType() || 'unknown');
    }
  });
</script>
```

## Expiry Date Field

This Field automatically uses the Expiry Date Formatter. The field doesn't do much on top of adding the formatter. It only runs the current value through the formatter on [`textFieldDidEndEditing`](FieldKit-Fields#textFieldDidEndEditing) so that a value like `12/4` will turn to `12/04`.
