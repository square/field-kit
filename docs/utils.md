

<!-- Start lib/utils.js -->

## isDigits (string)

### Params: 

* **String** *string* 

### Return:

* **Boolean** 

## startsWith (prefix, string)

### Params: 

* **String** *prefix* 
* **String** *string* 

### Return:

* **Boolean** 

## endsWith (suffix, string)

### Params: 

* **String** *suffix* 
* **String** *string* 

### Return:

* **Boolean** 

## trim (string)

### Params: 

* **String** *string* 

### Return:

* **String** 

## zpad 
Will pad n with `0` up until length.

### Example
    zpad(16, '1234');
    // => 0000000000001234
(length, n)

### Params: 

* **Number** *length* 
* **(String|Number)** *n* 

### Return:

* **String** 

## zpad2 
Will pad n with `0` up until length is 2.

### Example
    zpad2('2');
    // => 02
(n)

### Params: 

* **(String|Number)** *n* 

### Return:

* **String** 

## bind 
PhantomJS 1.9 does not have Function.bind.
(fn, context)

### Params: 

* **Function** *fn* 
* ***** *context* 

### Return:

* ***** 

## bind()

jshint freeze:false

## forEach (iterable, iterator)

### Params: 

* ***** *iterable* 
* **Function** *iterator* 

## getPrototypeOf

jshint proto:true

jshint proto:false

## hasGetter (object, property)

### Params: 

* **Object** *object* 
* **String** *property* 

### Return:

* **Boolean** 

## getAllPropertyNames (object)

### Params: 

* **Object** *object* 

### Return:

* **Array<?String>** 

<!-- End lib/utils.js -->

