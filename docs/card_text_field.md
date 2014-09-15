

<!-- Start lib/card_text_field.js -->

## CardMaskStrategy

Enum for Affinity values.

## CardTextField

- extends [TextField](text_field.md)

CardTextField add some functionality for credit card
inputs

### Params: 

* **DOMElement** *element* 

## _masked

Whether we are currently masking the displayed text.

## _editing

Whether we are currently editing.

## cardType 
Gets the card type for the current value.
()

### Return:

* **String** Returns one of 'visa', 'mastercard', 'amex' and 'discover'.

## cardMaskStrategy 
Gets the type of masking this field uses.
()

### Return:

* **CardMaskStrategy** 

## setCardMaskStrategy 
Sets the type of masking this field uses.
(cardMaskStrategy)

### Params: 

* **CardMaskStrategy** *cardMaskStrategy* One of CardMaskStrategy.

### Return:

* **null** 

## cardMask 
Returns a masked version of the current formatted PAN. Example:

### Example
    field.setText('4111 1111 1111 1111');
    field.cardMask(); // "•••• •••• •••• 1111"
()

### Return:

* **String** Returns a masked card string.

## text 
Gets the formatted PAN for this field.
()

### Return:

* **String** 

## setText 
Sets the formatted PAN for this field.
(text)

### Params: 

* **String** *text* A formatted PAN.

## textFieldDidEndEditing 
Called by our superclass, used to implement card masking.
()

## textFieldDidBeginEditing 
Called by our superclass, used to implement card masking.
()

## _enableMasking 
Enables masking if it is not already enabled.
()

## _disableMasking 
Disables masking if it is currently enabled.
()

## _syncMask 
Enables or disables masking based on the mask settings.
()

<!-- End lib/card_text_field.js -->

