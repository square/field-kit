var By = require('selenium-webdriver').By;
var Key = require('selenium-webdriver').Key;
var until = require('selenium-webdriver').until;
var test = require('selenium-webdriver/testing');
var expect = require('chai').expect;
var server = require('./server');
var helpers = require('./helpers');

module.exports = function() {
  test.describe('FieldKit.ZipCodeFormatter', function() {
    var input;
    test.beforeEach(function() {
      server.goTo('zip_code_formatter.html');
      input = driver.findElement(By.tagName('input'));
    });

    test.it('places dashes in the right places', function() {
      helpers.setInput('|', input);

      input.sendKeys('123456789');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('12345-6789');
        });
    });

    test.it('prevents extra digits from being entered', function() {
      helpers.setInput('12345-6789|', input);

      input.sendKeys('0');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('12345-6789');
        });
    });

    test.it('prevents entering non-digit characters', function() {
      helpers.setInput('|', input);

      input.sendKeys('f');

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('');
        });
    });

    test.it('backspaces words correctly', function() {
      helpers.setInput('12345-6789|', input);

      input.sendKeys(Key.chord(Key.ALT, Key.BACK_SPACE));

      return helpers.getFieldKitValues()
        .then(function(values) {
          expect(values.raw).to.equal('12345-');
        });
    });
  });
};
