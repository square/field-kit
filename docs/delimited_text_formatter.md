

<!-- Start lib/delimited_text_formatter.js -->

## DelimitedTextFormatter

- extends [Formatter](formatter.md)

A generic delimited formatter.

### Params: 

* **String** *[this.delimiter]* delimiter
* **Boolean** *[false]* isLazy

## delimiterAt 
Determines the delimiter character at the given index.
(index)

### Params: 

* **Number** *index* 

### Return:

* **?String** 

## isDelimiter 
Determines whether the given character is a delimiter.
(chr)

### Params: 

* **String** *chr* 

### Return:

* **Boolean** 

## format 
Formats the given value by adding delimiters where needed.
(value)

### Params: 

* **?String** *value* 

### Return:

* **String** 

## _textFromValue 
Formats the given value by adding delimiters where needed.
(value)

### Params: 

* **?String** *value* 

### Return:

* **String** 

## parse 
Parses the given text by removing delimiters.
(text)

### Params: 

* **?String** *text* 

### Return:

* **String** 

## _valueFromText 
Parses the given text by removing delimiters.
(text)

### Params: 

* **?String** *text* 

### Return:

* **String** 

## isChangeValid 
Determines whether the given change should be allowed and, if so, whether
it should be altered.
(change, error)

### Params: 

* **TextFieldStateChange** *change* 
* **Function(String)** *error* 

### Return:

* **Boolean** 

<!-- End lib/delimited_text_formatter.js -->

