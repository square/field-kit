> [Wiki](Home) ▸ **Developing**

## Setup
First, install the development dependencies:

```shell
$ npm install
```

Then, try running the tests:

```shell
$ npm test
```

## Development

As you make changes you may find it useful to have everything automatically
compiled and ready to test interactively in the browser. You can do that using
`script/develop`:

```shell
$ $(npm bin)/karma start
```

This will start Karma and a browser. It will rerun the tests anytime the files change.

_Note this will only run Unit Tests_

### Testing Notes

- The Unit Tests will run with a default UA of Chrome unless you use a helper that states otherwise.

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

We use [KeySim](https://github.com/eventualbuddha/keysim.js) in our test helpers to take care of this.