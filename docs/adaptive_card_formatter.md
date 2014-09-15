

<!-- Start lib/adaptive_card_formatter.js -->

## AdaptiveCardFormatter

AdaptiveCardFormatter will decide if it needs to use
[AmexCardFormatter](amex_card_formatter.md) or [DefaultCardFormatter](default_card_formatter.md).

## format 
Will pick the right formatter based on the `pan` and
will return the formatted string.
(pan)

### Params: 

* **String** *pan* 

### Return:

* **String** formatted string

## parse 
Will call parse on the formatter.(text, error)

### Params: 

* **String** *text* 
* **Function(String)** *error* 

### Return:

* **String** returns value with delimiters removed

## isChangeValid 
Determines whether the given change should be allowed and, if so, whether
it should be altered.
(change, error)

### Params: 

* **TextFieldStateChange** *change* 
* **Function(!String)** *error* 

### Return:

* **Boolean** 

## _formatterForPan 
Decides which formatter to use.
(pan)

### Params: 

* **String** *pan* 

### Return:

* **Formatter** 

<!-- End lib/adaptive_card_formatter.js -->

