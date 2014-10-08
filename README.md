# FieldKit

FieldKit lets you take control of your text fields.

## Usage

You can use npm, bower, or simply copy field-kit.js into your project. Once in
your project you use FieldKit by wrapping a jQuery-wrapped input with a
`FieldKit.TextField` instance:

```js
var field = new FieldKit.TextField($('#ssn'));
field.setValue('123-45-6789');
```

## Formatting

### Demo

See examples of built-in formatters and fields at [the demo page][demo-page].

### Documentation
Please see our [documentation](docs/) for a more in depth overview.

### What are Formatters?

Formatters provide two main methods: `parse()` and `format()`. `parse()` takes
a string and returns the value represented by that string, e.g. a `Date` object
if the formatter provided date and time formatting. `format()` takes an object
of the same type `parse()` returns and turns it into a string representation
suitable for display to or editing by an end user.

Formatters may also assist with as-you-type editing by implementing the
`isChangeValid()` method which can by used to prevent or alter changes to a
text field that would make the value invalid.

FieldKit comes bundled with a few useful formatters, such as
`FieldKit.NumberFormatter`, which implements `isChangeValid()` to help users to
only enter valid numbers:

```js
var field = new FieldKit.TextField($('#quantity'),
              new FieldKit.NumberFormatter()
                .setMinimum(0)
                .setMaximum(10))
              .setValue(quantity);
```

`NumberFormatter` can format integers, decimals (safely using
[stround][stround]), percentages, and currency amounts. Use `#setNumberStyle()`
to choose which style to use.

`FieldKit.Formatter` and its subclasses are modeled after Cocoa's
[`NSFormatter`][nsformatter] class and its subclasses. They share many of the
same API methods and relationships with other objects, so any guides and
documentation for use Cocoa formatting may be useful in understanding how
FieldKit works.

## Testing with FieldKit

In your application's acceptance tests you'll want to ensure that your FieldKit
fields interact with your application properly. To do this you'll need to
simulate user interaction more precisely than you may be used to in the past.
For example, you can't simply use jQuery to set the value of an input and
trigger its "change" event. You'll want to trigger the same set of events that
a user would trigger when editing the field. Here's an example of entering an
"a" into a field and then backspacing it immediately:

* `focusin`
* `focus`
* `keydown keyCode=65`
* `keypress keyCode=97`
* `keyup keyCode=65`
* `keydown keyCode=8`
* `keyup keyCode=8`
* `blur`
* `focusout`

You can trigger these events however you like, but it makes sense to have
helpers for entering text that do the right thing and then use them everywhere.

## Contributing

### Setup

Prerequisites:

* closure-compiler (`$ brew install closure-compiler`)

First, install the development dependencies:

```
$ npm --registry http://npm.corp.squareup.com:8000 install
```

Then, try running the tests:

```
$ npm test
```

### Development

As you make changes you may find it useful to have everything automatically
compiled and ready to test interactively in the browser. You can do that using
`script/develop`:

```
$ ./script/develop
```

That will run the tests in PhantomJS whenever files are changed. You can run
the tests in other browsers by opening http://localhost:9876/.

### Pull Requests

Contributions via pull requests are very welcome! Follow the steps in
Developing above, then add your feature or bugfix with tests to cover it, push
to a branch, and open a pull request. Don't worry about rebuilding
dist/field-kit.js. If you need to for some reason, run `npm run build`.
[demo-page]: https://stash.corp.squareup.com/www/JS/field-kit/gh-pages/
[nsformatter]: https://developer.apple.com/library/mac/documentation/cocoa/reference/foundation/classes/NSFormatter_Class/Reference/Reference.html
[stround]: https://github.com/square/stround
