> [Wiki](Home) ▸ [Formatters](Formatters) ▸ **Expiry Date Formatter**

## Expiry Date Formatter
Expiry Date Formatter is a subclass of <a name="DelimitedTextFormatter" href="Delimited-Text-Formatter">DelimitedTextFormatter</a>. This formatter has a few helpers built into it. If you type a number greater than 1 as the first digit of the month it will insert a zero before the digit `4| -> 04|`. It will not allow the month `00` or months greater than 12. Parse will return an Object and do the hard work of turning a two digit year into a fully qualified year.