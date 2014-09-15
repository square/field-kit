

<!-- Start lib/text_field.js -->

global console

## Affinity

Enum for Affinity values.

## isWordChar 
Tests is string passed in is a single word.
(chr)

### Params: 

* **String** *chr* 

### Return:

* **Boolean** 

## hasLeftWordBreakAtIndex 
Checks if char to the left of {index} in {string}
is a break (non-char).
(text, index)

### Params: 

* **String** *text* 
* **Number** *index* 

### Return:

* **Boolean** 

## hasRightWordBreakAtIndex 
Checks if char to the right of {index} in {string}
is a break (non-char).
(text, index)

### Params: 

* **String** *text* 
* **Number** *index* 

### Return:

* **Boolean** 

## TextField

TextField is the simplest input and the base for more complex
types to inherit.

Sets up the initial properties of the TextField and
sets  up the event listeners

### Params: 

* **DOMElement** *element* 
* **Formatter** *[Formatter]* formatter

## selectionAffinity

Contains one of the Affinity enum to indicate the preferred direction of
selection.

## textDidChange 
Called when the user has changed the text of the field. Can be used in
subclasses to perform actions suitable for this event.
()

## textFieldDidEndEditing 
Called when the user has in some way declared that they are done editing,
such as leaving the field or perhaps pressing enter. Can be used in
subclasses to perform actions suitable for this event.
()

## textFieldDidBeginEditing 
Performs actions necessary for beginning editing.
()

## _textDidChange 
Performs actions necessary for text change.
()

## _textFieldDidEndEditing 
Performs actions necessary for ending editing.
()

## _textFieldDidBeginEditing 
Performs actions necessary for beginning editing.
()

## clearSelection 
Clears all characters in the existing selection.

### Example
    // 12|34567|8
    clearSelection();
    // 12|8
()

## delegate 
Gets the current delegate for this text field.
()

### Return:

* **TextFieldDelegate** 

## setDelegate 
Sets the current delegate for this text field.
(delegate)

### Params: 

* **TextFieldDelegate** *delegate* 

### Return:

* **null** 

## deleteBackward 
Deletes backward one character or clears a non-empty selection.

### Example
    // |What's up, doc?
    deleteBackward(event);
    // |What's up, doc?

    // What'|s up, doc?
    deleteBackward(event);
    // What|s up, doc?

    // |What's| up, doc?
    deleteBackward(event);
    // | up, doc?
()

## deleteWordBackward 
Deletes backward one word or clears a non-empty selection.

### Example
    // |What's up, doc?
    deleteWordBackward(event);
    // |What's up, doc?

    // What'|s up, doc?
    deleteWordBackward(event);
    // |s up, doc?

    // |What's| up, doc?
    deleteWordBackward(event);
    // | up, doc?
()

## deleteBackwardByDecomposingPreviousCharacter 
Deletes backward one character, clears a non-empty selection, or decomposes
an accented character to its simple form.
()

## deleteBackwardToBeginningOfLine 
Deletes all characters before the cursor or clears a non-empty selection.

### Example
    // The quick |brown fox.
    deleteBackwardToBeginningOfLine(event);
    // |brown fox.

    // The |quick |brown fox.
    deleteBackwardToBeginningOfLine(event);
    // The brown fox.
()

## deleteForward 
Deletes forward one character or clears a non-empty selection.

### Example
    // What's up, doc?|
    deleteForward(event);
    // What's up, doc?|

    // What'|s up, doc?
    deleteForward(event);
    // What'| up, doc?

    // |What's| up, doc?
    deleteForward(event);
    // | up, doc?
()

## deleteWordForward 
Deletes forward one word or clears a non-empty selection.

### Example
    // What's up, doc?|
    deleteWordForward(event);
    // What's up, doc?|

    // What's |up, doc?
    deleteWordForward(event);
    // What's |, doc?

    // |What's| up, doc?
    deleteWordForward(event);
    // | up, doc?
()

## destroy 
Tears down FieldKit
()

### Return:

* **null** 

## formatter 
Gets the current formatter. Formatters are used to translate between text
and value properties of the field.
()

### Return:

