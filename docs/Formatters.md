> [Wiki](Home) ▸ **Formatters**

**FieldKit** [Fields](https://github.com/square/field-kit/wiki/FieldKit-Fields) call out to formatters for information on how the text should be formatted, if the text is valid, and how to parse formatted text.

Formatters provide two main methods: `parse()` and `format()`. `parse()` takes
a string and returns the value represented by that string, e.g. a `Date` object
if the formatter provided date and time formatting. `format()` takes an object
of the same type `parse()` returns and turns it into a string representation
suitable for display to or editing by an end user.

Formatters may also assist with as-you-type editing by implementing the
`isChangeValid()` method which can by used to prevent or alter changes to a
text field that would make the value invalid.

FieldKit comes bundled with a few useful formatters, such as
`FieldKit.NumberFormatter`, which implements `isChangeValid()` to help users to
only enter valid numbers:

```js
var field = new FieldKit.TextField(document.getElementById('quantity'),
              new FieldKit.NumberFormatter()
                .setMinimum(0)
                .setMaximum(10))
              .setValue(quantity);
```

`NumberFormatter` can format integers, decimals (safely using
[stround](https://github.com/square/stround)), percentages, and currency amounts. Use `#setNumberStyle()`
to choose which style to use.

`FieldKit.Formatter` and its subclasses are modeled after Cocoa's
[`NSFormatter`](https://developer.apple.com/library/mac/documentation/cocoa/reference/foundation/classes/NSFormatter_Class/Reference/Reference.html) class and its subclasses. They share many of the
same API methods and relationships with other objects, so any guides and
documentation for use Cocoa formatting may be useful in understanding how
FieldKit works.

## Implementing a Formatter
Formatters should implement the following methods:

### <a name="format" href="Formatters#format">#</a> format
> @param {string} text - raw unformatted text  
> @returns {string} - formatted text
>
> This method is called when a Field sets value.

### <a name="parse" href="Formatters#parse">#</a> parse
> @param {string} text - formatted text  
> @returns {string} - parsed text
>
> This is the text that is returned when you ask a field for the value. e.g. `field.value()`.

### <a name="isChangeValid" href="Formatters#isChangeValid">#</a> isChangeValid
> @param {TextFieldStateChange} change  
> @returns {boolean}
>
> Determines whether the given change (`TextFieldStateChange`) should be allowed and, if so, whether it should be altered.

## Provided Formatters
 * [Delimited Text Formatter](Delimited-Text-Formatter)
 * [Credit Card Formatters](Credit-Card-Formatters)
 * [Expiry Date Formatter](Expiry-Date-Formatter)
 * [Number Formatter](Number-Formatter)
 * [Phone Formatter](Phone-Formatter)
 * [Social Security Number Formatter](Social-Security-Number-Formatter)