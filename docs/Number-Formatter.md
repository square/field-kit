> [Wiki](Home) ▸ [Formatters](Formatters) ▸ **Number Formatter**

## Number Formatter
Formats and parses numbers. There are many configuration options for how to format numbers as strings, but for many users simply adjusting the [numberStyle](Number-Formatter#setNumberStyle), [locale](Number-Formatter#setLocale), [currencyCode](Number-Formatter#setCurrencyCode), and [countryCode](Number-Formatter#setCountryCode) values will be sufficient. NumberFormatter natively understands how to format numbers, currencies, and percentages for a variety of locales.

### Example Usage
```js
// Configure a NumberFormatter to display currencies.
var f = new FieldKit.NumberFormatter();
f.setNumberStyle(FieldKit.NumberFormatter.Style.CURRENCY);

// Configure the current locale info.
f.setLocale('en-US');
f.setCountryCode('US');
f.setCurrencyCode('USD');

// Showing USD in US uses abbreviated currency.
f.format(6.17);  // '$6.17'

// Showing CAD in US uses fully-qualified currency.
f.setCurrencyCode('CAD');
f.format(6.17);  // 'CA$6.17'

// Showing CAD in CA again uses abbreviated currency.
f.setLocale('en-CA');
f.setCountryCode('CA');
f.format(6.17);  // '$6.17'

// Showing CAD in CA to a French speaker uses correct formatting.
f.setLocale('fr-CA');
f.format(6.17);  // '6,17 $'

// You may customize the behavior of NumberFormatter to achieve whatever
// number formatting you need using the setter methods for the various
// settings, or you can use the {@link NumberFormatter#positiveFormat} and
// {@link NumberFormatter#negativeFormat} shorthand templates.

var f = new FieldKit.NumberFormatter();

// Using this template string…
f.setPositiveFormat('¤#0.00');

// …is equivalent to this:
f.setPositivePrefix('¤');
f.setPositiveSuffix('');
f.setMinimumIntegerDigits(1);
f.setMinimumFractionDigits(2);
f.setMaximumFractionDigits(2);

// And you can determine what the template string is for however you've
// configured the NumberFormatter:
f.setUsesGroupingSeparator(true);
f.setGroupingSize(2);
f.positiveFormat(); // '¤#,#0.00'
```

### Methods

#### <a name="allowsFloats" href="Number-Formatter#allowsFloats">#</a> allowsFloats()
> @returns {boolean}
>
> Gets whether this formatter will parse float number values. This value does not apply to formatting. To prevent formatting floats, set maximumFractionDigits to 0.

#### <a name="setAllowsFloats" href="Number-Formatter#setAllowsFloats">#</a> setAllowsFloats([_allowsFloats_])
> @param {boolean} allowsFloats  
> @returns {NumberFormatter}  
>
> Sets whether this formatter will parse float number values.

#### <a name="alwaysShowsDecimalSeparator" href="Number-Formatter#alwaysShowsDecimalSeparator">#</a> alwaysShowsDecimalSeparator()
> @returns {boolean}
>
> Gets whether this formatter should show the decimal separator.

#### <a name="setAlwaysShowsDecimalSeparator" href="Number-Formatter#setAlwaysShowsDecimalSeparator">#</a> setAlwaysShowsDecimalSeparator([_bool_])
> @param {boolean} alwaysShowsDecimalSeparator  
> @returns {NumberFormatter} 
>
> Sets whether this formatter will show the decimal separator.

#### <a name="countryCode" href="Number-Formatter#countryCode">#</a> countryCode()
> @returns {string}
>
> Gets the country code for formatter.

#### <a name="setCountryCode" href="Number-Formatter#setCountryCode">#</a> setCountryCode([_countryCode_])
> @param {string} countryCode  
> @returns {NumberFormatter}
>
> Sets the country code for formatter.

#### <a name="currencyCode" href="Number-Formatter#currencyCode">#</a> currencyCode()
> @returns {string}
>
> Gets the currency code for formatter.

#### <a name="setCurrencyCode" href="Number-Formatter#setCurrencyCode">#</a> setCurrencyCode([_currencyCode_])
> @param {string} currencyCode  
> @returns {NumberFormatter}
>
> Sets the currency code for formatter.

#### <a name="currencySymbol" href="Number-Formatter#currencySymbol">#</a> currencySymbol()
> @returns {string}
>
> Gets the currency symbol for formatter.

#### <a name="setCurrencySymbol" href="Number-Formatter#setCurrencySymbol">#</a> setCurrencySymbol([currencySymbol])
> @param {string} currencySymbol  
> @returns {NumberFormatter}
>
> Sets the currency symbol for formatter.

#### <a name="decimalSeparator" href="Number-Formatter#decimalSeparator">#</a> decimalSeparator()
> @returns {string}
>
> Gets the decimal separator for formatter.

#### <a name="setDecimalSeparator" href="Number-Formatter#setDecimalSeparator">#</a> setDecimalSeparator([_decimalSeparator_])
> @param {string} decimalSeparator  
> @returns {NumberFormatter}
>
> Sets the decimal separator for formatter.

#### <a name="exponent" href="Number-Formatter#exponent">#</a> exponent()
> @returns {string}
>
> Gets the number of decimal places to shift numbers before formatting.

#### <a name="setExponent" href="Number-Formatter#setExponent">#</a> setExponent([_exponent_])
> @param exponent  
> @returns {NumberFormatter}
>
> Sets the number of decimal places to shift numbers before formatting.

#### <a name="groupingSeparator" href="Number-Formatter#groupingSeparator">#</a> groupingSeparator()
> @returns {string}
>
> Gets the grouping separator for formatter.

#### <a name="setGroupingSeparator" href="Number-Formatter#setGroupingSeparator">#</a> setGroupingSeparator([_groupingSeparator_])
> @param {string} groupingSeparator  
> @returns {NumberFormatter}
>
> Sets the grouping separator for formatter.

#### <a name="groupingSize" href="Number-Formatter#groupingSize">#</a> groupingSize()
> @returns {number}
>
> Gets the grouping size for formatter.
 
#### <a name="setGroupingSize" href="Number-Formatter#setGroupingSize">#</a> setGroupingSize([_groupingSize_])
> @param {number} groupingSize  
> @returns {NumberFormatter}
>
> Sets the grouping size for formatter.
 
#### <a name="internationalCurrencySymbol" href="Number-Formatter#internationalCurrencySymbol">#</a> internationalCurrencySymbol()
> @returns {string}
>
> Gets the international Currency Symbol for formatter.

#### <a name="setInternationalCurrencySymbol" href="Number-Formatter#setInternationalCurrencySymbol">#</a> setInternationalCurrencySymbol([_internationalCurrencySymbol_])
> @param {string} internationalCurrencySymbol  
> @returns {NumberFormatter}
>
> Sets the international Currency Symbol for formatter.

#### <a name="isLenient" href="Number-Formatter#isLenient">#</a> isLenient()
> @returns {boolean}
>
> Gets if the formatter is lenient.

#### <a name="setLenient" href="Number-Formatter#setLenient">#</a> setLenient([_lenient_])
> @param {boolean} lenient  
> @returns {NumberFormatter}
>
> Sets if the formatter is lenient.

#### <a name="locale" href="Number-Formatter#locale">#</a> locale()
> @returns {string}
>
> Gets the locale identifier for which this formatter is currently configured to format strings. This setting controls default settings such as the grouping separator character, decimal separator character, placement of currency and percent symbols, etc.

#### <a name="setLocale" href="Number-Formatter#setLocale">#</a> setLocale([_locale_])
> @param {string} locale  
> @returns {NumberFormatter}
>
> Sets the locale identifier for which this formatter is currently configured to format strings. This setting controls default settings such as the grouping separator character, decimal separator character, placement of currency and percent symbols, etc.
 
#### <a name="maximum" href="Number-Formatter#maximum">#</a> maximum()
> @returns {number}
>
> Gets the maximum of the formatter.

#### <a name="setMaximum" href="Number-Formatter#setMaximum">#</a> setMaximum([_max_])
> @param {number} max  
> @returns {NumberFormatter}
>
> Sets the maximum of the formatter.
  
#### <a name="minimum" href="Number-Formatter#minimum">#</a> minimum()
> @returns {number}
>
> Gets the minimum of the formatter.

#### <a name="setMinimum" href="Number-Formatter#setMinimum">#</a> setMinimum([min])
> @param {number} min  
> @returns {NumberFormatter}
>
> Sets the minimum of the formatter.

#### <a name="maximumFractionDigits" href="Number-Formatter#maximumFractionDigits">#</a> maximumFractionDigits()
> @returns {number}
>
> Gets the maximum Fraction Digits of the formatter.

#### <a name="setMaximumFractionDigits" href="Number-Formatter#setMaximumFractionDigits">#</a> setMaximumFractionDigits([maximumFractionDigits])
> @param {number} maximumFractionDigits  
> @returns {NumberFormatter}
>
> Sets the maximum Fraction Digits of the formatter.

#### <a name="minimumFractionDigits" href="Number-Formatter#minimumFractionDigits">#</a> minimumFractionDigits()
> @returns {number}
>
> Gets the minimum Fraction Digits of the formatter.

#### <a name="setMinimumFractionDigits" href="Number-Formatter#setMinimumFractionDigits">#</a> setMinimumFractionDigits([minimumFractionDigits])
> @param {number} minimumFractionDigits  
> @returns {NumberFormatter}
>
> Sets the minimum Fraction Digits of the formatter.
 
#### <a name="maximumIntegerDigits" href="Number-Formatter#maximumIntegerDigits">#</a> maximumIntegerDigits()
> @returns {number}
>
> Gets the maximum Integer Digits of the formatter.

#### <a name="setMaximumIntegerDigits" href="Number-Formatter#setMaximumIntegerDigits">#</a> setMaximumIntegerDigits([maximumIntegerDigits])
> @param {number} maximumIntegerDigits  
> @returns {NumberFormatter}
>
> Sets the maximum Integer Digits of the formatter.
 
#### <a name="minimumIntegerDigits" href="Number-Formatter#minimumIntegerDigits">#</a> minimumIntegerDigits()
> @returns {number}
>
> Gets the minimum Integer Digits of the formatter.

#### <a name="minimumIntegerDigits" href="Number-Formatter#minimumIntegerDigits">#</a> minimumIntegerDigits([minimumIntegerDigits])
> @param {number} minimumIntegerDigits  
> @returns {NumberFormatter}
>
> Sets the minimum Integer Digits of the formatter.
 
#### <a name="minusSign" href="Number-Formatter#minusSign">#</a> minusSign()
> @returns {?string}
>
> Gets the minus sign used for negative numbers in some locales.

#### <a name="setMinusSign" href="Number-Formatter#setMinusSign">#</a> setMinusSign([minusSign])
> @param {?string} minusSign  
> @returns {NumberFormatter}
>
> Sets the minus sign used for negative numbers in some locales.
  
#### <a name="negativeFormat" href="Number-Formatter#negativeFormat">#</a> negativeFormat()
> @returns {string}
>
> Gets the negative number format string for the current settings. For example, changing `minimumFractionDigits` from 0 to 3 would change this value from "-#" to "-#.000".

#### <a name="setNegativeFormat" href="Number-Formatter#setNegativeFormat">#</a> setNegativeFormat([negativeFormat])
> @param {string} negativeFormat  
> @returns null
>
> Configures this number formatter according to the given format string. For most usages you should simply use {@link NumberFormatter#setPositiveFormat} and configure the negative prefix and suffix separately.

#### <a name="negativeInfinitySymbol" href="Number-Formatter#negativeInfinitySymbol">#</a> negativeInfinitySymbol()
> @returns {string}

#### <a name="setNegativeInfinitySymbol" href="Number-Formatter#setNegativeInfinitySymbol">#</a> setNegativeInfinitySymbol(negativeInfinitySymbol)
> @param {string} negativeInfinitySymbol  
> @returns {NumberFormatter}

#### <a name="negativePrefix" href="Number-Formatter#negativePrefix">#</a> negativePrefix()
> @returns {string}

#### <a name="setNegativePrefix" href="Number-Formatter#setNegativePrefix">#</a> setNegativePrefix(prefix)
> @param {string} prefix  
> @returns {NumberFormatter}

#### <a name="negativeSuffix" href="Number-Formatter#negativeSuffix">#</a> negativeSuffix()
> @returns {string}

#### <a name="setNegativeSuffix" href="Number-Formatter#setNegativeSuffix">#</a> setNegativeSuffix(prefix)
> @param {string} prefix  
> @returns {NumberFormatter}

#### <a name="notANumberSymbol" href="Number-Formatter#notANumberSymbol">#</a> notANumberSymbol()
> @returns {string}

#### <a name="setNotANumberSymbol" href="Number-Formatter#setNotANumberSymbol">#</a> setNotANumberSymbol(notANumberSymbol)
> @param {string} notANumberSymbol  
> @returns {NumberFormatter}

#### <a name="nullSymbol" href="Number-Formatter#nullSymbol">#</a> nullSymbol()
> @returns {string}

#### <a name="setNullSymbol" href="Number-Formatter#setNullSymbol">#</a> setNullSymbol(nullSymbol)
> @param {string} nullSymbol  
> @returns {NumberFormatter}

#### <a name="numberStyle" href="Number-Formatter#numberStyle">#</a> numberStyle()
> @returns {NumberFormatter.Style}
>
> Gets the number style used to configure various default setting values.

#### <a name="setNumberStyle" href="Number-Formatter#setNumberStyle">#</a> setNumberStyle(numberStyle)
> @param {string} numberStyle  
> @returns {NumberFormatter}
>
> Sets the number style used to configure various default setting values.

#### <a name="percentSymbol" href="Number-Formatter#percentSymbol">#</a> percentSymbol()
> @returns {string}

#### <a name="setPercentSymbol" href="Number-Formatter#setPercentSymbol">#</a> setPercentSymbol(percentSymbol)
> @param {string} percentSymbol  
> @returns {NumberFormatter}

#### <a name="plusSign" href="Number-Formatter#plusSign">#</a> plusSign()
> @returns {string}
>
> Gets the plus sign used in positive numbers in some locales.

#### <a name="setPlusSign" href="Number-Formatter#setPlusSign">#</a> setPlusSign(plusSign)
> @param {?string} plusSign  
> @returns {NumberFormatter}
>
> Sets the plus sign used in positive numbers in some locales.

#### <a name="positiveFormat" href="Number-Formatter#positiveFormat">#</a> positiveFormat()
> @return {string}
>
> Gets the positive number format string for the current settings. For
> example, changing `minimumFractionDigits` from 0 to 3 would change this
> value from "#" to "#.000".

#### <a name="setPositiveFormat" href="Number-Formatter#setPositiveFormat">#</a> setPositiveFormat('00.000')
> @param positiveFormat
>
> Configures this number formatter according to the given format string.

#### <a name="positiveInfinitySymbol" href="Number-Formatter#positiveInfinitySymbol">#</a> positiveInfinitySymbol()
> @returns {string}

#### <a name="setPositiveInfinitySymbol" href="Number-Formatter#setPositiveInfinitySymbol">#</a> setPositiveInfinitySymbol(positiveInfinitySymbol)
> @param {string} positiveInfinitySymbol  
> @returns {NumberFormatter}

#### <a name="positivePrefix" href="Number-Formatter#positivePrefix">#</a> positivePrefix()
> @returns {string}

#### <a name="setPositivePrefix" href="Number-Formatter#setPositivePrefix">#</a> setPositivePrefix(prefix)
> @param {string} prefix  
> @returns {NumberFormatter}

#### <a name="positiveSuffix" href="Number-Formatter#positiveSuffix">#</a> positiveSuffix()
> @returns {string}

#### <a name="setPositiveSuffix" href="Number-Formatter#setPositiveSuffix">#</a> setPositiveSuffix(prefix)
> @param {string} prefix  
> @returns {NumberFormatter}

#### <a name="roundingMode" href="Number-Formatter#roundingMode">#</a> roundingMode()
> @returns {Function}

#### <a name="setRoundingMode" href="Number-Formatter#setRoundingMode">#</a> setRoundingMode(roundingMode)
> @param {Function} roundingMode  
> @returns {NumberFormatter}

#### <a name="usesGroupingSeparator" href="Number-Formatter#usesGroupingSeparator">#</a> usesGroupingSeparator()
> @returns {boolean}

#### <a name="setUsesGroupingSeparator" href="Number-Formatter#setUsesGroupingSeparator">#</a> setUsesGroupingSeparator(usesGroupingSeparator)
> @param {boolean} usesGroupingSeparator  
> @returns {NumberFormatter}

#### <a name="zeroSymbol" href="Number-Formatter#zeroSymbol">#</a> zeroSymbol()
> @returns {string}

#### <a name="setZeroSymbol" href="Number-Formatter#setZeroSymbol">#</a> setZeroSymbol(zeroSymbol)
> @param {string} zeroSymbol  
> @returns {NumberFormatter}

### Properties

#### <a name="Style-NONE" href="Number-Formatter#Style-NONE">#</a> NumberFormatter.Style.NONE
#### <a name="Style-CURRENCY" href="Number-Formatter#Style-CURRENCY">#</a> NumberFormatter.Style.CURRENCY
#### <a name="Style-PERCENT" href="Number-Formatter#Style-PERCENT">#</a> NumberFormatter.Style.PERCENT

#### <a name="Rounding-CEILING" href="Number-Formatter#Rounding-CEILING">#</a> NumberFormatter.Rounding.CEILING
#### <a name="Rounding-DOWN" href="Number-Formatter#Rounding-DOWN">#</a> NumberFormatter.Rounding.DOWN
#### <a name="Rounding-FLOOR" href="Number-Formatter#Rounding-FLOOR">#</a> NumberFormatter.Rounding.FLOOR
#### <a name="Rounding-HALF_DOWN" href="Number-Formatter#Rounding-HALF_DOWN">#</a> NumberFormatter.Rounding.HALF_DOWN
#### <a name="Rounding-HALF_EVEN" href="Number-Formatter#Rounding-HALF_EVEN">#</a> NumberFormatter.Rounding.HALF_EVEN
#### <a name="Rounding-HALF_UP" href="Number-Formatter#Rounding-HALF_UP">#</a> NumberFormatter.Rounding.HALF_UP
#### <a name="Rounding-UP" href="Number-Formatter#Rounding-UP">#</a> NumberFormatter.Rounding.UP