* **Formatter** 

## setFormatter 
Sets the current formatter.
(formatter)

### Params: 

* **Formatter** *formatter* 

## hasSelection 
Determines whether this field has any selection.
()

### Return:

* **Boolean** true if there is at least one character selected

## insertBackTab 
Handles the back tab key.
()

## insertTab 
Handles the tab key.
()

## insertText 
Handles a key event that is trying to insert a character.
(text)

### Params: 

* **String** *text* 

## insertNewline 
Handles a key event could be trying to end editing.
()

## inspect 
Debug support
()

### Return:

* **String** 

## moveUp 
Moves the cursor up, which because this is a single-line text field, means
moving to the beginning of the value.

### Example
    // Hey guys|
    moveUp(event);
    // |Hey guys

    // Hey |guys|
    moveUp(event);
    // |Hey guys
(event)

### Params: 

* **Event** *event* 

## moveToBeginningOfParagraph 
Moves the cursor up to the beginning of the current paragraph, which because
this is a single-line text field, means moving to the beginning of the
value.

### Example
    // Hey guys|
    moveToBeginningOfParagraph(event)
    // |Hey guys

    // Hey |guys|
    moveToBeginningOfParagraph(event)
    // |Hey guys
(event)

### Params: 

* **Event** *event* 

## moveUpAndModifySelection 
Moves the cursor up, keeping the current anchor point and extending the
selection to the beginning as moveUp would.

### Example
    // rightward selections are shrunk
    // Hey guys, |where> are you?
    moveUpAndModifySelection(event);
    // <Hey guys, |where are you?

    // leftward selections are extended
    // Hey guys, <where| are you?
    moveUpAndModifySelection(event);
    // <Hey guys, where| are you?

    // neutral selections are extended
    // Hey guys, |where| are you?
    moveUpAndModifySelection(event);
    // <Hey guys, where| are you?
(event)

### Params: 

* **Event** *event* 

## moveParagraphBackwardAndModifySelection 
Moves the free end of the selection to the beginning of the paragraph, or
since this is a single-line text field to the beginning of the line.
(event)

### Params: 

* **Event** *event* 

## moveToBeginningOfDocument 
Moves the cursor to the beginning of the document.
(event)

### Params: 

* **Event** *event* 

## moveToBeginningOfDocumentAndModifySelection 
Moves the selection start to the beginning of the document.(event)

### Params: 

* **Event** *event* 

## moveDown 
Moves the cursor down, which because this is a single-line text field, means
moving to the end of the value.

### Example
    // Hey |guys
    moveDown(event)
    // Hey guys|

    // |Hey| guys
    moveDown(event)
    // Hey guys|
(event)

### Params: 

* **Event** *event* 

## moveToEndOfParagraph 
Moves the cursor up to the end of the current paragraph, which because this
is a single-line text field, means moving to the end of the value.

### Example
    // |Hey guys
    moveToEndOfParagraph(event)
    // Hey guys|

    // Hey |guys|
    moveToEndOfParagraph(event)
    // Hey guys|
(event)

### Params: 

* **Event** *event* 

## moveDownAndModifySelection 
Moves the cursor down, keeping the current anchor point and extending the
selection to the end as moveDown would.

### Example
    // leftward selections are shrunk
    // Hey guys, <where| are you?
    moveDownAndModifySelection(event)
    // Hey guys, |where are you?>

    // rightward selections are extended
    // Hey guys, |where> are you?
    moveDownAndModifySelection(event)
    // Hey guys, where| are you?>

    // neutral selections are extended
    // Hey guys, |where| are you?
    moveDownAndModifySelection(event)
    // Hey guys, |where are you?>
(event)

### Params: 

* **Event** *event* 

## moveParagraphForwardAndModifySelection 
Moves the free end of the selection to the end of the paragraph, or since
this is a single-line text field to the end of the line.
(event)

### Params: 

* **Event** *event* 

## moveToEndOfDocument 
Moves the cursor to the end of the document.
(event)

### Params: 

* **Event** *event* 

## moveToEndOfDocumentAndModifySelection 
Moves the selection end to the end of the document.(event)

