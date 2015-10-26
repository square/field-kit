var By = require('selenium-webdriver').By;
var Key = require('selenium-webdriver').Key;
var until = require('selenium-webdriver').until;
var test = require('selenium-webdriver/testing');
var expect = require('chai').expect;
var server = require('./server');
var helpers = require('./helpers');

module.exports = function(ua) {
  test.describe('FieldKit.ExpiryDateFormatter', function() {
    var input;
    test.beforeEach(function() {
      server.goTo('expiry_date_formatter.html');
      input = driver.findElement(By.tagName('input'));
    });

    test.it('adds a preceding zero and a succeeding slash if an unambiguous month is typed', function() {
      helpers.setInput('|', input);

      input.sendKeys('4');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('04/');
        });
    });

    test.it('does not add anything when the typed first character is an ambiguous month', function() {
      helpers.setInput('|', input);

      input.sendKeys('1');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('1');
        });
    });

    test.it('adds a slash after 10 is typed', function() {
      helpers.setInput('1|', input);

      input.sendKeys('0');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('10/');
        });
    });

    test.it('adds a slash after 07 is typed', function() {
      helpers.setInput('0|', input);

      input.sendKeys('7');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('07/');
        });
    });

    test.it('adds a preceding zero when a slash is typed after an ambiguous month', function() {
      helpers.setInput('1|', input);

      input.sendKeys('/');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('01/');
        });
    });

    test.it('prevents 00 as a month', function() {
      helpers.setInput('0|', input);

      input.sendKeys('0');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('0');
        });
    });

    test.it('prevents entry of an invalid two-digit month', function() {
      helpers.setInput('1|', input);

      input.sendKeys('3');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('1');
        });
    });

    test.it('prevents entry of an additional slash', function() {
      helpers.setInput('11/|', input);

      input.sendKeys('/');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('11/');
        });
    });

    test.it('allows any two digits for the year', function() {
      helpers.setInput('11/|', input);

      input.sendKeys('098');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('11/09');
        });
    });

    test.it('allows backspacing ignoring the slash', function() {
      helpers.setInput('11/|', input);

      input.sendKeys(Key.BACK_SPACE);

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('1');
        });
    });

    test.it('allows backspacing words to delete just the year', function() {
      helpers.setInput('11/14|', input);

      input.sendKeys(Key.chord(Key.ALT, Key.BACK_SPACE));

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('11/');
        });
    });

    test.it('backspaces to the beginning if the last character after backspacing is 0', function() {
      helpers.setInput('01/|', input);

      input.sendKeys(Key.BACK_SPACE);

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('');
        });
    });

    test.it('allows typing a character matching the suffix that hits the end of the allowed input', function() {
      helpers.setInput('12/1|', input);

      input.sendKeys('1');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('12/11');
        });
    });

    test.it('selecting all and typing a non number', function() {
      helpers.setInput('12/11|', input);
      return helpers.runJSMethod('element.setSelectionRange(0, 9999);')
        .then(function() {
          input.sendKeys('f');

          return helpers.getFieldKitValues()
            .then(function(values) {
              expect(values.raw).to.equal('12/11');
            });
        });
    });

    if(ua === 'DEFAULT') {
      test.it('full selecting and typing', function() {
        helpers.setInput('12/12', input);
        var element = 'window.testField.element';

        return driver.executeScript(element + '.selectionStart = 0; ' + element + '.selectionEnd = 7;')
          .then(function() {
            input.sendKeys('444');

            return helpers.getFieldKitValues()
              .then(function(values) {
                expect(values.raw).to.equal('04/44');
              });
          });
      });
    }
  });
};
