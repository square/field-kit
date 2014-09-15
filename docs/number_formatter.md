

<!-- Start lib/number_formatter.js -->

## splitLocaleComponents (locale)

### Params: 

* **String** *locale* 

### Return:

* **Object** {lang: lang, country: country}

## get()

This simple property getter assumes that properties will never be functions
and so attempts to run those functions using the given args.

## NumberFormatter

- extends [Formatter](formatter.md)

## allowsFloats 
Gets whether this formatter will parse float number values. This value does
not apply to formatting. To prevent formatting floats, set
maximumFractionDigits to 0.
()

### Return:

* **Boolean** 

## setAllowsFloats 
Sets whether this formatter will parse float number values.
(allowsFloats)

### Params: 

* **Boolean** *allowsFloats* 

### Return:

* **NumberFormatter** 

## alwaysShowsDecimalSeparator 
Gets whether this formatter should show the decimal separator.
()

### Return:

* **Boolean** 

## setAlwaysShowsDecimalSeparator 
Sets whether this formatter will show the decimal separator.
(alwaysShowsDecimalSeparator)

### Params: 

* **Boolean** *alwaysShowsDecimalSeparator* 

### Return:

* **NumberFormatter** 

## countryCode 
Gets the country code for formatter.
()

### Return:

* **String** 

## setCountryCode 
Sets the country code for formatter.
(countryCode)

### Params: 

* **String** *countryCode* 

### Return:

* **NumberFormatter** 

## currencyCode 
Gets the currency code for formatter.
()

### Return:

* **String** 

## setCurrencyCode 
Sets the currency code for formatter.
(currencyCode)

### Params: 

* **String** *currencyCode* 

### Return:

* **NumberFormatter** 

## currencySymbol 
Gets the currency symbol for formatter.
()

### Return:

* **String** 

## setCurrencySymbol 
Sets the currency symbol for formatter.
(currencySymbol)

### Params: 

* **String** *currencySymbol* 

### Return:

* **NumberFormatter** 

## _shouldShowNativeCurrencySymbol ()

### Return:

* **Boolean** 

## decimalSeparator 
Gets the decimal spearator for formatter.
()

### Return:

* **String** 

## setDecimalSeparator 
Sets the decimal spearator for formatter.
(decimalSeparator)

### Params: 

* **String** *decimalSeparator* 

### Return:

* **NumberFormatter** 

## groupingSeparator ()

### Return:

* **String** 

## setGroupingSeparator (groupingSeparator)

### Params: 

* **String** *groupingSeparator* 

### Return:

* **NumberFormatter** 

## groupingSize 
Gets the grouping size for formatter.
()

### Return:

* **Number** 

## setGroupingSize (groupingSize)

### Params: 

* **Number** *groupingSize* 

### Return:

* **NumberFormatter** 

## internationalCurrencySymbol ()

### Return:

* **String** 

## setInternationalCurrencySymbol (internationalCurrencySymbol)

### Params: 

* **String** *internationalCurrencySymbol* 

### Return:

* **NumberFormatter** 

## isLenient ()

### Return:

* **Boolean** 

## setLenient (lenient)

### Params: 

* **Boolean** *lenient* 

### Return:

* **NumberFormatter** 

## locale ()

### Return:

* **String** 

## setLocale (locale)

### Params: 

* **String** *locale* 

### Return:

* **NumberFormatter** 

## maximum ()

### Return:

* **Number** 

## setMaximum (max)

### Params: 

* **Number** *max* 

### Return:

* **NumberFormatter** 

## minimum ()

### Return:

* **Number** 

## setMinimum (min)

### Params: 

* **Number** *min* 

### Return:

* **NumberFormatter** 

## maximumFractionDigits ()

### Return:

* **Number** 

## setMaximumFractionDigits (maximumFractionDigits)

### Params: 

* **Number** *maximumFractionDigits* 

### Return:

* **NumberFormatter** 

## minimumFractionDigits ()

### Return:

* **Number** 

## setMinimumFractionDigits (minimumFractionDigits)

### Params: 

* **Number** *minimumFractionDigits* 

### Return:

* **NumberFormatter** 

## maximumIntegerDigits ()

### Return:

* **Number** 