### Params: 

* **Event** *event* 

## moveLeft 
Moves the cursor to the left, counting selections as a thing to move past.

### Example
    // no selection just moves the cursor left
    // Hey guys|
    moveLeft(event)
    // Hey guy|s

    // selections are removed
    // Hey |guys|
    moveLeft(event)
    // Hey |guys
(event)

### Params: 

* **Event** *event* 

## moveLeftAndModifySelection 
Moves the free end of the selection one to the left.

### Example
    // no selection just selects to the left
    // Hey guys|
    moveLeftAndModifySelection(event)
    // Hey guy<s|

    // left selections are extended
    // Hey <guys|
    moveLeftAndModifySelection(event)
    // Hey< guys|

    // right selections are shrunk
    // Hey |guys>
    moveLeftAndModifySelection(event)
    // Hey |guy>s

    // neutral selections are extended
    // Hey |guys|
    moveLeftAndModifySelection(event)
    //Hey< guys|
(event)

### Params: 

* **Event** *event* 

## moveWordLeft 
Moves the cursor left until the start of a word is found.

### Example
    // no selection just moves the cursor left
    // Hey guys|
    moveWordLeft(event)
    // Hey |guys

    // selections are removed
    // Hey |guys|
    moveWordLeft(event)
    // |Hey guys
(event)

### Params: 

* **Event** *event* 

## moveWordLeftAndModifySelection 
Moves the free end of the current selection to the beginning of the previous
word.

### Example
    // no selection just selects to the left
    // Hey guys|
    moveWordLeftAndModifySelection(event)
    // Hey |guys|

    // left selections are extended
    // Hey <guys|
    moveWordLeftAndModifySelection(event)
    // <Hey guys|

    // right selections are shrunk
    // |Hey guys>
    moveWordLeftAndModifySelection(event)
    // |Hey >guys

    // neutral selections are extended
    // Hey |guys|
    moveWordLeftAndModifySelection(event)
    // <Hey guys|
(event)

### Params: 

* **Event** *event* 

## moveToBeginningOfLine 
Moves the cursor to the beginning of the current line.

### Example
    // Hey guys, where| are ya?
    moveToBeginningOfLine(event)
    // |Hey guys, where are ya?
(event)

### Params: 

* **Event** *event* 

## moveToBeginningOfLineAndModifySelection 
Select from the free end of the selection to the beginning of line.

### Example
    // Hey guys, where| are ya?
    moveToBeginningOfLineAndModifySelection(event)
    // <Hey guys, where| are ya?

    // Hey guys, where| are> ya?
    moveToBeginningOfLineAndModifySelection(event)
    // <Hey guys, where are| ya?
(event)

### Params: 

* **Event** *event* 

## moveRight 
Moves the cursor to the right, counting selections as a thing to move past.

### Example
    // no selection just moves the cursor right
    // Hey guy|s
    moveRight(event)
    // Hey guys|

    // selections are removed
    // Hey |guys|
    moveRight(event)
    // Hey guys|
(event)

### Params: 

* **Event** *event* 

## moveRightAndModifySelection 
Moves the free end of the selection one to the right.

### Example
    // no selection just selects to the right
    // Hey |guys
    moveRightAndModifySelection(event)
    // Hey |g>uys

    // right selections are extended
    // Hey |gu>ys
    moveRightAndModifySelection(event)
    // Hey |guy>s

    // left selections are shrunk
    // <Hey |guys
    moveRightAndModifySelection(event)
    // H<ey |guys

    // neutral selections are extended
    // |Hey| guys
    moveRightAndModifySelection(event)
    // |Hey >guys
(event)

### Params: 

* **Event** *event* 

## moveWordRight 
Moves the cursor right until the end of a word is found.

### Example
    // no selection just moves the cursor right
    // Hey| guys
    moveWordRight(event)
    // Hey guys|

    // selections are removed
    // |Hey| guys
    moveWordRight(event)
    // Hey guys|
(event)

### Params: 

* **Event** *event* 

## moveWordRightAndModifySelection 
Moves the free end of the current selection to the next end of word.

