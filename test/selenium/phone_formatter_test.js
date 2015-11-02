var By = require('selenium-webdriver').By;
var Key = require('selenium-webdriver').Key;
var until = require('selenium-webdriver').until;
var test = require('selenium-webdriver/testing');
var expect = require('chai').expect;
var server = require('./server');
var helpers = require('./helpers');

module.exports = function(ua) {
  test.describe('FieldKit.PhoneFormatter', function() {
    var input;
    test.beforeEach(function() {
      server.goTo('phone_formatter.html');
      input = driver.findElement(By.tagName('input'));
    });

    describe('adds a ( before the first digit', function() {
      test.it('with nothing to start', function() {
        helpers.setInput('|', input);

        input.sendKeys('4');

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('(4');
          });
      });

      test.it('with something to start', function() {
        helpers.setInput('(4|', input);

        input.sendKeys('1');

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('(41');
          });
      });
    });

    test.it('backspaces both the digit leading delimiter', function() {
      helpers.setInput('(4|', input);

      input.sendKeys(Key.BACK_SPACE);

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('');
        });
    });

    test.it('adds a delimiter wherever they need to be', function() {
      helpers.setInput('(41|', input);

      input.sendKeys('5');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('(415) ');
        });
    });

    test.it('groups digits into four groups of four separated by spaces', function() {
      helpers.setInput('|', input);

      input.sendKeys('415555');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('(415) 555-');
        });
    });

    describe('backspaces all delimiters and the character before it', function() {
      test.it('at the end', function() {
        helpers.setInput('(415) |', input);

        input.sendKeys(Key.BACK_SPACE);

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('(41');
          });
      });

      test.it('in the middle', function() {
        helpers.setInput('(213) |4', input);

        input.sendKeys(Key.BACK_SPACE);

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('(214) ');
          });
      });
    });

    describe('allows backspacing a whole group of digits', function() {
      test.it('at the end', function() {
        helpers.setInput('(411) 111-|', input);

        input.sendKeys(Key.chord(Key.ALT, Key.BACK_SPACE));

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('(411) ');
          });
      });

      test.it('digit at the end', function() {
        helpers.setInput('(411) 1|1', input);

        input.sendKeys(Key.chord(Key.ALT, Key.BACK_SPACE));

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('(411) 1');
          });
      });
    });

    describe('prevents entering the delimiter character', function() {
      test.it('typing (', function() {
        helpers.setInput('(', input);

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('');
          });
      });

      test.it('typing space', function() {
        helpers.setInput('(213) |', input);

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('(213) ');
          });
      });

      test.it('typing -', function() {
        helpers.setInput('(213) 456-|', input);

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('(213) 456-');
          });
      });
    });

    if(ua === 'DEFAULT') {
      describe('deletes the correct character', function() {
        test.it('deleting the country code', function() {
          helpers.setInput('+1 (234) 567-8910', input);
          var element = 'window.testField.element';

          return driver.executeScript('return ' + element + '.selectionStart = ' + element + '.selectionEnd = 4')
            .then(function() {
              input.sendKeys(Key.BACK_SPACE);

              return helpers.getFieldKitValues()
                .then(function(values) {
                  expect(values.raw).to.equal('+234 (567) 891-0');
                });
            });
        });

        test.it('deleting the country code', function() {
          helpers.setInput('1 (888) 888-8888', input);
          var element = 'window.testField.element';

          return driver.executeScript('return ' + element + '.selectionStart = ' + element + '.selectionEnd = 1')
            .then(function() {
              input.sendKeys(Key.BACK_SPACE);

              return helpers.getFieldKitValues()
                .then(function(values) {
                  expect(values.raw).to.equal('(888) 888-8888');
                });
            });
        });

        test.it('deleting the space after the country code', function() {
          helpers.setInput('1 (888) 888-8888', input);
          var element = 'window.testField.element';

          return driver.executeScript('return ' + element + '.selectionStart = ' + element + '.selectionEnd = 2')
            .then(function() {
              input.sendKeys(Key.BACK_SPACE);

              return helpers.getFieldKitValues()
                .then(function(values) {
                  expect(values.raw).to.equal('(888) 888-8888');
                });
            });
        });
      });
    }
  });
};
