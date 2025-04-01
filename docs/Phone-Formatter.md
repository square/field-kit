> [Wiki](Home) ▸ [Formatters](Formatters) ▸ **Phone Formatter**

## Phone Formatter
Phone Formatter subclasses <a name="DelimitedTextFormatter" href="Delimited-Text-Formatter">DelimitedTextFormatter</a>. This formatter will guess the correct format when entering a phone number.

### Example
```js
formatter.format('4155551234')        // '(415) 555-1234'
formatter.format('14155551234')       // '1 (415) 555-1234'
formatter.format('+14155551234')      // '+1 (415) 555-1234'
formatter.format('1-415-555-1234')    // '1 (415) 555-1234'
formatter.format('1 (415) 555 1234')  // '1 (415) 555-1234'
formatter.format('1 (415) 555-1234')  // '1 (415) 555-1234'
formatter.format('415-555-1234')      // '(415) 555-1234'
```