### Example
    // no selection just selects to the right
    // Hey |guys
    moveWordRightAndModifySelection(event)
    // Hey |guys|

    // right selections are extended
    // Hey |g>uys
    moveWordRightAndModifySelection(event)
    // Hey |guys>

    // left selections are shrunk
    // He<y |guys
    moveWordRightAndModifySelection(event)
    // Hey< |guys

    // neutral selections are extended
    // He|y |guys
    moveWordRightAndModifySelection(event)
    // He|y guys>
(event)

### Params: 

* **Event** *event* 

## moveToEndOfLine 
Moves the cursor to the end of the current line.

### Example
    // Hey guys, where| are ya?
    moveToEndOfLine(event)
    // |Hey guys, where are ya?
(event)

### Params: 

* **Event** *event* 

## moveToEndOfLineAndModifySelection 
Moves the free end of the selection to the end of the current line.

### Example
    // Hey guys, where| are ya?
    moveToEndOfLineAndModifySelection(event)
    // Hey guys, where| are ya?>

    // Hey guys, <where| are ya?
    moveToEndOfLineAndModifySelection(event)
    // Hey guys, |where are ya?>
(event)

### Params: 

* **Event** *event* 

## readSelectionFromPasteboard 
Replaces the current selection with text from the given pasteboard.
(pasteboard)

### Params: 

* **ClipboardData** *pasteboard* 

## replaceSelection 
Replaces the characters within the selection with given text.

### Example
    // 12|34567|8
    replaceSelection('00')
    // 12|00|8
(replacement)

### Params: 

* **String** *replacement* 

## rightWordBreakIndexes 
Find ends of 'words' for navigational purposes.

### Example
    // given value of '123456789' and text of '123-45-6789'
    rightWordBreakIndexes()
    //=> [3, 5, 9]
()

### Return:

* **Array.<number>** 

## rollbackInvalidChanges 
Checks changes after invoking the passed function for validity and rolls
them back if the changes turned out to be invalid.
()

### Return:

* **Object** whatever object `callback` returns

## selectAll 
Expands the selection to contain all the characters in the content.

### Example
    // 123|45678
    selectAll(event)
    // |12345678|
(event)

### Params: 

* **Event** *event* 

## text 
Gets the formatted text value. This is the same as the value of the
underlying input element.
()

### Return:

* **String** 

## setText 
Sets the formatted text value. This generally should not be used. Instead,
use the value setter.
(text)

### Params: 

* **String** *text* 

## value 
Gets the object value. This is the value that should be considered the
'real' value of the field.
()

### Return:

* **Object** 

## setValue 
Sets the object value of the field.
(value)

### Params: 

* **String** *value* 

## selectedRange 
Gets the range of the current selection.
()

### Return:

* **Object** {start: number, length: number}

## setSelectedRange 
Sets the range of the current selection without changing the affinity.(range)

### Params: 

* **Object** *range* ({start: 0, length: 0})

## setSelectedRangeWithAffinity 
Sets the range of the current selection and the selection affinity.
(range, affinity)

### Params: 

* **Object** *range* {start: number, length: number}
* **Affinity** *affinity* 

## selectionAnchor 
Gets the position of the current selection's anchor point, i.e. the point
that the selection extends from, if any.
()

### Return:

* **Number** 

**** Undo Support ****

## allowsUndo 
Gets whether this text field records undo actions with its undo manager.
()

### Return:

* **Boolean** 

## setAllowsUndo 
Sets whether this text field records undo actions with its undo manager.
(allowsUndo)

### Params: 

* **Boolean** *allowsUndo* 

## redo 
Triggers a redo in the underlying UndoManager, if applicable.
(event)

### Params: 

* **Event** *event* 

## undo 
Triggers an undo in the underlying UndoManager, if applicable.
(event)

### Params: 

* **Event** *event* 

## undoManager 
Gets the UndoManager for this text field.
()

### Return:

* **UndoManager** 

**** Enabled/disabled support *****

## becomeFirstResponder 
Removes focus from this field if it has focus.()

## hasFocus 
Determines whether this field has focus.
()

### Return:

* **Boolean** true if this field has focus

