> [Wiki](Home) ▸ [Formatters](Formatters) ▸ **Delimited Text Formatter**

## Delimited Text Formatter
A generic delimited formatter. This is used as a base class for `DefaultCardFormatter`, `AmexCardFormatter`, `AdaptiveCardFormatter`, `ExpiryDateFormatter`, `PhoneFormatter`, and `SocialSecurityNumberFormatter`.

### Methods

#### <a name="delimiterAt" href="Delimited-Text-Formatter#delimiterAt">#</a> delimiterAt([_index_])
> @param {number} index  
> @returns {?string}
>
> Determines the delimiter character at the given index.

#### <a name="isDelimiter" href="Delimited-Text-Formatter#isDelimiter">#</a> isDelimiter()
> @param {string} chr  
> @returns {boolean}
>
> Determines whether the given character is a delimiter.