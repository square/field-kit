

<!-- Start lib/card_utils.js -->

## determineCardType 
Pass in a credit card number and it'll return the
type of card it is.
(pan)

### Params: 

* **String** *pan* 

### Return:

* **?String** returns the type of card based in the digits

## luhnCheck 
Pass in a credit card number and it'll return if it
passes the [luhn algorithm](http://en.wikipedia.org/wiki/Luhn_algorithm)
(pan)

### Params: 

* **String** *pan* 

### Return:

* **Boolean** 

## validCardLength 
Pass in a credit card number and it'll return if it
is a valid length for that type. If it doesn't know the
type it'll return false
(pan)

### Params: 

* **String** *pan* 

### Return:

* **Boolean** 

<!-- End lib/card_utils.js -->