## setMaximumIntegerDigits (maximumIntegerDigits)

### Params: 

* **Number** *maximumIntegerDigits* 

### Return:

* **NumberFormatter** 

## minimumIntegerDigits ()

### Return:

* **Number** 

## setMinimumIntegerDigits (minimumIntegerDigits)

### Params: 

* **Number** *minimumIntegerDigits* 

### Return:

* **NumberFormatter** 

## exponent ()

### Return:

* **Number** 

## setExponent (exponent)

### Params: 

* **Number** *exponent* 

### Return:

* **NumberFormatter** 

## negativeInfinitySymbol ()

### Return:

* **Number** 

## setNegativeInfinitySymbol (negativeInfinitySymbol)

### Params: 

* **Number** *negativeInfinitySymbol* 

### Return:

* **NumberFormatter** 

## negativePrefix ()

### Return:

* **String** 

## setNegativePrefix (prefix)

### Params: 

* **String** *prefix* 

### Return:

* **NumberFormatter** 

## negativeSuffix ()

### Return:

* **String** 

## setNegativeSuffix (prefix)

### Params: 

* **String** *prefix* 

### Return:

* **NumberFormatter** 

## notANumberSymbol ()

### Return:

* **String** 

## setNotANumberSymbol (notANumberSymbol)

### Params: 

* **String** *notANumberSymbol* 

### Return:

* **NumberFormatter** 

## nullSymbol ()

### Return:

* **String** 

## setNullSymbol (nullSymbol)

### Params: 

* **String** *nullSymbol* 

### Return:

* **NumberFormatter** 

## numberStyle ()

### Return:

* **String** 

## setNumberStyle (numberStyle)

### Params: 

* **String** *numberStyle* 

### Return:

* **NumberFormatter** 

## percentSymbol ()

### Return:

* **String** 

## setPercentSymbol (percentSymbol)

### Params: 

* **String** *percentSymbol* 

### Return:

* **NumberFormatter** 

## positiveInfinitySymbol ()

### Return:

* **String** 

## setPositiveInfinitySymbol (positiveInfinitySymbol)

### Params: 

* **String** *positiveInfinitySymbol* 

### Return:

* **NumberFormatter** 

## positivePrefix ()

### Return:

* **String** 

## setPositivePrefix (prefix)

### Params: 

* **String** *prefix* 

### Return:

* **NumberFormatter** 

## positiveSuffix ()

### Return:

* **String** 

## setPositiveSuffix (prefix)

### Params: 

* **String** *prefix* 

### Return:

* **NumberFormatter** 

## roundingMode ()

### Return:

* **Function** 

## setRoundingMode (roundingMode)

### Params: 

* **Function** *roundingMode* 

### Return:

* **NumberFormatter** 

## usesGroupingSeparator ()

### Return:

* **Boolean** 

## setUsesGroupingSeparator (usesGroupingSeparator)

### Params: 

* **Boolean** *usesGroupingSeparator* 

### Return:

* **NumberFormatter** 

## zeroSymbol ()

### Return:

* **String** 

## setZeroSymbol (zeroSymbol)

### Params: 

* **String** *zeroSymbol* 

### Return:

* **NumberFormatter** 

## _get (attr)

### Params: 

* **String** *attr* 

### Return:

* ***** 

## format (number)

### Params: 

* **Number** *number* 

### Return:

* **String** 

## _round (number)

### Params: 

* **Number** *number* 

### Return:

* **Number** 

## parse 
Will call parse on the formatter.(text, error)

### Params: 

* **String** *text* 
* **Function(String)** *error* 

### Return:

* **String** returns value with delimiters removed

## _parseAbsoluteValue (text, error)

### Params: 

* **String** *text* 
* **Function(String)** *error* 

### Return:

* **?Number** returns value with delimiters removed

## _currencyDefaults 
Gets defaults.
()

### Return:

* **Array** 

## _regionDefaults 
Gets defaults.
()

### Return:

* **Array** 

## _localeDefaults 
Gets defaults.
()

### Return:

* **Array** 

## _allowsFloats

Defaults

## stringFromNumber

Aliases

## Style

## StyleDefaults

## LocaleDefaults

## RegionDefaults

## CurrencyDefaults

<!-- End lib/number_formatter.js -->

