> [Wiki](Home) ▸ [Formatters](Formatters) ▸ **Credit Card Formatters**

![](https://cloud.githubusercontent.com/assets/967026/9753726/a9cc6346-5675-11e5-885d-4b9f2dd7d7ec.gif)

## Credit Card Formatters
This page describes the credit card formatters used by FieldKit, but most likely you'll simply want to use <a href="FieldKit-Fields#card-text-field">`CardTextField`</a>.

We have three types of credit card formatters that all subclass <a name="DelimitedTextFormatter" href="Delimited-Text-Formatter">`DelimitedTextFormatter`</a>. `DefaultCardFormatter`, `AmexCardFormatter`, and `AdaptiveCardFormatter`. None of these subclasses expose any extra methods or properties on top of those that `DelimitedTextFormatter` exposes.

### <a name="AmexCardFormatter" href="Credit-Card-Formatters#AmexCardFormatter">#</a> AmexCardFormatter
Amex Card Formatter is a credit card formatter that is specific to the American Express format. For example American Express card numbers are 15 characters long and generally separated into three groups, `3725 123456 78910`.

### <a name="DefaultCardFormatter" href="Credit-Card-Formatters#DefaultCardFormatter">#</a> DefaultCardFormatter
Default Card Formatter is a credit card formatter that is in a general format. Default card numbers are 16 characters long and generally separated into four groups, `4111 1111 1111 1111`.

### <a name="AdaptiveCardFormatter" href="Credit-Card-Formatters#AdaptiveCardFormatter">#</a> AdaptiveCardFormatter
Adaptive Card Formatter is a cool formatter that tries to make an intelligent decision on which formatter to use. The formatter will examine the PAN and decide if it is an Amex card number.
