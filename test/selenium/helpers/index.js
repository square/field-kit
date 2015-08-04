var Promise = require('promise');
var Selection = require('string-selection');
var Key = require('selenium-webdriver').Key;

exports.setInput = function(description, input) {
  var keys;

  if(description.indexOf('|') >= 0) {
    var selection = Selection.parseDescription(description);
    var start = selection.caret.start;
    var end = selection.caret.end;
    var affinity = selection.affinity;

    keys = [ selection.value ];
    var startOffset = (affinity) ?
      (selection.value.length - start) :
      (selection.value.length - end);

    for(var i = 0; i < startOffset; i++) {
      keys.push(Key.ARROW_LEFT);
    }

    for(var i = 0; i < (end - start); i++) {
      keys.push(
        Key.chord(
          Key.SHIFT,
          (affinity) ? Key.ARROW_RIGHT : Key.ARROW_LEFT
        )
      );
    }
  } else {
    keys = [ description ];
  }

  input.sendKeys.apply(input, keys);
};

exports.runJSMethod = function(method, fieldKitWindowVariable) {
  field = (fieldKitWindowVariable) ?
    fieldKitWindowVariable :
    'testField';

  var promise = new Promise(function (resolve, reject) {
    driver.executeScript('return window.' + field + '.' + method)
    .then(function(value) {
      resolve(value);
    });
  });

  return promise;
};

exports.getFieldKitValues = function(fieldKitWindowVariable) {
  field = (fieldKitWindowVariable) ?
    fieldKitWindowVariable :
    'testField';

  var promise = new Promise(function (resolve, reject) {
    Promise.all([
      exports.runJSMethod('value()', field),
      exports.runJSMethod('element.value', field)
    ])
      .then(function(responses) {
        resolve({
          fieldKit: responses[0],
          raw: responses[1]
        });
      });
  });

  return promise;
};
