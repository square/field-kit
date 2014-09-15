

<!-- Start lib/default_card_formatter.js -->

## DefaultCardFormatter

- extends [DelimitedTextFormatter](delimited_text_formatter.md)

A generic credit card formatter.

Sets the Delimitor to `' '`

## hasDelimiterAtIndex (index)

### Params: 

* **Number** *index* 

### Return:

* **Boolean** 

## parse 
Will call parse on the formatter.
(text, error)

### Params: 

* **String** *text* 
* **Function(String)** *error* 

### Return:

* **String** returns value with delimiters removed

## _valueFromText 
Parses the given text by removing delimiters.
(text)

### Params: 

* **?String** *text* 

### Return:

* **String** 

<!-- End lib/default_card_formatter.js -->

