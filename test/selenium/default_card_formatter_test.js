var By = require('selenium-webdriver').By;
var Key = require('selenium-webdriver').Key;
var until = require('selenium-webdriver').until;
var test = require('selenium-webdriver/testing');
var expect = require('chai').expect;
var server = require('./server');
var helpers = require('./helpers');

module.exports = function() {
  test.describe('FieldKit.DefaultCardFormatter', function() {
    var input;
    test.beforeEach(function() {
      server.goTo('default_card_formatter.html');
      input = driver.findElement(By.tagName('input'));
    });

    describe('typing', function() {
      test.it('adds a space after the first four digits', function() {
        helpers.setInput('411|', input);
        input.sendKeys('1');

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.raw).to.equal('4111 ');
          });
      });

      test.it('formats as Visa once it can tell it is a Visa card', function() {
        helpers.setInput('4111111', input);

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.fieldKit).to.equal('4111111');
            expect(values.raw).to.equal('4111 111');
          });
      });

      test.it('does not format as Amex', function() {
        helpers.setInput('372512345678901', input);

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.fieldKit).to.equal('372512345678901');
            expect(values.raw).to.equal('3725 1234 5678 901');
          });
      });

      test.it('formats it as the default if it cannot tell what it is', function() {
        helpers.setInput('1111111', input);

        return helpers.getFieldKitValues()
          .then(function(values) {
            expect(values.fieldKit).to.equal('1111111');
            expect(values.raw).to.equal('1111 111');
          });
      });
    });
  });
};
