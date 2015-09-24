var By = require('selenium-webdriver').By;
var Key = require('selenium-webdriver').Key;
var until = require('selenium-webdriver').until;
var test = require('selenium-webdriver/testing');
var expect = require('chai').expect;
var server = require('./server');
var helpers = require('./helpers');

module.exports = function() {
  test.describe('FieldKit.DelimiterFormatter', function() {
    var leadingInput, consecutiveInput, lazyInput;
    test.beforeEach(function() {
      server.goTo('delimited_text_formatter.html');
      leadingInput = driver.findElement(By.id('leading-input'));
      consecutiveInput = driver.findElement(By.id('consecutive-input'));
      lazyInput = driver.findElement(By.id('lazy-input'));
    });

    describe('leading delimiter', function() {
      test.it('backspaces both the character leading delimiter', function() {
        helpers.setInput('-1|', leadingInput);

        leadingInput.sendKeys(Key.BACK_SPACE);

        return helpers.getFieldKitValues('leadingField')
          .then(function(values) {
            expect(values.raw).to.equal('');
          });
      });

      test.it('adds a delimiter wherever they need to be', function() {
        helpers.setInput('-41|', leadingInput);

        leadingInput.sendKeys('1');

        return helpers.getFieldKitValues('leadingField')
          .then(function(values) {
            expect(values.raw).to.equal('-411-');
          });
      });

      describe('backspaces both the space and the character before it', function() {
        test.it('cursor at the end', function() {
          helpers.setInput('-411-|', leadingInput);

          leadingInput.sendKeys(Key.BACK_SPACE);

          return helpers.getFieldKitValues('leadingField')
            .then(function(values) {
              expect(values.raw).to.equal('-41');
            });
        });

        test.it('nummber at the end', function() {
          helpers.setInput('-123-|4', leadingInput);

          leadingInput.sendKeys(Key.BACK_SPACE);

          return helpers.getFieldKitValues('leadingField')
            .then(function(values) {
              expect(values.raw).to.equal('-124-');
            });
        });
      });

      describe('allows backspacing a whole group of digits', function() {
        test.it('cursor at the end', function() {
          helpers.setInput('-411-111-|', leadingInput);

          leadingInput.sendKeys(Key.chord(Key.ALT, Key.BACK_SPACE));

          return helpers.getFieldKitValues('leadingField')
            .then(function(values) {
              expect(values.raw).to.equal('-411-');
            });
        });

        test.it('number at the end', function() {
          helpers.setInput('-411-1|1', leadingInput);

          leadingInput.sendKeys(Key.chord(Key.ALT, Key.BACK_SPACE));

          return helpers.getFieldKitValues('leadingField')
            .then(function(values) {
              expect(values.raw).to.equal('-411-1');
            });
        });
      });

      it('prevents entering the delimiter character', function() {
        helpers.setInput('-123-456|', leadingInput);

        leadingInput.sendKeys('-');

        return helpers.getFieldKitValues('leadingField')
          .then(function(values) {
            expect(values.raw).to.equal('-123-456-');
          });
      });
    });


    describe('consecutive delimiter', function() {
      describe('adds consecutive delimiters where needed', function() {
        test.it('nothing to start with', function() {
          helpers.setInput('|', consecutiveInput);

          consecutiveInput.sendKeys('3');

          return helpers.getFieldKitValues('consecutiveField')
            .then(function(values) {
              expect(values.raw).to.equal('-3--');
            });
        });

        test.it('something to start with', function() {
          helpers.setInput('-1--2|', consecutiveInput);

          consecutiveInput.sendKeys('3');

          return helpers.getFieldKitValues('consecutiveField')
            .then(function(values) {
              expect(values.raw).to.equal('-1--23--');
            });
        });
      });

      describe('backspaces character and all consecutive delimiters', function() {
        test.it('delete first set of consecutive delimiters', function() {
          helpers.setInput('-3--|', consecutiveInput);

          consecutiveInput.sendKeys(Key.BACK_SPACE);

          return helpers.getFieldKitValues('consecutiveField')
            .then(function(values) {
              expect(values.raw).to.equal('');
            });
        });

        test.it('delete second set of consecutive delimiters', function() {
          helpers.setInput('-1--23--|', consecutiveInput);

          consecutiveInput.sendKeys(Key.BACK_SPACE);

          return helpers.getFieldKitValues('consecutiveField')
            .then(function(values) {
              expect(values.raw).to.equal('-1--2');
            });
        });
      });
    });

    describe('lazy delimiter', function() {
      describe('adds delimiters at the end only when typing past delimiter', function() {
        test.it('no delimiter', function() {
          helpers.setInput('1|', lazyInput);

          lazyInput.sendKeys('2');

          return helpers.getFieldKitValues('lazyField')
            .then(function(values) {
              expect(values.raw).to.equal('12');
            });
        });

        test.it('with delimiter', function() {
          helpers.setInput('12|', lazyInput);

          lazyInput.sendKeys('3');

          return helpers.getFieldKitValues('lazyField')
            .then(function(values) {
              expect(values.raw).to.equal('12--3');
            });
        });
      });
    });
  });
};
