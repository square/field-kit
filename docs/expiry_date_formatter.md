

<!-- Start lib/expiry_date_formatter.js -->

## interpretTwoDigitYear 
Give this function a 2 digit year it'll return with 4.

### Example
    interpretTwoDigitYear(15);
    // => 2015
    interpretTwoDigitYear(97);
    // => 1997(year)

### Params: 

* **Number** *year* 

### Return:

* **Number** 

## ExpiryDateFormatter

- extends [DelimitedTextFormatter](delimited_text_formatter.md)

Sets delimiter to `'/'` and max length to 5.

## hasDelimiterAtIndex (index)

### Params: 

* **Number** *index* 

### Return:

* **Boolean** 

## format 
Formats the given value by adding delimiters where needed.
(value)

### Params: 

* **?String** *value* 

### Return:

* **String** 

## parse 
Parses the given text
(text, error)

### Params: 

* **String** *text* 
* **Function(String)** *error* 

### Return:

* **?Object** { month: month, year: year }

## isChangeValid 
Determines whether the given change should be allowed and, if so, whether
it should be altered.
(change, error)

### Params: 

* **TextFieldStateChange** *change* 
* **Function(String)** *error* 

### Return:

* **Boolean** 

<!-- End lib/expiry_date_formatter.js -->