## isEnabled 
Determines whether this field is enabled or disabled.
()

### Return:

* **Boolean** true if this field is enabled

## setEnabled 
Sets whether this text field is enabled
and syncs the placeholder to match
(enabled)

### Params: 

* **Boolean** *enabled* 

## resignFirstResponder 
Removes focus from this field if it has focus.
(event)

### Params: 

* **Event** *event* 

**** Placeholder support ****

## disabledPlaceholder 
Gets the disabled placeholder if one
has been set.
()

### Return:

* **String** 

## setDisabledPlaceholder 
Sets the disabled placeholder.
(disabledPlaceholder)

### Params: 

* **String** *disabledPlaceholder* 

## focusedPlaceholder 
Gets the focused placeholder if one
has been set.
()

### Return:

* **String** 

## setFocusedPlaceholder 
Sets the focused placeholder.
(focusedPlaceholder)

### Params: 

* **String** *focusedPlaceholder* 

## placeholder 
Gets the placeholder if one has
been set.
()

### Return:

* **String** 

## setPlaceholder 
Sets the placeholder.
(placeholder)

### Params: 

* **String** *placeholder* 

## unfocusedPlaceholder 
Gets the unfocused placeholder if one
has been set.
()

### Return:

* **String** 

## setUnfocusedPlaceholder 
Sets the unfocused placeholder.
(unfocusedPlaceholder)

### Params: 

* **String** *unfocusedPlaceholder* 

## _applyChangeFromUndoManager 
Applies the given change as an undo/redo.
(change)

### Params: 

* **Object** *change* object with current and proposed properties

## _buildKeybindings 
Builds the key bindings for platform
()

## _click 
Handles clicks by resetting the selection affinity.
()

## _fireEvent 
Fires event on the element
(eventType)

### Params: 

* **String** *eventType* 

## _focus 
Hanles the focus in event. This method delegates to other
methods, and syncs the placeholder appropriately.
()

## _blur 
Hanles the focus out event. This method delegates to other
methods, and syncs the placeholder appropriately.
()

## _keyDown 
Handles keyDown events. This method essentially just delegates to other,
more semantic, methods based on the modifier keys and the pressed key of the
event.
(event)

### Params: 

* **Event** *event* 

## _keyPress 
Handles inserting characters based on the typed key.
(event)

### Params: 

* **Event** *event* 

## _keyUp 
Handles keyup events.
(event)

### Params: 

* **Event** *event* 

## _lastWordBreakBeforeIndex 
Finds the start of the 'word' before index.
(index)

### Params: 

* **Number** *index* position at which to start looking

### Return:

* **Number** index in value less than or equal to the given index

## _leftWordBreakIndexes 
Find starts of 'words' for navigational purposes.

### Example
    // given value of '123456789' and text of '123-45-6789'
    leftWordBreakIndexes()
    // => [0, 3, 5]
()

### Return:

* **Array.<number>** indexes in value of word starts.

## _nextWordBreakAfterIndex 
Finds the end of the 'word' after index.
(index)

### Params: 

* **Number** *index* position in value at which to start looking.

### Return:

* **Number** 

## _paste 
Handles paste events.
(event)

### Params: 

* **Event** *event* 

## _syncPlaceholder ()

## TextFieldStateChange

Helps calculate the changes after an event on a FieldKit.TextField.

### Params: 

* **FieldKitField** *field* 

## hasChanges 
Determines whether this field has changes.
()

### Return:

* **Boolean** true if either of the following are true:    - the current text doesn't match the proposed text
   - the current selection range doesn't match the proposed selection range

## recomputeDiff 
Updates {TextFieldStateChange} inserted and {TextFieldStateChange} deleted
based on proposed and current
()

### Return:

* **null** 

## build 
Builds a new {TextFieldStateChange} that will allow you to
compute differences, and see the current vs proposed changes.
(field, callback)

### Params: 

* **FieldKitField** *field* 
* **Function** *callback* called when you want changes to the field    take place. Current will be calculated before this callback.
   Proposed will be calculated after this callback.

### Return:

* **Object** change object with current and proposed properties

<!-- End lib/text_field.js -->

