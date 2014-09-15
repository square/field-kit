

<!-- Start lib/phone_formatter.js -->

## NANPPhoneDelimiters

## NANPPhoneDelimitersWithOne

## NANPPhoneDelimitersWithPlus

## PhoneFormatter

- extends [DelimitedTextFormatter](delimited_text_formatter.md)

### Params: 

* **Array** *args* 

## isDelimiter (chr)

### Params: 

* **String** *chr* 

### Return:

* **Boolean** 

## delimiterAt (index)

### Params: 

* **Number** *index* 

### Return:

* **?String** 

## hasDelimiterAtIndex (index)

### Params: 

* **Number** *index* 

### Return:

* **Boolean** 

## parse 
Will call parse on the formatter.(text, error)

### Params: 

* **String** *text* 
* **Function(String)** *error* 

### Return:

* **String** returns value with delimiters removed

## format (value)

### Params: 

* **String** *value* 

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

## guessFormatFromText 
Re-configures this formatter to use the delimiters appropriate
for the given text.
(text)

### Params: 

* **string** *text* A potentially formatted string containing a phone number.

## digitsWithoutCountryCode 
Gives back just the phone number digits as a string without the
country code. Future-proofing internationalization where the country code
isn't just +1.
(text)

### Params: 

* **String** *text* 

## removeDelimiterMapChars 
Removes characters from the phone number that will be added
by the formatter.
(text)

### Params: 

* **String** *text* 

<!-- End lib/phone_formatter.js -->

